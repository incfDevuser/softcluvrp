import React, { useState, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polyline,
  Circle,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  solveSoftCluVRPGeo,
  CLUSTER_COLORS,
  VEHICLE_COLORS,
} from "../lib/softCluVrp.js";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PENAFLOR_CENTER = [-33.6078137691373, -70.9008442860471];

const createCustomIcon = (color, isDepot = false, text = "") => {
  const size = isDepot ? 35 : 25;
  const symbol = isDepot ? "🏢" : "📍";
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isDepot ? "16px" : "12px"};
      font-weight: bold;
      color: white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      cursor: pointer;
    ">${symbol}</div>`,
    className: "custom-div-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};
function MapClickHandler({ onMapClick, isAddingNode }) {
  useMapEvents({
    click: (e) => {
      if (isAddingNode) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}
const Mapa = () => {
  const [nodes, setNodes] = useState([]);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    cluster: 1,
    demand: 10,
    isDepot: false,
  });
  const [solution, setSolution] = useState(null);
  const [showVisualization, setShowVisualization] = useState(false);  const [vrpParams, setVrpParams] = useState({
    numVehicles: 3,
    capacity: 50,
  });
  const loadExamplePenaflor = useCallback(() => {
    const exampleNodes = [
      {
        id: 1,
        lat: -33.6078137691373,
        lon: -70.9008442860471,
        cluster: 0,
        demand: 0,
        isDepot: true,
      },
      {
        id: 2,
        lat: -33.595,
        lon: -70.895,
        cluster: 1,
        demand: 12,
        isDepot: false,
      },
      {
        id: 3,
        lat: -33.59,
        lon: -70.905,
        cluster: 1,
        demand: 8,
        isDepot: false,
      },
      {
        id: 4,
        lat: -33.598,
        lon: -70.915,
        cluster: 1,
        demand: 15,
        isDepot: false,
      },
      {
        id: 5,
        lat: -33.625,
        lon: -70.895,
        cluster: 2,
        demand: 10,
        isDepot: false,
      },
      {
        id: 6,
        lat: -33.63,
        lon: -70.905,
        cluster: 2,
        demand: 18,
        isDepot: false,
      },
      {
        id: 7,
        lat: -33.62,
        lon: -70.92,
        cluster: 2,
        demand: 7,
        isDepot: false,
      },
      {
        id: 8,
        lat: -33.605,
        lon: -70.88,
        cluster: 3,
        demand: 14,
        isDepot: false,
      },
      {
        id: 9,
        lat: -33.615,
        lon: -70.875,
        cluster: 3,
        demand: 11,
        isDepot: false,
      },
      {
        id: 10,
        lat: -33.61,
        lon: -70.87,
        cluster: 3,
        demand: 16,
        isDepot: false,
      },
      {
        id: 11,
        lat: -33.605,
        lon: -70.93,
        cluster: 4,
        demand: 9,
        isDepot: false,
      },
      {
        id: 12,
        lat: -33.615,
        lon: -70.935,
        cluster: 4,
        demand: 13,
        isDepot: false,
      },
      {
        id: 13,
        lat: -33.62,
        lon: -70.925,
        cluster: 4,
        demand: 6,
        isDepot: false,
      },
    ];

    setNodes(exampleNodes);
    setSolution(null);
  }, []);

  const handleMapClick = useCallback(
    (latlng) => {
      if (!isAddingNode) return;

      const newNode = {
        id: Math.max(...nodes.map((n) => n.id), 0) + 1,
        lat: parseFloat(latlng.lat.toFixed(6)),
        lon: parseFloat(latlng.lng.toFixed(6)),
        cluster: newNodeData.isDepot ? 0 : newNodeData.cluster,
        demand: newNodeData.isDepot ? 0 : newNodeData.demand,
        isDepot: newNodeData.isDepot,
      };

      setNodes((prev) => [...prev, newNode]);
      setIsAddingNode(false);
      setSolution(null);
    },
    [isAddingNode, nodes, newNodeData]
  );
  const solveProblem = useCallback(() => {
    if (nodes.length < 2) {
      alert("Necesitas al menos 2 nodos para resolver el problema");
      return;
    }

    try {
      const result = solveSoftCluVRPGeo(
        nodes,
        vrpParams.numVehicles,
        vrpParams.capacity
      );
      setSolution(result);
      setShowVisualization(true);
      console.log("Solución:", result);
    } catch (error) {
      alert(`Error al resolver: ${error.message}`);
    }
  }, [nodes, vrpParams]);
  const removeNode = useCallback((nodeId) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setSolution(null);
    setShowVisualization(false);
  }, []);

  const clearAll = useCallback(() => {
    setNodes([]);
    setSolution(null);
    setShowVisualization(false);
  }, []);
  const exportData = useCallback(() => {
    const data = {
      nodes,
      vrpParams,
      solution: solution
        ? {
            routes: solution.routes,
            metrics: solution.metrics,
            clusters: solution.clusters,
          }
        : null,
      timestamp: new Date().toISOString(),
      location: "Municipalidad Peñaflor",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `softcluvrp-penaflor-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [nodes, vrpParams, solution]);
  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.nodes) {
          setNodes(data.nodes);
        }
        if (data.vrpParams) {
          setVrpParams(data.vrpParams);
        }
        if (data.solution) {
          setSolution(data.solution);
          setShowVisualization(true);
        }
        console.log("Datos importados:", data);
      } catch (error) {
        alert("Error al cargar el archivo: " + error.message);
      }
    };
    reader.readAsText(file);

    event.target.value = "";
  }, []);
  const saveToLocalStorage = useCallback(() => {
    const data = {
      nodes,
      vrpParams,
      solution: solution
        ? {
            routes: solution.routes,
            metrics: solution.metrics,
            clusters: solution.clusters,
          }
        : null,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem("softcluvrp-penaflor", JSON.stringify(data));
    alert("Datos guardados en el navegador");
  }, [nodes, vrpParams, solution]);
  const loadFromLocalStorage = useCallback(() => {
    try {
      const data = localStorage.getItem("softcluvrp-penaflor");
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.nodes) {
          setNodes(parsed.nodes);
        }
        if (parsed.vrpParams) {
          setVrpParams(parsed.vrpParams);
        }
        if (parsed.solution) {
          setSolution(parsed.solution);
          setShowVisualization(true);
        }
        console.log("Datos cargados desde localStorage:", parsed);
        alert("Datos cargados desde el navegador");
      } else {
        alert("No hay datos guardados en el navegador");
      }
    } catch (error) {
      alert("Error al cargar datos: " + error.message);
    }
  }, []);

  useEffect(() => {
    loadExamplePenaflor();
  }, [loadExamplePenaflor]);  return (
    <div className="h-full w-full flex">
      <div className="w-80 bg-white p-5 shadow-lg overflow-y-auto z-50">
        <h2 className="mb-5 text-gray-700 text-xl font-semibold">
          🚛 SoftCluVRP - Municipalidad Peñaflor
        </h2>{" "}
        <div className="mb-5 p-4 bg-gray-50 rounded-lg">
          <h4 className="mb-2 text-sm font-medium">⚙️ Parámetros</h4>
          <div className="mb-2">
            <label className="block mb-1 text-sm">Vehículos:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={vrpParams.numVehicles}
              onChange={(e) =>
                setVrpParams((prev) => ({
                  ...prev,
                  numVehicles: parseInt(e.target.value),
                }))
              }
              className="w-full p-1 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">Capacidad:</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={vrpParams.capacity}
              onChange={(e) =>
                setVrpParams((prev) => ({
                  ...prev,
                  capacity: parseInt(e.target.value),
                }))
              }
              className="w-full p-1 border border-gray-300 rounded"
            />
          </div>
        </div>{" "}
        <div className="mb-5 p-4 bg-blue-50 rounded-lg">
          <h4 className="mb-2 text-sm font-medium">➕ Añadir Nodo</h4>

          <div className="mb-2">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={newNodeData.isDepot}
                onChange={(e) =>
                  setNewNodeData((prev) => ({
                    ...prev,
                    isDepot: e.target.checked,
                  }))
                }
                className="mr-1"
              />
              Es depósito
            </label>
          </div>

          {!newNodeData.isDepot && (
            <>
              <div className="mb-2">
                <label className="block mb-1 text-sm">Cluster:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newNodeData.cluster}
                  onChange={(e) =>
                    setNewNodeData((prev) => ({
                      ...prev,
                      cluster: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-1 border border-gray-300 rounded"
                />
              </div>

              <div className="mb-2">
                <label className="block mb-1 text-sm">Demanda:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newNodeData.demand}
                  onChange={(e) =>
                    setNewNodeData((prev) => ({
                      ...prev,
                      demand: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-1 border border-gray-300 rounded"
                />
              </div>
            </>
          )}

          <button
            onClick={() => setIsAddingNode(!isAddingNode)}
            className={`w-full p-2 text-white border-none rounded cursor-pointer ${
              isAddingNode ? "bg-red-500" : "bg-blue-500"
            }`}
          >
            {isAddingNode ? "❌ Cancelar" : "📍 Añadir en Mapa"}
          </button>
        </div>{" "}
        <div className="flex flex-col gap-2 mb-5">
          <button
            onClick={loadExamplePenaflor}
            className="p-2 bg-green-500 text-white border-none rounded cursor-pointer"
          >
            📍 Cargar Ejemplo Municipalidad
          </button>

          <button
            onClick={solveProblem}
            disabled={nodes.length < 2}
            className={`p-2 text-white border-none rounded ${
              nodes.length >= 2
                ? "bg-yellow-500 cursor-pointer"
                : "bg-gray-500 cursor-not-allowed"
            }`}
          >
            🔧 Resolver VRP
          </button>

          <button
            onClick={clearAll}
            className="p-2 bg-red-500 text-white border-none rounded cursor-pointer"
          >
            🗑️ Limpiar Todo
          </button>

          <div className="flex flex-col gap-2 mt-2">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="p-2 bg-blue-500 text-white rounded cursor-pointer text-center"
            >
              📥 Importar Datos
            </label>

            <button
              onClick={exportData}
              className="p-2 bg-blue-500 text-white border-none rounded cursor-pointer"
            >
              📤 Exportar Datos
            </button>

            <button
              onClick={saveToLocalStorage}
              className="p-2 bg-blue-500 text-white border-none rounded cursor-pointer"
            >
              💾 Guardar en Navegador
            </button>

            <button
              onClick={loadFromLocalStorage}
              className="p-2 bg-blue-500 text-white border-none rounded cursor-pointer"
            >
              📂 Cargar desde Navegador
            </button>
          </div>
        </div>{" "}
        {solution && (
          <div className="p-4 bg-green-100 rounded-lg mb-5">
            <h4 className="mb-2 text-sm font-medium">📊 Resultados</h4>
            <div className="text-sm">
              <div>💰 Costo Total: {solution.metrics.totalCost.toFixed(1)}</div>
              <div>
                📏 Distancia: {solution.metrics.totalDistance.toFixed(1)}
              </div>
              <div>⚠️ Violaciones: {solution.metrics.totalViolations}</div>
              <div>🚚 Vehículos: {vrpParams.numVehicles}</div>
            </div>

            <button
              onClick={() => setShowVisualization(!showVisualization)}
              className={`w-full mt-2 p-2 text-white border-none rounded cursor-pointer ${
                showVisualization ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {showVisualization
                ? "🙈 Ocultar Visualización"
                : "👁️ Mostrar Visualización"}
            </button>
          </div>
        )}{" "}
        <div>
          <h4 className="mb-2 text-sm font-medium">
            📋 Nodos ({nodes.length})
          </h4>
          <div className="max-h-48 overflow-y-auto">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="flex justify-between items-center p-2 my-1 text-white rounded text-xs"
                style={{
                  backgroundColor: node.isDepot
                    ? "#000"
                    : CLUSTER_COLORS[node.cluster % CLUSTER_COLORS.length],
                }}
              >
                <span>
                  {node.isDepot ? "🏢 DEPÓSITO" : `📍 ${node.id}`}
                  {!node.isDepot && ` (C${node.cluster}, D${node.demand})`}
                </span>
                <button
                  onClick={() => removeNode(node.id)}
                  className="bg-white bg-opacity-30 border-none text-white rounded px-1 cursor-pointer"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        {" "}
        <MapContainer
          center={PENAFLOR_CENTER}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler
            onMapClick={handleMapClick}
            isAddingNode={isAddingNode}
          />
          {nodes.map((node) => {
            const color = node.isDepot
              ? "#000000"
              : CLUSTER_COLORS[node.cluster % CLUSTER_COLORS.length];
            const icon = createCustomIcon(color, node.isDepot);
            return (
              <Marker key={node.id} position={[node.lat, node.lon]} icon={icon}>
                <Popup>
                  <div className="text-center">
                    <strong>
                      {node.isDepot ? "🏢 DEPÓSITO" : `📍 Nodo ${node.id}`}
                    </strong>
                    <br />
                    {!node.isDepot && (
                      <>
                        🎯 Cluster: {node.cluster}
                        <br />
                        📦 Demanda: {node.demand}
                        <br />
                      </>
                    )}
                    🌍 Coord: {node.lat.toFixed(4)}, {node.lon.toFixed(4)}
                    <br />
                    <button
                      onClick={() => removeNode(node.id)}
                      className="mt-1 bg-red-500 text-white border-none px-2 py-1 rounded cursor-pointer"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {showVisualization &&
            solution &&
            solution.clusters &&
            solution.clusters.map((cluster) => (
              <Circle
                key={`cluster-${cluster.id}`}
                center={cluster.center}
                radius={Math.max(cluster.radius, 100)}
                pathOptions={{
                  color: CLUSTER_COLORS[cluster.id % CLUSTER_COLORS.length],
                  fillColor: CLUSTER_COLORS[cluster.id % CLUSTER_COLORS.length],
                  fillOpacity: 0.2,
                  weight: 2,
                  dashArray: "5, 5",
                }}
              >
                <Tooltip permanent>
                  <div className="text-center text-xs">
                    🎯 Cluster {cluster.id}
                    <br />
                    📏 Radio: {(cluster.radius / 1000).toFixed(2)} km
                  </div>
                </Tooltip>
              </Circle>
            ))}
          {showVisualization &&
            solution &&
            solution.routes &&
            solution.routes.map((route, vehicleIndex) => {
              if (route.length < 2) return null;
              const routeCoords = route
                .map((nodeId) => {
                  const node = nodes.find((n) => n.id === nodeId);
                  return node ? [node.lat, node.lon] : null;
                })
                .filter((coord) => coord !== null);

              if (routeCoords.length < 2) return null;

              const vehicleColor =
                VEHICLE_COLORS[vehicleIndex % VEHICLE_COLORS.length];

              return (
                <Polyline
                  key={`route-${vehicleIndex}`}
                  positions={routeCoords}
                  pathOptions={{
                    color: vehicleColor,
                    weight: 4,
                    opacity: 0.8,
                  }}
                >
                  <Tooltip>
                    <div className="text-center text-xs">
                      🚚 Vehículo {vehicleIndex + 1}
                      <br />
                      📍 Nodos: {route.length - 2}
                      <br />
                      🎯 Ruta: {route.join(" → ")}
                      {solution.metrics.routeMetrics &&
                        solution.metrics.routeMetrics[vehicleIndex] && (
                          <>
                            <br />
                            📏 Distancia:{" "}
                            {solution.metrics.routeMetrics[
                              vehicleIndex
                            ].distance.toFixed(1)}
                            <br />
                            📦 Carga:{" "}
                            {
                              solution.metrics.routeMetrics[vehicleIndex]
                                .totalDemand
                            }
                          </>
                        )}
                    </div>
                  </Tooltip>
                </Polyline>
              );
            })}
        </MapContainer>{" "}
        {isAddingNode && (
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-blue-600 bg-opacity-90 text-white px-5 py-2 rounded-full z-50 font-bold shadow-lg">
            📍 Haz clic en el mapa para añadir un{" "}
            {newNodeData.isDepot ? "depósito" : "nodo"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mapa;
