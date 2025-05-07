import { useEffect, useState } from "react";
import { Polygon, useMap, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import type { IndoorFeature, FeatureType } from "../types";
import {
  FaDoorOpen,
  FaWalking,
  FaStar,
  FaArrowUp,
  FaStore,
  FaUtensils,
  FaPlane,
  FaTicketAlt,
  FaShieldAlt,
  FaSuitcase,
  FaTerminal,
  FaCouch,
  FaBuilding,
  FaRestroom,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface IndoorFeaturesProps {
  level: number;
  features: IndoorFeature[];
  onFeatureClick: (feature: IndoorFeature | null) => void;
  drawingMode: FeatureType | null;
  currentPoints: [number, number][];
  onPointAdd: (point: [number, number]) => void;
  selectedFeatureId: string | null;
  editingFeature: IndoorFeature | null;
  editingCoords: [number, number][];
  onEditFeaturePoints: (newPoints: [number, number][]) => void;
}

const MapEvents = ({
  onClick,
}: {
  onClick: (e: L.LeafletMouseEvent) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [map, onClick]);

  return null;
};

const IndoorFeatures = ({
  level,
  features,
  onFeatureClick,
  drawingMode,
  currentPoints,
  onPointAdd,
  selectedFeatureId,
  editingFeature,
  editingCoords,
  onEditFeaturePoints,
}: IndoorFeaturesProps) => {
  const map = useMap();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (drawingMode) {
      const handleDragStart = () => setIsDragging(true);
      const handleDragEnd = () => setIsDragging(false);

      map.on("dragstart", handleDragStart);
      map.on("dragend", handleDragEnd);

      // Set initial cursor style
      map.getContainer().style.cursor = "crosshair";

      return () => {
        map.off("dragstart", handleDragStart);
        map.off("dragend", handleDragEnd);
        map.getContainer().style.cursor = "";
      };
    }
  }, [drawingMode, map]);

  useEffect(() => {
    if (drawingMode) {
      map.getContainer().style.cursor = isDragging ? "grabbing" : "crosshair";
    }
  }, [drawingMode, isDragging, map]);

  // Add click handler for map to deselect features
  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      // Only deselect if clicking directly on the map (not on a feature)
      if (e.originalEvent.target === map.getContainer()) {
        onFeatureClick(null);
      }
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onFeatureClick]);

  const getFeatureStyle = (feature: IndoorFeature) => {
    const baseStyle = {
      weight: 2,

      color: feature.properties.borderColor || "#000000",
      fillOpacity: 0.2,
    };

    switch (feature.type) {
      case "room":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#4CAF50",
        };
      case "corridor":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#9E9E9E",
        };
      case "stairs":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#FF9800",
        };
      case "elevator":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#2196F3",
        };
      case "shop":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#E91E63",
        };
      case "restaurant":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#F44336",
        };
      case "lounge":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#9C27B0",
        };
      case "terminal":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#3F51B5",
        };
      case "gate":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#009688",
        };
      case "checkin":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#795548",
        };
      case "security":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#607D8B",
        };
      case "baggage":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#FFC107",
        };
      case "building":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#000000",
          weight: 3,
        };
      case "toilet":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#00BCD4",
        };
      case "point":
        return {
          ...baseStyle,
          fillColor: feature.properties.fillColor || "#FF0000",
        };
      default:
        return baseStyle;
    }
  };

  // Calculate the center point of a polygon
  const calculateCenter = (coordinates: [number, number][]) => {
    const bounds = coordinates.reduce(
      (bounds, coord) => {
        return {
          minLat: Math.min(bounds.minLat, coord[0]),
          maxLat: Math.max(bounds.maxLat, coord[0]),
          minLng: Math.min(bounds.minLng, coord[1]),
          maxLng: Math.max(bounds.maxLng, coord[1]),
        };
      },
      {
        minLat: coordinates[0][0],
        maxLat: coordinates[0][0],
        minLng: coordinates[0][1],
        maxLng: coordinates[0][1],
      }
    );

    return [
      (bounds.minLat + bounds.maxLat) / 2,
      (bounds.minLng + bounds.maxLng) / 2,
    ] as [number, number];
  };

  const getFeatureIcon = (type: FeatureType) => {
    switch (type) {
      case "room":
        return <FaDoorOpen />;
      case "corridor":
        return <FaWalking />;
      case "stairs":
        return <FaStar />;
      case "elevator":
        return <FaArrowUp />;
      case "shop":
        return <FaStore />;
      case "restaurant":
        return <FaUtensils />;
      case "gate":
        return <FaPlane />;
      case "checkin":
        return <FaTicketAlt />;
      case "security":
        return <FaShieldAlt />;
      case "baggage":
        return <FaSuitcase />;
      case "terminal":
        return <FaTerminal />;
      case "lounge":
        return <FaCouch />;
      case "building":
        return <FaBuilding />;
      case "toilet":
        return <FaRestroom />;
      case "point":
        return <FaMapMarkerAlt />;
      default:
        return null;
    }
  };

  const renderFeature = (feature: IndoorFeature) => {
    const center = calculateCenter(feature.coordinates);
    const icon = getFeatureIcon(feature.type);
    const isSelected = feature.id === selectedFeatureId;

    // Make building not selectable
    const isBuilding = feature.type === "building";

    if (feature.type === "point") {
      return (
        <Marker
          key={feature.id}
          position={feature.coordinates[0]}
          eventHandlers={
            !isBuilding
              ? {
                  click: () => onFeatureClick(feature),
                }
              : undefined
          }
        >
          <Tooltip
            permanent={true}
            direction="center"
            className="feature-label"
          >
            <div className="feature-label-content">
              {icon}
              <div
                className={`feature-label-details${
                  isSelected ? " selected" : ""
                }`}
              >
                <div className="feature-label-name">
                  {feature.properties.name || feature.type}
                </div>
                {isSelected && (
                  <>
                    <div className="feature-label-type">
                      Level {feature.level} • {feature.type}
                    </div>
                    {feature.properties.description && (
                      <div className="feature-label-description">
                        {feature.properties.description}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Tooltip>
        </Marker>
      );
    }

    return (
      <Polygon
        key={feature.id}
        positions={feature.coordinates}
        pathOptions={getFeatureStyle(feature)}
        eventHandlers={
          !isBuilding
            ? {
                click: () => onFeatureClick(feature),
              }
            : undefined
        }
      >
        <Tooltip
          position={center}
          permanent={true}
          direction="center"
          className="feature-label"
        >
          <div className="feature-label-content">
            {icon}
            <div
              className={`feature-label-details${
                isSelected ? " selected" : ""
              }`}
            >
              <div className="feature-label-name">
                {feature.properties.name || feature.type}
              </div>
              {isSelected && (
                <>
                  <div className="feature-label-type">
                    Level {feature.level} • {feature.type}
                  </div>
                  {feature.properties.description && (
                    <div className="feature-label-description">
                      {feature.properties.description}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </Tooltip>
      </Polygon>
    );
  };

  const MIN_POINTS = editingFeature && editingFeature.type === "point" ? 1 : 3;

  const handleAddPoint = (insertIdx: number, latlng: [number, number]) => {
    if (!editingFeature) return;
    const newCoords: [number, number][] = [
      ...editingCoords.slice(0, insertIdx + 1),
      latlng,
      ...editingCoords.slice(insertIdx + 1),
    ];
    onEditFeaturePoints(newCoords);
  };

  const renderEditingMarkers = () => {
    if (!editingFeature) return null;
    if (!editingCoords || editingCoords.length === 0) return null;

    // For multi-point features, show add-point markers between points
    const addMarkers = [];
    if (editingCoords.length > 1) {
      for (let i = 0; i < editingCoords.length; i++) {
        const nextIdx = (i + 1) % editingCoords.length;
        const lat1 = editingCoords[i][0];
        const lng1 = editingCoords[i][1];
        const lat2 = editingCoords[nextIdx][0];
        const lng2 = editingCoords[nextIdx][1];
        const midLat = (lat1 + lat2) / 2;
        const midLng = (lng1 + lng2) / 2;
        addMarkers.push(
          <Marker
            key={`add-marker-${i}`}
            position={[midLat, midLng]}
            icon={L.divIcon({
              className: "add-point-marker",
              iconSize: [18, 18],
              html: '<div style="background:#fff;width:18px;height:18px;border-radius:50%;border:2px solid #4caf50;display:flex;align-items:center;justify-content:center;font-size:16px;color:#4caf50;box-shadow:0 1px 4px rgba(0,0,0,0.2);">+</div>',
            })}
            eventHandlers={{
              click: () => handleAddPoint(i, [midLat, midLng]),
            }}
          />
        );
      }
    }

    // Remove marker icon
    const removeIcon = L.divIcon({
      className: "remove-point-marker",
      iconSize: [16, 16],
      html: '<div style="background:#fff;width:16px;height:16px;border-radius:50%;border:2px solid #f44336;display:flex;align-items:center;justify-content:center;font-size:14px;color:#f44336;box-shadow:0 1px 4px rgba(0,0,0,0.2);">×</div>',
    });

    return [
      ...editingCoords
        .map((coord, idx) => [
          <Marker
            key={`edit-marker-${idx}`}
            position={coord}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const newLatLng = e.target.getLatLng();
                const newCoords: [number, number][] = editingCoords.map(
                  (c, i) => (i === idx ? [newLatLng.lat, newLatLng.lng] : c)
                );
                onEditFeaturePoints(newCoords);
              },
            }}
            icon={L.divIcon({
              className: "edit-point-marker",
              iconSize: [16, 16],
              html: '<div style="background:#3388ff;width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.2);position:relative;"></div>',
            })}
          />,
          // Remove marker, slightly offset
          editingCoords.length > MIN_POINTS && (
            <Marker
              key={`remove-marker-${idx}`}
              position={[coord[0] + 0.00005, coord[1] + 0.00005]}
              icon={removeIcon}
              eventHandlers={{
                click: () => {
                  const newCoords: [number, number][] = editingCoords.filter(
                    (_, i) => i !== idx
                  );
                  onEditFeaturePoints(newCoords);
                },
              }}
            />
          ),
        ])
        .flat(),
      ...addMarkers,
    ];
  };

  return (
    <>
      {/* Render all features except the one being edited */}
      {features
        .filter(
          (feature) => !editingFeature || feature.id !== editingFeature.id
        )
        .filter((feature) => feature.level === level)
        .map(renderFeature)}

      {/* Render the editing feature with editingCoords */}
      {editingFeature &&
        editingFeature.level === level &&
        editingCoords.length > 0 && (
          <Polygon
            key={editingFeature.id}
            positions={editingCoords}
            pathOptions={getFeatureStyle(editingFeature)}
          >
            <Tooltip
              position={calculateCenter(editingCoords)}
              permanent={true}
              direction="center"
              className="feature-label"
            >
              <div className="feature-label-content">
                {getFeatureIcon(editingFeature.type)}
                <div className="feature-label-details selected">
                  <div className="feature-label-name">
                    {editingFeature.properties.name || editingFeature.type}
                  </div>
                  <div className="feature-label-type">
                    Level {editingFeature.level} • {editingFeature.type}
                  </div>
                  {editingFeature.properties.description && (
                    <div className="feature-label-description">
                      {editingFeature.properties.description}
                    </div>
                  )}
                </div>
              </div>
            </Tooltip>
          </Polygon>
        )}

      {/* Render editing markers */}
      {renderEditingMarkers()}

      {drawingMode && (
        <MapEvents
          onClick={(e) => {
            const { lat, lng } = e.latlng;
            onPointAdd([lat, lng]);
          }}
        />
      )}
      {drawingMode && currentPoints.length > 0 && drawingMode !== "point" && (
        <Polygon
          positions={currentPoints}
          pathOptions={{
            color: "#ff0000",
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.2,
            fillColor: "#ff0000",
          }}
        />
      )}
    </>
  );
};

export default IndoorFeatures;
