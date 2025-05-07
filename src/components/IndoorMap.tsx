import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ControlPanel from "./ControlPanel";
import IndoorFeatures from "./IndoorFeatures";
import EntityList from "./EntityList";
import { config } from "../config";
import { featureStorage } from "../services/featureStorage";
import type { IndoorFeature, FeatureType } from "../types";

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface IndoorMapProps {
  center: [number, number];
  zoom: number;
  level: number;
}

const MapController = ({ center, zoom }: IndoorMapProps) => {
  const map = useMap();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Only set the initial view on first mount
    if (isInitialMount.current) {
      map.setView(center, zoom);
      isInitialMount.current = false;
    }
  }, [center, zoom, map]);

  return null;
};

// Helper function to calculate the center of a polygon
const calculateCenter = (coordinates: [number, number][]): [number, number] => {
  if (coordinates.length === 0) {
    return [0, 0];
  }

  const sum = coordinates.reduce(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0]
  );
  return [sum[0] / coordinates.length, sum[1] / coordinates.length];
};

const IndoorMap = ({
  center: initialCenter,
  zoom: initialZoom,
  level: initialLevel = 1,
}: IndoorMapProps) => {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [features, setFeatures] = useState<IndoorFeature[]>(() =>
    featureStorage.loadFeatures()
  );
  const [drawingMode, setDrawingMode] = useState<FeatureType | null>(null);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [featureHistory, setFeatureHistory] = useState<IndoorFeature[][]>([]);

  const [currentLabel, setCurrentLabel] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(
    null
  );
  const mapRef = useRef<L.Map | null>(null);
  const maxLevel = 2;
  const isInitialLoad = useRef(true);
  const [editingFeature, setEditingFeature] = useState<IndoorFeature | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editingCoords, setEditingCoords] = useState<[number, number][]>([]);
  const [editFillColor, setEditFillColor] = useState("#4CAF50");
  const [editBorderColor, setEditBorderColor] = useState("#000000");

  // Save features whenever they change
  useEffect(() => {
    featureStorage.saveFeatures(features);
  }, [features]);

  // Handle initial URL parameters after data is loaded
  useEffect(() => {
    if (!isInitialLoad.current) return;

    const params = new URLSearchParams(window.location.search);
    const entityId = params.get("entity");

    if (entityId) {
      const feature = features.find((f) => f.id === entityId);
      if (feature) {
        setCurrentLevel(feature.level);
        setMapCenter(calculateCenter(feature.coordinates));
      }
    }
    isInitialLoad.current = false;
  }, [features]);

  // Handle feature selection and URL updates
  const handleFeatureSelect = (feature: IndoorFeature) => {
    if (mapRef.current) {
      const center = calculateCenter(feature.coordinates);
      mapRef.current.setView(center, 20);

      // Update URL with entity ID
      const url = new URL(window.location.href);
      url.searchParams.set("entity", feature.id);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleLevelChange = (newLevel: number) => {
    if (newLevel >= 1 && newLevel <= maxLevel) {
      setCurrentLevel(newLevel);
    }
  };

  const handleAddFeature = (type: FeatureType) => {
    setDrawingMode(type);
    setCurrentPoints([]);
    setCurrentLabel("");
  };

  const handlePointAdd = (point: [number, number]) => {
    if (drawingMode) {
      setCurrentPoints([...currentPoints, point]);
    }
  };

  const handleCompleteDrawing = () => {
    if (drawingMode === "point") {
      if (currentPoints.length >= 1) {
        const newFeature: IndoorFeature = {
          id: `feature-${Date.now()}`,
          type: "point",
          level: currentLevel,
          coordinates: currentPoints,
          properties: {
            name: currentLabel || `Point ${features.length + 1}`,
            description: `A point marker on level ${currentLevel}`,
          },
        };
        setFeatureHistory([...featureHistory, features]);
        setFeatures([...features, newFeature]);
        setCurrentPoints([]);
        setDrawingMode(null);
        setCurrentLabel("");
      }
    } else if (currentPoints.length >= 3) {
      const newFeature: IndoorFeature = {
        id: `feature-${Date.now()}`,
        type: drawingMode!,
        level: currentLevel,
        coordinates: currentPoints,
        properties: {
          name:
            currentLabel ||
            `${drawingMode!.charAt(0).toUpperCase() + drawingMode!.slice(1)} ${
              features.length + 1
            }`,
          description: `A ${drawingMode} on level ${currentLevel}`,
        },
      };

      // If this is a building outline, copy it to all levels
      if (drawingMode === "building") {
        const buildingFeatures: IndoorFeature[] = [];
        for (let level = 1; level <= maxLevel; level++) {
          buildingFeatures.push({
            ...newFeature,
            id: `feature-${Date.now()}-${level}`,
            level,
            properties: {
              ...newFeature.properties,
              name: `${newFeature.properties.name} (Level ${level})`,
              description: `Building outline on level ${level}`,
            },
          });
        }
        setFeatureHistory([...featureHistory, features]);
        setFeatures([...features, ...buildingFeatures]);
      } else {
        setFeatureHistory([...featureHistory, features]);
        setFeatures([...features, newFeature]);
      }

      setCurrentPoints([]);
      setDrawingMode(null);
      setCurrentLabel("");
    }
  };

  const handleCancelDrawing = () => {
    setCurrentPoints([]);
    setDrawingMode(null);
    setCurrentLabel("");
  };

  const handleUndo = () => {
    if (featureHistory.length > 0) {
      const previousState = featureHistory[featureHistory.length - 1];
      setFeatures(previousState);
      setFeatureHistory(featureHistory.slice(0, -1));
    }
  };

  const handleEdit = (feature: IndoorFeature) => {
    setEditingFeature(feature);
    setEditName(feature.properties.name);
    setEditDescription(feature.properties.description);
    setEditFillColor(feature.properties.fillColor || "#4CAF50");
    setEditBorderColor(feature.properties.borderColor || "#000000");
    setEditingCoords(feature.coordinates);
  };

  const handleSaveEdit = () => {
    if (!editingFeature) return;
    setFeatures(
      features.map((f) =>
        f.id === editingFeature.id
          ? {
              ...f,
              properties: {
                ...f.properties,
                name: editName,
                description: editDescription,
                fillColor: editFillColor,
                borderColor: editBorderColor,
              },
              coordinates: editingCoords,
            }
          : f
      )
    );
    setEditingFeature(null);
    setEditingCoords([]);
  };

  const handleCancelEdit = () => {
    setEditingFeature(null);
    setEditingCoords([]);
  };

  const handleFeatureEdit = (
    featureId: string,
    newName: string,
    newDescription: string
  ) => {
    setFeatures(
      features.map((feature) =>
        feature.id === featureId
          ? {
              ...feature,
              properties: {
                ...feature.properties,
                name: newName,
                description: newDescription,
              },
            }
          : feature
      )
    );
  };

  const handleFeatureDelete = (featureId: string) => {
    // Save current state to history before deleting
    setFeatureHistory([...featureHistory, features]);
    setFeatures(features.filter((feature) => feature.id !== featureId));
  };

  const handleRemoveLastPoint = () => {
    if (currentPoints.length > 0) {
      setCurrentPoints(currentPoints.slice(0, -1));
    }
  };

  const handleAddToilet = () => {
    setDrawingMode("toilet");
    setCurrentPoints([]);
    setCurrentLabel("");
  };

  const handleAddPoint = () => {
    setDrawingMode("point");
    setCurrentPoints([]);
  };

  const handleFeatureClick = (feature: IndoorFeature | null) => {
    setSelectedFeatureId(feature?.id || null);
    if (feature && mapRef.current) {
      const center = calculateCenter(feature.coordinates);
      mapRef.current.setView(center, 19);
    }
  };

  // Handler to update points of the feature being edited
  const handleEditFeaturePoints = (newPoints: [number, number][]) => {
    setEditingCoords(newPoints);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer
        center={mapCenter}
        zoom={initialZoom}
        style={{ height: "100vh", width: "100%" }}
        minZoom={15}
        maxZoom={19}
        zoomControl={false}
        ref={mapRef}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <MapController
          center={mapCenter}
          zoom={initialZoom}
          level={currentLevel}
        />
        <IndoorFeatures
          level={currentLevel}
          features={features}
          drawingMode={drawingMode}
          currentPoints={currentPoints}
          onPointAdd={handlePointAdd}
          onFeatureClick={handleFeatureClick}
          selectedFeatureId={selectedFeatureId}
          editingFeature={editingFeature}
          editingCoords={editingCoords}
          onEditFeaturePoints={handleEditFeaturePoints}
        />
      </MapContainer>
      {config.isEditingEnabled && (
        <ControlPanel
          currentLevel={currentLevel}
          maxLevel={maxLevel}
          onLevelChange={handleLevelChange}
          onAddRoom={() => handleAddFeature("room")}
          onAddCorridor={() => handleAddFeature("corridor")}
          onAddStairs={() => handleAddFeature("stairs")}
          onAddElevator={() => handleAddFeature("elevator")}
          onAddShop={() => handleAddFeature("shop")}
          onAddRestaurant={() => handleAddFeature("restaurant")}
          onAddGate={() => handleAddFeature("gate")}
          onAddCheckin={() => handleAddFeature("checkin")}
          onAddSecurity={() => handleAddFeature("security")}
          onAddBaggage={() => handleAddFeature("baggage")}
          onAddTerminal={() => handleAddFeature("terminal")}
          onAddLounge={() => handleAddFeature("lounge")}
          onAddBuilding={() => handleAddFeature("building")}
          onAddToilet={handleAddToilet}
          onAddPoint={handleAddPoint}
          drawingMode={drawingMode}
          currentPoints={currentPoints}
          onCompleteDrawing={handleCompleteDrawing}
          onCancelDrawing={handleCancelDrawing}
          onUndo={handleUndo}
          canUndo={featureHistory.length > 0}
          currentLabel={currentLabel}
          onLabelChange={setCurrentLabel}
          onRemoveLastPoint={handleRemoveLastPoint}
        />
      )}
      <EntityList
        features={features}
        currentLevel={currentLevel}
        onFeatureSelect={handleFeatureSelect}
        onFeatureEdit={handleFeatureEdit}
        onFeatureDelete={handleFeatureDelete}
        onEdit={handleEdit}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        editingFeature={editingFeature}
        editName={editName}
        editDescription={editDescription}
        setEditName={setEditName}
        setEditDescription={setEditDescription}
        editFillColor={editFillColor}
        setEditFillColor={setEditFillColor}
        editBorderColor={editBorderColor}
        setEditBorderColor={setEditBorderColor}
      />
    </div>
  );
};

export default IndoorMap;
