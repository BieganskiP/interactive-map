import { useState, useMemo } from "react";
import { config } from "../config";
import type { IndoorFeature } from "../types";
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
  FaEdit,
  FaTrash,
  FaLink,
} from "react-icons/fa";

interface EntityListProps {
  features: IndoorFeature[];
  currentLevel: number;
  onFeatureSelect: (feature: IndoorFeature) => void;
  onFeatureEdit: (
    featureId: string,
    newName: string,
    newDescription: string
  ) => void;
  onFeatureDelete: (featureId: string) => void;
  onEdit: (feature: IndoorFeature) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  editingFeature: IndoorFeature | null;
  editName: string;
  editDescription: string;
  setEditName: (name: string) => void;
  setEditDescription: (desc: string) => void;
  editFillColor: string;
  setEditFillColor: (color: string) => void;
  editBorderColor: string;
  setEditBorderColor: (color: string) => void;
}

type Category = "basic" | "services" | "airport" | "building";

const getFeatureCategory = (type: string): Category => {
  switch (type) {
    case "room":
    case "corridor":
    case "toilet":
      return "basic";
    case "shop":
    case "restaurant":
    case "lounge":
      return "services";
    case "gate":
    case "checkin":
    case "security":
    case "baggage":
    case "terminal":
      return "airport";
    case "building":
      return "building";
    default:
      return "basic";
  }
};

const getCategoryTitle = (category: Category): string => {
  switch (category) {
    case "basic":
      return "Basic Features";
    case "services":
      return "Services";
    case "airport":
      return "Airport Features";
    case "building":
      return "Buildings";
  }
};

const EntityList = ({
  features,
  currentLevel,
  onFeatureSelect,
  onFeatureEdit,
  onFeatureDelete,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  editingFeature,
  editName,
  editDescription,
  setEditName,
  setEditDescription,
  editFillColor,
  setEditFillColor,
  editBorderColor,
  setEditBorderColor,
}: EntityListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Category[]>([
    "basic",
    "services",
    "airport",
  ]);

  const handleSave = (featureId: string) => {
    onFeatureEdit(featureId, editName, editDescription);
  };

  const handleKeyDown = (e: React.KeyboardEvent, featureId: string) => {
    if (e.key === "Enter") {
      handleSave(featureId);
    } else if (e.key === "Escape") {
      onCancelEdit();
    }
  };

  const toggleCategory = (category: Category) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleCopyLink = (feature: IndoorFeature) => {
    const url = new URL(window.location.href);
    url.searchParams.set("entity", feature.id);
    navigator.clipboard.writeText(url.toString());
  };

  const getFeatureIcon = (type: string) => {
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
        return <FaMapMarkerAlt />;
    }
  };

  const filteredAndGroupedFeatures = useMemo(() => {
    const filtered = features.filter(
      (feature) =>
        feature.level === currentLevel &&
        (searchQuery === "" ||
          feature.properties.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          feature.type.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const grouped = filtered.reduce((acc, feature) => {
      const category = getFeatureCategory(feature.type);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(feature);
      return acc;
    }, {} as Record<Category, IndoorFeature[]>);

    return grouped;
  }, [features, currentLevel, searchQuery]);

  return (
    <div className="entity-list">
      <h3>Features (Level {currentLevel})</h3>
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search features..."
          className="search-input"
        />
      </div>
      <div className="entity-list-content">
        {Object.entries(filteredAndGroupedFeatures).map(
          ([category, features]) => (
            <div key={category} className="category-section">
              <div
                className="category-header"
                onClick={() => toggleCategory(category as Category)}
              >
                <span className="category-title">
                  {getCategoryTitle(category as Category)}
                </span>
                <span className="category-count">({features.length})</span>
                <span className="category-toggle">
                  {expandedCategories.includes(category as Category)
                    ? "▼"
                    : "▶"}
                </span>
              </div>
              {expandedCategories.includes(category as Category) && (
                <div className="category-items">
                  {features.length === 0 ? (
                    <div className="no-features">No matching features</div>
                  ) : (
                    features.map((feature) => (
                      <div key={feature.id} className="entity-item">
                        {editingFeature?.id === feature.id ? (
                          <div className="edit-form">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, feature.id)}
                              placeholder="Feature name"
                              className="feature-name-input"
                            />
                            <textarea
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              placeholder="Feature description"
                              className="feature-description-input"
                            />
                            <div className="color-pickers-row">
                              <label>
                                BG
                                <input
                                  type="color"
                                  value={editFillColor}
                                  onChange={(e) =>
                                    setEditFillColor(e.target.value)
                                  }
                                  className="color-picker"
                                />
                              </label>
                              <label>
                                Border
                                <input
                                  type="color"
                                  value={editBorderColor}
                                  onChange={(e) =>
                                    setEditBorderColor(e.target.value)
                                  }
                                  className="color-picker"
                                />
                              </label>
                            </div>
                            <div className="edit-buttons">
                              <button onClick={onSaveEdit}>Save</button>
                              <button onClick={onCancelEdit}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="entity-icon">
                              {getFeatureIcon(feature.type)}
                            </div>
                            <div className="entity-details">
                              <div
                                className="entity-name"
                                onClick={() => onFeatureSelect(feature)}
                              >
                                {feature.properties.name || feature.type}
                              </div>
                              <div className="entity-type">{feature.type}</div>
                              <p className="entity-description">
                                {feature.properties.description}
                              </p>
                            </div>
                            <div className="entity-actions">
                              {config.isEditingEnabled && (
                                <>
                                  <button
                                    className="edit-button"
                                    onClick={() => onEdit(feature)}
                                    title="Edit name & geometry"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    className="delete-button"
                                    onClick={() => onFeatureDelete(feature.id)}
                                    title="Delete feature"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                              <button
                                className="copy-link-button"
                                onClick={() => handleCopyLink(feature)}
                                title="Copy link to this feature"
                              >
                                <FaLink />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default EntityList;
