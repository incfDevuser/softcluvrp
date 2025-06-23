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
import "./Mapa.css";
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

const MODERN_COLORS = {
  primary: "#0F172A",
  secondary: "#334155",
  accent: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#06B6D4",
  purple: "#8B5CF6",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  muted: "#64748B",
};

const createCustomIcon = (color, isDepot = false, text = "") => {
  const size = isDepot ? 40 : 30;
  const symbol = isDepot ? "�" : "📍";
  return L.divIcon({
    html: `<div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isDepot ? "18px" : "14px"};
      font-weight: 600;
      color: white;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    ">${symbol}
    <div style="
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      background: ${isDepot ? "#10B981" : "#3B82F6"};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    "></div>
    </div>`,
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
  const [showVisualization, setShowVisualization] = useState(false);
  const [vrpParams, setVrpParams] = useState({
    numVehicles: 5,
    capacity: 80,
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
        lat: -33.59,
        lon: -70.895,
        cluster: 1,
        demand: 12,
        isDepot: false,
      },
      {
        id: 3,
        lat: -33.585,
        lon: -70.9,
        cluster: 1,
        demand: 8,
        isDepot: false,
      },
      {
        id: 4,
        lat: -33.595,
        lon: -70.885,
        cluster: 2,
        demand: 15,
        isDepot: false,
      },
      {
        id: 5,
        lat: -33.592,
        lon: -70.88,
        cluster: 2,
        demand: 10,
        isDepot: false,
      },
      {
        id: 6,
        lat: -33.605,
        lon: -70.875,
        cluster: 3,
        demand: 18,
        isDepot: false,
      },
      {
        id: 7,
        lat: -33.61,
        lon: -70.87,
        cluster: 3,
        demand: 7,
        isDepot: false,
      },
      {
        id: 8,
        lat: -33.62,
        lon: -70.885,
        cluster: 4,
        demand: 14,
        isDepot: false,
      },
      {
        id: 9,
        lat: -33.625,
        lon: -70.89,
        cluster: 4,
        demand: 11,
        isDepot: false,
      },
      {
        id: 10,
        lat: -33.63,
        lon: -70.905,
        cluster: 5,
        demand: 16,
        isDepot: false,
      },
      {
        id: 11,
        lat: -33.635,
        lon: -70.91,
        cluster: 5,
        demand: 9,
        isDepot: false,
      },
      {
        id: 12,
        lat: -33.625,
        lon: -70.92,
        cluster: 6,
        demand: 13,
        isDepot: false,
      },
      {
        id: 13,
        lat: -33.62,
        lon: -70.925,
        cluster: 6,
        demand: 6,
        isDepot: false,
      },
      {
        id: 14,
        lat: -33.605,
        lon: -70.93,
        cluster: 7,
        demand: 20,
        isDepot: false,
      },
      {
        id: 15,
        lat: -33.6,
        lon: -70.935,
        cluster: 7,
        demand: 12,
        isDepot: false,
      },
      {
        id: 16,
        lat: -33.59,
        lon: -70.92,
        cluster: 8,
        demand: 17,
        isDepot: false,
      },
      {
        id: 17,
        lat: -33.585,
        lon: -70.915,
        cluster: 8,
        demand: 8,
        isDepot: false,
      },
      {
        id: 18,
        lat: -33.598,
        lon: -70.905,
        cluster: 9,
        demand: 14,
        isDepot: false,
      },
      {
        id: 19,
        lat: -33.595,
        lon: -70.91,
        cluster: 9,
        demand: 11,
        isDepot: false,
      },
      {
        id: 20,
        lat: -33.615,
        lon: -70.895,
        cluster: 10,
        demand: 19,
        isDepot: false,
      },
      {
        id: 21,
        lat: -33.612,
        lon: -70.89,
        cluster: 10,
        demand: 13,
        isDepot: false,
      },
      {
        id: 22,
        lat: -33.618,
        lon: -70.91,
        cluster: 11,
        demand: 15,
        isDepot: false,
      },
      {
        id: 23,
        lat: -33.62,
        lon: -70.915,
        cluster: 11,
        demand: 9,
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
  }, [loadExamplePenaflor]);
  return (
    <div className="h-full w-full flex bg-slate-50">
      <div className="w-96 bg-white border-r border-slate-200 flex flex-col shadow-xl">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold">SoftCluVRP Tester</h2>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200 sidebar-section">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold text-slate-800">Configuración</h4>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Número de Vehículos
                </label>
                <div className="relative">
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
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Capacidad por Vehículo
                </label>
                <div className="relative">
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
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-2xl p-5 border border-blue-200 sidebar-section">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold text-slate-800">Añadir Punto</h4>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-transparent hover:border-blue-200 transition-all cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNodeData.isDepot}
                  onChange={(e) =>
                    setNewNodeData((prev) => ({
                      ...prev,
                      isDepot: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">
                    Es depósito
                  </span>
                </div>
              </label>
              {!newNodeData.isDepot && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cluster
                    </label>
                    <div className="relative">
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
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Demanda
                    </label>
                    <div className="relative">
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
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}
              <button
                onClick={() => setIsAddingNode(!isAddingNode)}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 btn-modern ${
                  isAddingNode
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200"
                    : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200"
                }`}
              >
                {isAddingNode ? "Cancelar Ubicación" : "Seleccionar en Mapa"}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={loadExamplePenaflor}
              className="w-full py-3 px-4 border-2 border-blue-500 rounded-lg hover:border-blue-600 transition-all duration-300 btn-modern bg-white shadow-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2 text-blue-500">
                <span>Cargar Ejemplo Peñaflor</span>
              </span>
            </button>{" "}
            <button
              onClick={solveProblem}
              disabled={nodes.length < 2}
              className={`w-full py-3 px-4 font-semibold rounded-lg shadow-lg transition-all duration-300 transform btn-modern ${
                nodes.length >= 2
                  ? "bg-white border-2 border-orange-500 hover:bg-orange-50 hover:border-orange-600 text-orange-500"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>Resolver</span>
              </span>
            </button>{" "}
            <button
              onClick={clearAll}
              className="w-full py-3 px-4 bg-red-600 rounded-lg"
            >
              <span className="flex items-center justify-center gap-2 text-white">
                <span>Limpiar Todo</span>
              </span>
            </button>
          </div>
          {solution && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200 animate-fade-in sidebar-section">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-semibold text-gray-800">
                  Resultados de Optimización
                </h4>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 metric-card">
                    <div className="text-2xl font-bold text-blue-600">
                      {solution.metrics.totalCost.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Costo Total</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 metric-card">
                    <div className="text-2xl font-bold text-blue-600">
                      {solution.metrics.totalDistance.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">Distancia (km)</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 metric-card">
                    <div className="text-2xl font-bold text-blue-600">
                      {solution.metrics.totalViolations}
                    </div>
                    <div className="text-xs text-gray-600">Violaciones</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200 metric-card">
                    <div className="text-2xl font-bold text-blue-600">
                      {vrpParams.numVehicles}
                    </div>
                    <div className="text-xs text-gray-600">Vehículos</div>
                  </div>
                </div>

                <button
                  onClick={() => setShowVisualization(!showVisualization)}
                  className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-300 ${
                    showVisualization
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      : "bg-gray-700 hover:bg-gray-800 text-white shadow-md"
                  }`}
                >
                  {showVisualization
                    ? "Ocultar Visualización"
                    : "Mostrar Visualización"}
                </button>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-slate-200 sidebar-section">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-800">
                  Puntos de Entrega
                </h4>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {nodes.length}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all node-item"
                  style={{
                    borderLeft: `4px solid ${
                      node.isDepot
                        ? MODERN_COLORS.primary
                        : CLUSTER_COLORS[node.cluster % CLUSTER_COLORS.length]
                    }`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{
                        backgroundColor: node.isDepot
                          ? MODERN_COLORS.primary
                          : CLUSTER_COLORS[
                              node.cluster % CLUSTER_COLORS.length
                            ],
                      }}
                    >
                      {node.isDepot ? "D" : node.id}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">
                        {node.isDepot
                          ? "Depósito Principal"
                          : `Punto ${node.id}`}
                      </div>
                      {!node.isDepot && (
                        <div className="text-sm text-slate-600">
                          Cluster {node.cluster} • Demanda: {node.demand}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeNode(node.id)}
                    className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-all"
                  >
                    ❌
                  </button>
                </div>
              ))}

              {nodes.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">📍</div>
                  <div className="text-sm">No hay puntos agregados</div>
                  <div className="text-xs">
                    Usa el botón "Seleccionar en Mapa" para agregar puntos
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 relative">
        <MapContainer
          center={PENAFLOR_CENTER}
          zoom={13}
          className="h-full w-full"
          style={{ borderRadius: "0 0 0 0" }}
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
              ? MODERN_COLORS.primary
              : CLUSTER_COLORS[node.cluster % CLUSTER_COLORS.length];
            const icon = createCustomIcon(color, node.isDepot);
            return (
              <Marker key={node.id} position={[node.lat, node.lon]} icon={icon}>
                <Popup className="custom-popup">
                  <div className="p-3 min-w-[200px]">
                    <div className="text-center mb-3">
                      <div className="text-lg font-bold text-slate-800 mb-1">
                        {node.isDepot
                          ? "� Depósito Principal"
                          : `📍 Punto ${node.id}`}
                      </div>
                      {!node.isDepot && (
                        <div className="text-sm text-slate-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>🎯 Cluster:</span>
                            <span className="font-semibold">
                              {node.cluster}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>📦 Demanda:</span>
                            <span className="font-semibold">{node.demand}</span>
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-2">
                        🌍 {node.lat.toFixed(4)}, {node.lon.toFixed(4)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeNode(node.id)}
                      className="w-full py-2 px-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all"
                    >
                      🗑️ Eliminar Punto
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
                  fillOpacity: 0.15,
                  weight: 3,
                  dashArray: "10, 10",
                }}
              >
                <Tooltip permanent className="cluster-tooltip">
                  <div className="bg-white p-2 rounded-lg shadow-lg border border-slate-200 text-center text-sm">
                    <div className="font-semibold text-slate-800">
                      🎯 Cluster {cluster.id}
                    </div>
                    <div className="text-slate-600">
                      📏 {(cluster.radius / 1000).toFixed(2)} km
                    </div>
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
                    weight: 5,
                    opacity: 0.9,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                >
                  <Tooltip className="route-tooltip">
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-sm">
                      <div className="font-bold text-slate-800 mb-2">
                        🚚 Vehículo {vehicleIndex + 1}
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div>📍 Puntos: {route.length - 2}</div>
                        <div>🎯 Ruta: {route.join(" → ")}</div>
                        {solution.metrics.routeMetrics &&
                          solution.metrics.routeMetrics[vehicleIndex] && (
                            <>
                              <div>
                                📏 Distancia:{" "}
                                {solution.metrics.routeMetrics[
                                  vehicleIndex
                                ].distance.toFixed(1)}{" "}
                                km
                              </div>
                              <div>
                                📦 Carga:{" "}
                                {
                                  solution.metrics.routeMetrics[vehicleIndex]
                                    .totalDemand
                                }
                              </div>
                            </>
                          )}
                      </div>
                    </div>
                  </Tooltip>
                </Polyline>
              );
            })}
        </MapContainer>
        {isAddingNode && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl border border-blue-400">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-lg">📍</span>
                </div>
                <div>
                  <div className="font-bold text-sm">
                    Modo de Selección Activo
                  </div>
                  <div className="text-xs text-blue-200">
                    Haz clic en el mapa para añadir un{" "}
                    {newNodeData.isDepot ? "depósito" : "punto de entrega"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showVisualization && solution && (
          <div className="absolute bottom-6 left-6 z-50">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-slate-200">
              <div className="text-sm font-semibold text-slate-800 mb-3">
                🎨 Leyenda
              </div>
              <div className="space-y-2">
                {VEHICLE_COLORS.slice(0, vrpParams.numVehicles).map(
                  (color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-4 h-1 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-xs text-slate-600">
                        Vehículo {index + 1}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mapa;
