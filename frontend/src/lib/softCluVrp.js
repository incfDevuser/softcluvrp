// SoftCluVRP Algorithm Implementation for JavaScript
// Based on the Python implementation with geographical coordinates support

// Colores para clusters y vehículos
export const CLUSTER_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#FFB347",
  "#87CEEB",
  "#98D8C8",
  "#F7DC6F",
];

export const VEHICLE_COLORS = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33F5",
  "#F5FF33",
  "#33FFF5",
  "#F533FF",
  "#FF8C33",
  "#8C33FF",
  "#33FF8C",
];

// Clase Node para representar puntos en el mapa
class Node {
  constructor(id, lat, lon, demand, cluster, isDepot = false) {
    this.id = id;
    this.lat = lat;
    this.lon = lon;
    this.demand = demand;
    this.cluster = cluster;
    this.isDepot = isDepot;
  }

  // Calcular distancia usando la fórmula de Haversine para coordenadas geográficas
  distanceTo(other) {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = ((other.lat - this.lat) * Math.PI) / 180;
    const dLon = ((other.lon - this.lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((this.lat * Math.PI) / 180) *
        Math.cos((other.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en metros
  }

  // Distancia euclidiana para coordenadas planas (backup)
  euclideanDistanceTo(other) {
    return Math.sqrt(
      Math.pow(this.lat - other.lat, 2) + Math.pow(this.lon - other.lon, 2)
    );
  }
}

// Clase principal del algoritmo SoftCluVRP
class SoftCluVRPSolver {
  constructor(nodes, numVehicles, capacity, penalty = 1000) {
    this.nodes = new Map();
    this.depotId = null;
    this.penalty = penalty;
    this.numVehicles = numVehicles;
    this.capacity = capacity;
    this.routes = [];

    // Procesar nodos de entrada
    nodes.forEach((nodeData) => {
      const node = new Node(
        nodeData.id,
        nodeData.lat,
        nodeData.lon,
        nodeData.demand,
        nodeData.cluster,
        nodeData.isDepot
      );
      this.nodes.set(node.id, node);

      if (node.isDepot) {
        this.depotId = node.id;
      }
    });

    // Validaciones
    if (!this.depotId) {
      throw new Error("No se encontró un depósito en los nodos");
    }

    if (this.nodes.size < 2) {
      throw new Error("Se necesitan al menos 2 nodos (incluyendo el depósito)");
    }
  } // Algoritmo principal de construcción de rutas (corregido para coincidir con Python)
  constructRoutes() {
    // Inicializar rutas con el depósito
    this.routes = Array(this.numVehicles)
      .fill(null)
      .map(() => [this.depotId]);

    // Nodos no visitados (excluye el depósito)
    const unvisited = new Set(
      [...this.nodes.keys()].filter((id) => id !== this.depotId)
    );

    // Capacidad restante por vehículo
    const remainingCapacity = Array(this.numVehicles).fill(this.capacity);

    console.log(`📍 Iniciando construcción de rutas:`);
    console.log(`   • Total nodos a visitar: ${unvisited.size}`);
    console.log(`   • Vehículos disponibles: ${this.numVehicles}`);

    // Algoritmo greedy exactamente como el Python
    while (unvisited.size > 0) {
      let minCost = Infinity;
      let bestNode = null;
      let bestRoute = null;

      // Evaluar todos los nodos no visitados
      for (const nodeId of unvisited) {
        const node = this.nodes.get(nodeId);

        // Evaluar inserción en cada ruta
        for (let i = 0; i < this.routes.length; i++) {
          // Verificar capacidad
          if (node.demand <= remainingCapacity[i]) {
            const route = this.routes[i];
            const lastNodeId = route[route.length - 1];
            const lastNode = this.nodes.get(lastNodeId);

            // Calcular SOLO la distancia (como en Python)
            const distance = lastNode.distanceTo(node);

            if (distance < minCost) {
              minCost = distance;
              bestNode = nodeId;
              bestRoute = i;
            }
          }
        }
      }

      // Si no se puede insertar ningún nodo debido a capacidad
      if (bestNode === null) {
        console.warn(
          "⚠️  Advertencia: No se pudieron asignar todos los nodos debido a restricciones de capacidad"
        );
        console.warn(`    Nodos restantes sin visitar: ${unvisited.size}`);
        console.warn(`    Nodos: ${Array.from(unvisited).join(", ")}`);

        // Mostrar información de capacidades restantes
        for (let i = 0; i < remainingCapacity.length; i++) {
          console.warn(
            `    Vehículo ${i + 1}: Capacidad restante ${remainingCapacity[i]}`
          );
        }

        // Mostrar demandas de nodos no visitados
        for (const nodeId of unvisited) {
          const node = this.nodes.get(nodeId);
          console.warn(
            `    Nodo ${nodeId}: Demanda ${node.demand}, Cluster ${node.cluster}`
          );
        }

        break;
      }

      // Insertar el mejor nodo en la mejor ruta
      this.routes[bestRoute].push(bestNode);
      remainingCapacity[bestRoute] -= this.nodes.get(bestNode).demand;
      unvisited.delete(bestNode);

      // Log de progreso cada 5 inserciones
      if (
        (this.nodes.size - 1 - unvisited.size) % 5 === 0 ||
        unvisited.size === 0
      ) {
        console.log(
          `   • Nodos asignados: ${this.nodes.size - 1 - unvisited.size}/${
            this.nodes.size - 1
          }`
        );
      }
    }

    // Verificar que todos los nodos fueron visitados
    if (unvisited.size > 0) {
      throw new Error(
        `Error crítico: ${
          unvisited.size
        } nodos no fueron visitados: ${Array.from(unvisited).join(", ")}`
      );
    }
    // Cerrar todas las rutas regresando al depósito
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i][this.routes[i].length - 1] !== this.depotId) {
        this.routes[i].push(this.depotId);
      }
    }

    console.log(`✅ Construcción completada exitosamente`);
    return this.routes;
  } // Calcular penalización simple por inserción de nodo
  calculateInsertionPenalty(route, newNodeId) {
    const newNode = this.nodes.get(newNodeId);

    // Si es el primer nodo del cluster en la ruta, no hay penalización
    let hasClusterNodes = false;
    for (const nodeId of route) {
      if (nodeId !== this.depotId) {
        const node = this.nodes.get(nodeId);
        if (node.cluster === newNode.cluster) {
          hasClusterNodes = true;
          break;
        }
      }
    }

    if (!hasClusterNodes) {
      return 0; // No hay penalización si es el primer nodo del cluster
    }

    // Verificar si el nodo creará una violación de consecutividad
    const tempRoute = [...route, newNodeId];
    const clusterPositions = [];

    for (let i = 0; i < tempRoute.length; i++) {
      const nodeId = tempRoute[i];
      if (nodeId !== this.depotId) {
        const node = this.nodes.get(nodeId);
        if (node.cluster === newNode.cluster) {
          clusterPositions.push(i);
        }
      }
    }

    // Si hay más de un nodo del cluster, verificar consecutividad
    if (clusterPositions.length > 1) {
      const sortedPositions = clusterPositions.sort((a, b) => a - b);
      const isConsecutive = sortedPositions.every(
        (pos, idx) => idx === 0 || pos === sortedPositions[idx - 1] + 1
      );

      if (!isConsecutive) {
        return this.penalty * 0.5; // Penalización por no-consecutividad
      }
    }

    return 0; // Sin penalización
  } // Evaluar una ruta individual (simplificado)
  evaluateRoute(route) {
    let totalDistance = 0;
    let clusterViolations = 0;

    // Calcular distancia total
    for (let i = 1; i < route.length; i++) {
      const prevNode = this.nodes.get(route[i - 1]);
      const currentNode = this.nodes.get(route[i]);
      totalDistance += prevNode.distanceTo(currentNode);
    }

    // Agrupar nodos por cluster
    const clusterGroups = new Map();
    for (let i = 0; i < route.length; i++) {
      const nodeId = route[i];
      if (nodeId !== this.depotId) {
        const node = this.nodes.get(nodeId);
        if (!clusterGroups.has(node.cluster)) {
          clusterGroups.set(node.cluster, []);
        }
        clusterGroups.get(node.cluster).push(i);
      }
    }

    // Evaluar violaciones de cluster
    for (const [clusterId, positions] of clusterGroups) {
      if (positions.length > 1) {
        // Verificar consecutividad
        const sortedPositions = positions.sort((a, b) => a - b);
        const minPos = sortedPositions[0];
        const maxPos = sortedPositions[sortedPositions.length - 1];

        // Si no son consecutivos, hay violación
        if (maxPos - minPos + 1 !== sortedPositions.length) {
          clusterViolations++;
        }
      }
    }

    return {
      distance: totalDistance,
      violations: clusterViolations,
    };
  }
  // Evaluar toda la solución
  evaluateSolution() {
    let totalDistance = 0;
    let totalViolations = 0;
    const routeMetrics = [];

    // Evaluar cada ruta individualmente
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      const evaluation = this.evaluateRoute(route);

      totalDistance += evaluation.distance;
      totalViolations += evaluation.violations;

      // Calcular demanda total de la ruta
      const totalDemand = route
        .filter((nodeId) => nodeId !== this.depotId)
        .reduce((sum, nodeId) => sum + this.nodes.get(nodeId).demand, 0);

      routeMetrics.push({
        vehicle: i + 1,
        distance: evaluation.distance,
        violations: evaluation.violations,
        nodes: route.length - 2, // Excluir depósitos inicial y final
        totalDemand: totalDemand,
      });
    }

    // Evaluar violaciones globales de clusters
    const globalViolations = this.evaluateGlobalClusterViolations();
    totalViolations += globalViolations;

    const totalPenalty = totalViolations * this.penalty;
    const totalCost = totalDistance + totalPenalty;

    return {
      totalDistance,
      totalViolations,
      totalPenalty,
      totalCost,
      routeMetrics,
      globalClusterViolations: globalViolations,
    };
  }
  // Evaluar violaciones globales de clusters (simplificado)
  evaluateGlobalClusterViolations() {
    const allClusters = new Set();
    for (const [nodeId, node] of this.nodes) {
      if (!node.isDepot) {
        allClusters.add(node.cluster);
      }
    }

    let globalViolations = 0;

    // Para cada cluster, verificar si está dividido entre múltiples rutas
    for (const clusterId of allClusters) {
      const routesWithCluster = new Set();

      // Verificar en qué rutas aparece este cluster
      for (let i = 0; i < this.routes.length; i++) {
        const route = this.routes[i];

        for (const nodeId of route) {
          if (nodeId !== this.depotId) {
            const node = this.nodes.get(nodeId);
            if (node.cluster === clusterId) {
              routesWithCluster.add(i);
              break; // Solo necesitamos saber si el cluster está en esta ruta
            }
          }
        }
      }

      // Una violación por cada ruta extra que contiene el cluster
      if (routesWithCluster.size > 1) {
        globalViolations += routesWithCluster.size - 1;
      }
    }

    return globalViolations;
  }

  // Calcular centros y radios de clusters para visualización
  calculateClusters() {
    const clusterData = new Map();

    // Agrupar nodos por cluster
    for (const [nodeId, node] of this.nodes) {
      if (node.isDepot) continue;

      if (!clusterData.has(node.cluster)) {
        clusterData.set(node.cluster, []);
      }
      clusterData.get(node.cluster).push(node);
    }

    const clusters = [];

    // Calcular centro y radio de cada cluster
    for (const [clusterId, nodes] of clusterData) {
      if (nodes.length === 0) continue;

      // Calcular centro (promedio de coordenadas)
      const centerLat =
        nodes.reduce((sum, node) => sum + node.lat, 0) / nodes.length;
      const centerLon =
        nodes.reduce((sum, node) => sum + node.lon, 0) / nodes.length;

      // Calcular radio (distancia máxima al centro)
      const center = { lat: centerLat, lon: centerLon };
      let maxDistance = 0;

      for (const node of nodes) {
        const distance = Math.sqrt(
          Math.pow((node.lat - center.lat) * 111000, 2) + // Conversión aproximada a metros
            Math.pow(
              (node.lon - center.lon) *
                111000 *
                Math.cos((center.lat * Math.PI) / 180),
              2
            )
        );
        maxDistance = Math.max(maxDistance, distance);
      }

      clusters.push({
        id: clusterId,
        center: { lat: centerLat, lon: centerLon },
        radius: maxDistance,
        nodes: nodes.map((node) => node.id),
        color: CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length],
      });
    }

    return clusters;
  } // Resolver el problema SoftCluVRP con análisis mejorado
  solve() {
    console.log("🚀 Iniciando resolución SoftCluVRP...");

    // Análisis preliminar del problema
    const clusterInfo = this.getClusterInfo();
    const totalClientNodes = this.nodes.size - 1; // Excluir depósito

    console.log(`📊 Análisis del problema:`);
    console.log(
      `   • Total nodos: ${this.nodes.size} (${totalClientNodes} clientes + 1 depósito)`
    );
    console.log(`   • Vehículos: ${this.numVehicles}`);
    console.log(`   • Capacidad por vehículo: ${this.capacity}`);
    console.log(`   • Clusters detectados: ${clusterInfo.totalClusters}`);
    console.log(`   • Penalización por violación: ${this.penalty}`);

    // Verificar factibilidad del problema
    let totalDemand = 0;
    let maxNodeDemand = 0;

    for (const [nodeId, node] of this.nodes) {
      if (!node.isDepot) {
        totalDemand += node.demand;
        maxNodeDemand = Math.max(maxNodeDemand, node.demand);
      }
    }

    const totalCapacity = this.numVehicles * this.capacity;

    console.log(`🔍 Análisis de factibilidad:`);
    console.log(`   • Demanda total: ${totalDemand}`);
    console.log(`   • Capacidad total disponible: ${totalCapacity}`);
    console.log(`   • Demanda máxima individual: ${maxNodeDemand}`);

    if (totalDemand > totalCapacity) {
      throw new Error(
        `Problema no factible: Demanda total (${totalDemand}) excede capacidad total (${totalCapacity})`
      );
    }

    if (maxNodeDemand > this.capacity) {
      throw new Error(
        `Problema no factible: Nodo con demanda ${maxNodeDemand} excede capacidad de vehículo (${this.capacity})`
      );
    }

    // Análisis de clusters vs vehículos
    if (clusterInfo.totalClusters > this.numVehicles) {
      const excessClusters = clusterInfo.totalClusters - this.numVehicles;
      console.log(
        `⚠️  ADVERTENCIA: Más clusters (${clusterInfo.totalClusters}) que vehículos (${this.numVehicles})`
      );
      console.log(`   • Clusters excedentes: ${excessClusters}`);
      console.log(`   • Violaciones mínimas esperadas: ${excessClusters}`);
      console.log(
        `   • El algoritmo DEBE visitar todos los clusters con penalizaciones`
      );
    }

    try {
      // Construir rutas
      const routes = this.constructRoutes();

      // Validar que todas las rutas están bien formadas
      const validation = this.validateSolution();
      if (!validation.isValid) {
        throw new Error(`Solución inválida: ${validation.errors.join(", ")}`);
      }

      // Evaluar solución
      const evaluation = this.evaluateSolution();

      // Verificar que todos los clusters fueron visitados
      const visitedClusters = new Set();
      for (const route of routes) {
        for (const nodeId of route) {
          if (nodeId !== this.depotId) {
            const node = this.nodes.get(nodeId);
            visitedClusters.add(node.cluster);
          }
        }
      }

      if (visitedClusters.size !== clusterInfo.totalClusters) {
        const unvisitedClusters = clusterInfo.clusters.filter(
          (c) => !visitedClusters.has(c)
        );
        throw new Error(
          `Error crítico: Clusters no visitados: ${unvisitedClusters.join(
            ", "
          )}`
        );
      }

      console.log("\n🎯 Solución encontrada:");
      console.log(
        `   • Distancia total: ${evaluation.totalDistance.toFixed(2)} metros`
      );
      console.log(`   • Violaciones totales: ${evaluation.totalViolations}`);
      console.log(
        `     - Violaciones locales (no-consecutividad): ${
          evaluation.totalViolations - evaluation.globalClusterViolations
        }`
      );
      console.log(
        `     - Violaciones globales (clusters divididos): ${evaluation.globalClusterViolations}`
      );
      console.log(
        `   • Penalización total: ${evaluation.totalPenalty.toFixed(2)}`
      );
      console.log(`   • Costo total: ${evaluation.totalCost.toFixed(2)}`);

      // Análisis detallado de rutas y clusters
      console.log(`\n📋 Detalle de rutas:`);
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        const clientNodes = route.filter((id) => id !== this.depotId);

        if (clientNodes.length > 0) {
          const routeClusters = new Set();
          let totalDemand = 0;

          for (const nodeId of clientNodes) {
            const node = this.nodes.get(nodeId);
            routeClusters.add(node.cluster);
            totalDemand += node.demand;
          }

          console.log(
            `   Vehículo ${i + 1}: ${clientNodes.length} nodos, ${
              routeClusters.size
            } clusters [${Array.from(routeClusters).join(
              ", "
            )}], demanda ${totalDemand}/${this.capacity}`
          );
        } else {
          console.log(`   Vehículo ${i + 1}: Sin asignaciones`);
        }
      }

      console.log(`\n✅ Verificación final:`);
      console.log(
        `   • Todos los ${totalClientNodes} nodos cliente fueron visitados`
      );
      console.log(
        `   • Todos los ${clusterInfo.totalClusters} clusters fueron visitados`
      );
      console.log(`   • Capacidades respetadas en todas las rutas`);

      return {
        routes: routes,
        evaluation: evaluation,
        metrics: evaluation, // Alias para compatibilidad
        clusters: this.calculateClusters(),
        problemAnalysis: {
          totalClusters: clusterInfo.totalClusters,
          totalVehicles: this.numVehicles,
          clusterVehicleRatio: clusterInfo.totalClusters / this.numVehicles,
          expectedMinViolations: Math.max(
            0,
            clusterInfo.totalClusters - this.numVehicles
          ),
          totalNodesVisited: totalClientNodes,
          clustersVisited: visitedClusters.size,
        },
      };
    } catch (error) {
      console.error(
        "❌ Error en la construcción de la solución:",
        error.message
      );
      throw error;
    }
  }

  // Obtener información detallada de clusters
  getClusterInfo() {
    const clusters = new Set();
    const clusterSizes = new Map();
    const clusterDemands = new Map();
    const clusterNodes = new Map();

    for (const [nodeId, node] of this.nodes) {
      if (!node.isDepot) {
        clusters.add(node.cluster);

        if (!clusterSizes.has(node.cluster)) {
          clusterSizes.set(node.cluster, 0);
          clusterDemands.set(node.cluster, 0);
          clusterNodes.set(node.cluster, []);
        }

        clusterSizes.set(node.cluster, clusterSizes.get(node.cluster) + 1);
        clusterDemands.set(
          node.cluster,
          clusterDemands.get(node.cluster) + node.demand
        );
        clusterNodes.get(node.cluster).push(nodeId);
      }
    }

    return {
      totalClusters: clusters.size,
      clusters: Array.from(clusters).sort((a, b) => a - b),
      clusterSizes: clusterSizes,
      clusterDemands: clusterDemands,
      clusterNodes: clusterNodes,
      avgNodesPerCluster:
        [...clusterSizes.values()].reduce((a, b) => a + b, 0) / clusters.size,
    };
  }
  // Validar si una solución es factible
  validateSolution() {
    const errors = [];

    // Verificar que todas las rutas empiecen y terminen en el depósito
    for (let i = 0; i < this.routes.length; i++) {
      const route = this.routes[i];
      if (route.length < 2) {
        errors.push(`Ruta ${i + 1}: Ruta vacía o inválida`);
        continue;
      }

      if (
        route[0] !== this.depotId ||
        route[route.length - 1] !== this.depotId
      ) {
        errors.push(`Ruta ${i + 1}: No empieza o termina en el depósito`);
      }

      // Verificar capacidad
      const totalDemand = route
        .filter((nodeId) => nodeId !== this.depotId)
        .reduce((sum, nodeId) => sum + this.nodes.get(nodeId).demand, 0);

      if (totalDemand > this.capacity) {
        errors.push(
          `Ruta ${i + 1}: Excede capacidad (${totalDemand} > ${this.capacity})`
        );
      }
    }

    // Verificar que todos los nodos (excepto depósito) sean visitados exactamente una vez
    const visitedNodes = new Set();
    const duplicatedNodes = new Set();

    for (const route of this.routes) {
      for (const nodeId of route) {
        if (nodeId !== this.depotId) {
          if (visitedNodes.has(nodeId)) {
            duplicatedNodes.add(nodeId);
          } else {
            visitedNodes.add(nodeId);
          }
        }
      }
    }

    if (duplicatedNodes.size > 0) {
      errors.push(
        `Nodos visitados múltiples veces: ${Array.from(duplicatedNodes).join(
          ", "
        )}`
      );
    }
    const allClientNodes = [...this.nodes.keys()].filter(
      (id) => id !== this.depotId
    );
    const unvisitedNodes = allClientNodes.filter((id) => !visitedNodes.has(id));

    if (unvisitedNodes.length > 0) {
      errors.push(`Nodos no visitados: ${unvisitedNodes.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }
}

// Función principal para resolver SoftCluVRP con coordenadas geográficas
export function solveSoftCluVRPGeo(
  nodes,
  numVehicles,
  capacity,
  penalty = 1000
) {
  try {
    // Validar entrada
    if (!Array.isArray(nodes) || nodes.length < 2) {
      throw new Error("Se requieren al menos 2 nodos");
    }

    if (numVehicles < 1) {
      throw new Error("Se requiere al menos 1 vehículo");
    }

    if (capacity < 1) {
      throw new Error("La capacidad debe ser mayor a 0");
    }

    // Verificar que hay al menos un depósito
    const hasDepot = nodes.some((node) => node.isDepot);
    if (!hasDepot) {
      throw new Error("Se requiere al menos un depósito");
    }
    // Crear solver y construir solución
    const solver = new SoftCluVRPSolver(nodes, numVehicles, capacity, penalty);
    const solution = solver.solve();

    console.log("SoftCluVRP resuelto exitosamente:", {
      nodos: nodes.length,
      vehículos: numVehicles,
      rutas: solution.routes.length,
      costoTotal: solution.evaluation.totalCost.toFixed(2),
    });

    return solution;
  } catch (error) {
    console.error("Error resolviendo SoftCluVRP:", error);
    throw error;
  }
}

// Función utilitaria para crear nodos desde datos del mapa
export function createNodeFromMapData(mapNodes) {
  return mapNodes.map((node) => ({
    id: node.id,
    lat: node.lat,
    lon: node.lon,
    demand: node.demand || 0,
    cluster: node.cluster || 1,
    isDepot: node.isDepot || false,
  }));
}

// Función para validar solución
export function validateSolution(nodes, solution, capacity) {
  const errors = [];

  // Verificar que todas las rutas empiecen y terminen en el depósito
  const depot = nodes.find((n) => n.isDepot);
  if (!depot) {
    errors.push("No se encontró depósito");
    return errors;
  }

  for (let i = 0; i < solution.routes.length; i++) {
    const route = solution.routes[i];

    if (route.length < 2) {
      errors.push(`Ruta ${i + 1} es demasiado corta`);
      continue;
    }

    if (route[0] !== depot.id || route[route.length - 1] !== depot.id) {
      errors.push(`Ruta ${i + 1} no empieza/termina en el depósito`);
    }

    // Verificar capacidad
    let totalDemand = 0;
    for (let j = 1; j < route.length - 1; j++) {
      const node = nodes.find((n) => n.id === route[j]);
      if (node) {
        totalDemand += node.demand;
      }
    }

    if (totalDemand > capacity) {
      errors.push(
        `Ruta ${i + 1} excede la capacidad: ${totalDemand} > ${capacity}`
      );
    }
  }

  // Verificar que todos los nodos no-depósito estén visitados
  const visitedNodes = new Set();
  solution.routes.forEach((route) => {
    route.forEach((nodeId) => {
      if (nodeId !== depot.id) {
        visitedNodes.add(nodeId);
      }
    });
  });

  const allNonDepotNodes = nodes.filter((n) => !n.isDepot).map((n) => n.id);
  for (const nodeId of allNonDepotNodes) {
    if (!visitedNodes.has(nodeId)) {
      errors.push(`Nodo ${nodeId} no fue visitado`);
    }
  }

  return errors;
}

// Función para validar solución
export function validateSolutionData(solution, nodes) {
  try {
    if (!solution || !solution.routes) {
      throw new Error("Solución inválida: falta estructura de rutas");
    }

    // Verificar que todas las rutas están completas
    for (let i = 0; i < solution.routes.length; i++) {
      const route = solution.routes[i];
      if (!Array.isArray(route) || route.length < 2) {
        throw new Error(`Ruta ${i + 1} inválida: debe tener al menos 2 nodos`);
      }
    }

    // Verificar métricas (evaluation o metrics)
    if (!solution.evaluation && !solution.metrics) {
      console.warn("Advertencia: Solución sin métricas de evaluación");
    }

    return {
      isValid: true,
      message: "Solución válida",
    };
  } catch (error) {
    return {
      isValid: false,
      message: error.message,
    };
  }
}

// Función para obtener estadísticas de la solución
export function getSolutionStats(solution) {
  if (!solution || !solution.routes) {
    return null;
  }

  // Usar evaluation o metrics según lo que esté disponible
  const metrics = solution.evaluation || solution.metrics;

  const stats = {
    totalRoutes: solution.routes.length,
    totalNodes: 0,
    totalDistance: metrics?.totalDistance || 0,
    totalViolations: metrics?.totalViolations || 0,
    routeStats: [],
  };

  for (let i = 0; i < solution.routes.length; i++) {
    const route = solution.routes[i];
    const routeNodes = route.filter(
      (nodeId, index) => index !== 0 && index !== route.length - 1
    ); // Excluir depósitos

    stats.totalNodes += routeNodes.length;
    stats.routeStats.push({
      vehicle: i + 1,
      nodes: routeNodes.length,
      distance: metrics?.routeMetrics?.[i]?.distance || 0,
      violations: metrics?.routeMetrics?.[i]?.violations || 0,
    });
  }

  return stats;
}

// Función auxiliar para obtener la solución completa del solver
function getSolutionComplete(solver) {
  const metrics = solver.evaluateSolution();
  const clusters = solver.calculateClusters();

  return {
    routes: solver.routes,
    evaluation: metrics,
    clusters,
    vehicles: solver.numVehicles,
    totalNodes: solver.nodes.size,
  };
}

// Exportar clases y funciones principales
export { Node, SoftCluVRPSolver };
export default solveSoftCluVRPGeo;
