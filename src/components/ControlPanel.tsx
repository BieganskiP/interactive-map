import { useState } from "react";
import type { FeatureType } from "../types";

interface ControlPanelProps {
  currentLevel: number;
  maxLevel: number;
  onLevelChange: (level: number) => void;
  onAddRoom: () => void;
  onAddCorridor: () => void;
  onAddStairs: () => void;
  onAddElevator: () => void;
  onAddShop: () => void;
  onAddRestaurant: () => void;
  onAddGate: () => void;
  onAddCheckin: () => void;
  onAddSecurity: () => void;
  onAddBaggage: () => void;
  onAddTerminal: () => void;
  onAddLounge: () => void;
  onAddBuilding: () => void;
  onAddToilet: () => void;
  onAddPoint: () => void;
  drawingMode: FeatureType | null;
  currentPoints: [number, number][];
  onCompleteDrawing: () => void;
  onCancelDrawing: () => void;
  onUndo: () => void;
  canUndo: boolean;
  currentLabel: string;
  onLabelChange: (label: string) => void;
  onRemoveLastPoint: () => void;
}

const ControlPanel = ({
  currentLevel,
  maxLevel,
  onLevelChange,
  onAddRoom,
  onAddCorridor,
  onAddStairs,
  onAddElevator,
  onAddShop,
  onAddRestaurant,
  onAddGate,
  onAddCheckin,
  onAddSecurity,
  onAddBaggage,
  onAddTerminal,
  onAddLounge,
  onAddBuilding,
  onAddToilet,
  onAddPoint,
  drawingMode,
  currentPoints,
  onCompleteDrawing,
  onCancelDrawing,
  onUndo,
  canUndo,
  currentLabel,
  onLabelChange,
  onRemoveLastPoint,
}: ControlPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCategory, setActiveCategory] = useState<
    "basic" | "services" | "airport" | "building"
  >("basic");

  return (
    <div
      className="control-panel"
      style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1000 }}
    >
      <div
        className="control-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>Indoor Map Controls</h3>
      </div>
      {isExpanded && (
        <div className="control-content">
          <div className="level-controls">
            <button
              onClick={() => onLevelChange(currentLevel - 1)}
              disabled={currentLevel <= 0}
            >
              Previous Level
            </button>
            <span>Level {currentLevel}</span>
            <button
              onClick={() => onLevelChange(currentLevel + 1)}
              disabled={currentLevel >= maxLevel}
            >
              Next Level
            </button>
          </div>
          <div className="category-tabs">
            <button
              className={activeCategory === "basic" ? "active" : ""}
              onClick={() => setActiveCategory("basic")}
            >
              Basic
            </button>
            <button
              className={activeCategory === "services" ? "active" : ""}
              onClick={() => setActiveCategory("services")}
            >
              Services
            </button>
            <button
              className={activeCategory === "airport" ? "active" : ""}
              onClick={() => setActiveCategory("airport")}
            >
              Airport
            </button>
            <button
              className={activeCategory === "building" ? "active" : ""}
              onClick={() => setActiveCategory("building")}
            >
              Building
            </button>
          </div>
          <div className="feature-controls">
            {activeCategory === "basic" && (
              <>
                <h4>Basic Features</h4>
                <button
                  onClick={onAddRoom}
                  className={drawingMode === "room" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Room
                </button>
                <button
                  onClick={onAddCorridor}
                  className={drawingMode === "corridor" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Corridor
                </button>
                <button
                  onClick={onAddToilet}
                  className={drawingMode === "toilet" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Toilet
                </button>
                <button
                  onClick={onAddPoint}
                  className={`feature-button ${
                    drawingMode === "point" ? "active" : ""
                  }`}
                  disabled={!!drawingMode}
                >
                  Add Point
                </button>
              </>
            )}
            {activeCategory === "services" && (
              <>
                <h4>Services</h4>
                <button
                  onClick={onAddShop}
                  className={drawingMode === "shop" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Shop
                </button>
                <button
                  onClick={onAddRestaurant}
                  className={drawingMode === "restaurant" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Restaurant
                </button>
                <button
                  onClick={onAddLounge}
                  className={drawingMode === "lounge" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Lounge
                </button>
              </>
            )}
            {activeCategory === "airport" && (
              <>
                <h4>Airport Features</h4>
                <button
                  onClick={onAddTerminal}
                  className={drawingMode === "terminal" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Terminal
                </button>
                <button
                  onClick={onAddGate}
                  className={drawingMode === "gate" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Gate
                </button>
                <button
                  onClick={onAddCheckin}
                  className={drawingMode === "checkin" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Check-in
                </button>
                <button
                  onClick={onAddSecurity}
                  className={drawingMode === "security" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Security
                </button>
                <button
                  onClick={onAddBaggage}
                  className={drawingMode === "baggage" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Baggage
                </button>
              </>
            )}
            {activeCategory === "building" && (
              <>
                <h4>Building Features</h4>
                <button
                  onClick={onAddBuilding}
                  className={drawingMode === "building" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Building Outline
                </button>
                <button
                  onClick={onAddStairs}
                  className={drawingMode === "stairs" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Stairs
                </button>
                <button
                  onClick={onAddElevator}
                  className={drawingMode === "elevator" ? "active" : ""}
                  disabled={!!drawingMode}
                >
                  Add Elevator
                </button>
              </>
            )}
            {drawingMode && (
              <>
                <div className="drawing-instructions">
                  {drawingMode === "point" ? (
                    "Click on the map to place a point marker."
                  ) : (
                    <>
                      Click on the map to add points. You need at least 3 points
                      to create a shape.
                      <br />
                      Points added: {currentPoints.length}
                    </>
                  )}
                </div>
                <div className="label-input">
                  <input
                    type="text"
                    value={currentLabel}
                    onChange={(e) => onLabelChange(e.target.value)}
                    placeholder={`Enter ${drawingMode} name (optional)`}
                    className="feature-name-input"
                  />
                </div>
                <div className="drawing-controls">
                  <button
                    onClick={onCompleteDrawing}
                    disabled={
                      drawingMode === "point"
                        ? currentPoints.length < 1
                        : currentPoints.length < 3
                    }
                    className="complete-button"
                  >
                    {drawingMode === "point" ? "Place Point" : "Complete Shape"}
                  </button>
                  <button
                    onClick={onRemoveLastPoint}
                    disabled={currentPoints.length === 0}
                    className="remove-last-point-button"
                  >
                    Remove Last Point
                  </button>
                  <button onClick={onCancelDrawing} className="cancel-button">
                    Cancel
                  </button>
                </div>
              </>
            )}
            <div className="action-controls">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="undo-button"
              >
                Undo Last Feature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
