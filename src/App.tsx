import IndoorMap from "./components/IndoorMap";
import "./App.css";

function App() {
  // Coordinates for King Abdulaziz International Airport, Jeddah
  const center: [number, number] = [21.660706, 39.173765];
  const zoom = 19;
  const level = 1;

  return (
    <div className="App">
      <IndoorMap center={center} zoom={zoom} level={level} />
    </div>
  );
}

export default App;
