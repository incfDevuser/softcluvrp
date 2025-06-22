# SoftCluVRP – Heurística y Metaheurística para Clústers Suaves

[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

Este repositorio contiene una implementación completa del problema **Soft Clustered Vehicle Routing Problem (SoftCluVRP)**, una variante del VRP que permite romper clústers con penalización. Se incluyen múltiples enfoques de resolución:

- **Heurística propia en Python** basada en vecino más cercano con análisis avanzado de clusters
- **Implementación JavaScript** moderna con validación estricta y compatibilidad geográfica
- **Interfaz web interactiva** con React y visualización en tiempo real
- **LKH 3.0** para obtener rutas eficientes a partir del formato `.tsp`

## 📂 Estructura del repositorio

| Carpeta / Archivo        | Descripción                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `INSTANCES/`             | Contiene todas las instancias del problema SoftCluVRP en formato `.cluvrp` |
| `par_files/`             | Archivos `.par` generados automáticamente, listos para ejecutar con LKH    |
| `SOLUTIONS/`             | Archivos `.sol` generados por LKH que contienen la solución final          |
| `TOURS/`                 | Archivos `.tour` con el orden de visita resultante por LKH                 |
| `frontend/`              | **Aplicación web moderna** con React, Vite y visualización interactiva     |
| `generar_par.py`         | Script para generar automáticamente los archivos `.par` a partir de las instancias |
| `heuristica_softcluvrp.py` | **Implementación Python** de la heurística SoftCluVRP (referencia)      |
| `run_all.sh`             | Script Bash que ejecuta todos los archivos `.par` con LKH desde MINGW64    |
| `main.py`                | Visualizador de soluciones con análisis de penalización por clústers rotos  |
| `visualizations/`        | Carpeta donde se guardan las imágenes de las visualizaciones               |

### Estructura del Frontend

| Archivo / Carpeta        | Descripción                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `frontend/src/lib/softCluVrp.js` | **Implementación JavaScript** completa del algoritmo SoftCluVRP     |
| `frontend/src/pages/TestPage.jsx` | Interfaz moderna para probar el algoritmo con diferentes instancias |
| `frontend/src/components/Mapa.jsx` | Componente de visualización geográfica con notificaciones           |

## 🔍 Descripción del Problema

El **SoftCluVRP** es una extensión del Vehicle Routing Problem (VRP) que incorpora restricciones de clústeres "suaves":

- **Múltiples vehículos** con capacidades limitadas
- **Demandas variables** por cliente
- **Clústeres de clientes** que se prefiere mantener en la misma ruta
- **Penalizaciones** por romper clústeres (permitiendo flexibilidad)
- **Objetivo dual**: minimizar distancia total + penalizaciones por violaciones

### Tipos de Violaciones de Clúster

1. **Visitas no consecutivas**: Un clúster se visita en múltiples segmentos dentro de la misma ruta
2. **División entre rutas**: Un clúster se distribuye entre múltiples vehículos
3. **Clusters no visitados**: Solo ocurre en problemas infactibles (detectado automáticamente)

### Características Clave de la Implementación

- **Validación estricta**: Verifica que todos los nodos y clusters sean visitados
- **Análisis detallado**: Información completa de clusters, demandas y capacidades
- **Detección de infactibilidad**: Identifica problemas donde la demanda total excede la capacidad
- **Métricas completas**: Distancia, penalizaciones, eficiencia por vehículo y estadísticas de clusters
- **Compatibilidad geográfica**: Soporte para coordenadas reales y proyecciones cartográficas
- **Interfaz moderna**: React con diseño responsivo y notificaciones en tiempo real




## Cómo ejecutar

### 1. Clonar el repositorio
```bash
git clone https://github.com/incfDevuser/softcluvrp.git
cd softcluvrp
```

### 2. Opción A: Usar la Aplicación Web (Recomendado)

#### Instalar dependencias del frontend
```bash
cd frontend
npm install
```

#### Ejecutar en modo desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` con:
- **TestPage**: Interfaz para probar diferentes instancias
- **Visualización**: Mapas interactivos con rutas y clústeres
- **Análisis**: Métricas detalladas y detección de violaciones
- **Notificaciones**: Sistema de alertas para errores e infactibilidad

### 2. Opción B: Usar Python

#### Instalar dependencias Python
> **Recomendación:** Crear un entorno virtual mediante `python -m venv venv` seguido de `venv\Scripts\activate` (Windows).

```bash
pip install matplotlib numpy pandas
```

#### Ejecutar la heurística Python
```bash
python heuristica_softcluvrp.py
```

Esta implementación incluye:
- **Análisis completo** de clusters y capacidades
- **Validación estricta** de factibilidad
- **Métricas detalladas** de eficiencia
- **Visualización** con matplotlib

### 3. Ejecutar LKH 3.0 (Opcional)
```bash
./LKH.exe par_files/instancia.par
```

Esto generará archivos de solución en la carpeta `SOLUTIONS/`. 

### 4. Visualizar soluciones con análisis de clústers

Para visualizar el resultado con la penalización SoftCluVRP:

```bash
python main.py
```

Se mostrará una lista de instancias disponibles y podrás seleccionar la que deseas visualizar.

## 📊 SoftCluVRP: Fundamentos teóricos y Algoritmo

### Modelo Matemático

SoftCluVRP generaliza el CluVRP permitiendo interrumpir un clúster a cambio de una penalización. La función objetivo a minimizar es:

```
Costo total = Distancia del tour + α · (violaciones de clústers)
```

Donde:
- **Violación tipo 1**: Clúster visitado de forma no consecutiva en una ruta
- **Violación tipo 2**: Clúster dividido entre múltiples rutas  
- α es el coeficiente de penalización (configurable, por defecto 1000)

### Algoritmo Implementado

#### 1. Construcción de Rutas (Greedy Nearest Neighbor)
```javascript
for (let vehicle = 0; vehicle < numVehicles; vehicle++) {
    let currentNode = depot;
    let currentCapacity = 0;
    
    while (unvisitedNodes.length > 0) {
        let nearestNode = findNearestFeasibleNode(currentNode, unvisitedNodes, remainingCapacity);
        if (!nearestNode) break; 
        addToRoute(vehicle, nearestNode);
        currentNode = nearestNode;
        currentCapacity += demand[nearestNode];
    }
}
```

#### 2. Validación y Análisis
- **Verificación de completitud**: Todos los nodos deben ser visitados
- **Detección de infactibilidad**: `total_demand > total_capacity`
- **Análisis de clusters**: Identificación de violaciones y estadísticas

#### 3. Evaluación de Violaciones
```javascript
for (let clusterId of clusters) {
    let routes = findRoutesVisitingCluster(clusterId);
    
    if (routes.length > 1) {
        violations += routes.length - 1;
    }
    
    for (let route of routes) {
        let segments = findNonConsecutiveSegments(route, clusterId);
        if (segments > 1) {
            violations += segments - 1;
        }
    }
}
```

### Características Avanzadas

#### Análisis de Clusters
```javascript
getClusterInfo() {
    return {
        clustersFound: uniqueClusters.length,
        clusterSizes: clusterSizeDistribution,
        violatedClusters: violationsPerCluster,
        efficiencyMetrics: {
            avgNodesPerCluster: avgSize,
            clusterCompactness: compactnessScore
        }
    };
}
```

#### Detección de Problemas
- **Infactibilidad por capacidad**: Detecta si `sum(demands) > sum(capacities)`
- **Nodos no alcanzables**: Identifica problemas de conectividad
- **Clusters imposibles**: Detecta clusters con demanda > capacidad máxima

### Diferencias entre Implementaciones

| Característica | Python | JavaScript |
|---------------|--------|------------|
| **Construcción** | Nearest Neighbor | Nearest Neighbor |
| **Validación** | Estricta | Estricta |
| **Análisis** | Completo | Completo + Web |
| **Geolocalización** | ❌ | |
| **Interfaz** | Matplotlib | React + Leaflet |
| **Notificaciones** | Console | Toast + UI |

Este modelo es especialmente útil en escenarios logísticos donde seguir agrupaciones es deseable pero no obligatorio cuando implica un costo excesivo.

## 🎯 Casos de Uso y Ejemplos

### Ejemplo de Instancia Factible
```
Instancia: A-n32-k5-C11-V2
- Nodos: 32 clientes + 1 depósito
- Vehículos: 5 (capacidad total: 500)
- Demanda total: 385
- Clusters: 11
- Resultado: Factible, violaciones mínimas
```

### Ejemplo de Instancia Infactible
```
Instancia: 1200.vrp-C241-R5  
- Demanda total: 1200
- Capacidad total: 1205 (5 vehículos × 241)
- Resultado: Factible pero muy ajustado
```

### Tipos de Problemas Detectados

1. **Infactible por capacidad**
   ```
   Error: Total demand (1250) exceeds total capacity (1205)
   Recommendation: Increase vehicle capacity or add more vehicles
   ```

2. **Factible con alta penalización**
   ```
   Warning: 8 cluster violations detected
   Total penalty: 8000 (80% of total cost)
   ```

3. **Solución eficiente**
   ```
   Success: All 32 nodes visited, 2 minor violations
   Efficiency: 95%, Total cost: 1247.3
   ```

## 🔧 Configuración Avanzada

### Parámetros del Algoritmo (JavaScript)
```javascript
const config = {
    penaltyWeight: 1000,        // Peso de penalización por violación
    maxIterations: 1000,        // Máximo de iteraciones para mejora
    validationStrict: true,     // Validación estricta de completitud
    logLevel: 'info',          // 'debug', 'info', 'warn', 'error'
    geoProjection: 'mercator'   // Proyección para coordenadas geográficas
};
```
### Configuración de Visualización
```javascript
const mapConfig = {
    center: [lat, lng],         // Centro del mapa
    zoom: 12,                   // Nivel de zoom inicial
    showClusters: true,         // Mostrar delimitadores de clusters
    routeColors: ['#e74c3c', '#3498db', '#2ecc71'], // Colores por ruta
    notificationDuration: 5000  // Duración de notificaciones (ms)
};
```

## Testing y Validación

## Próximas Mejoras

- [ ] **Algoritmos metaheurísticos**: Simulated Annealing, Genetic Algorithm
- [ ] **Optimizaciones locales**: 2-opt, 3-opt, Or-opt
- [ ] **Soporte multi-objetivo**: Pareto frontier para distancia vs. penalizaciones
- [ ] **Integración con APIs**: Google Maps, OpenRouteService
- [ ] **Exportación avanzada**: Formatos KML, GPX para navegación
- [ ] **Análisis temporal**: Ventanas de tiempo y horarios de servicio

## Créditos y Licencia

### Desarrollado por:
- **Martin Gomez** - Implementación principal y algoritmos
- **Diego Barria** - Desarrollo frontend y visualización  
- **Vicente Gaete** - Testing y optimización

### Agradecimientos
- **Universidad Andrés Bello** - Curso CINF105 Optimización, 2025
- **Comunidad Open Source** - Librerías React, Leaflet, Vite
- **LKH Solver** - Keld Helsgaun's Lin-Kernighan-Helsgaun implementation


### Contribuciones
Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

### Soporte
Para reportar bugs o solicitar features, por favor abre un issue en GitHub con:
- Descripción detallada del problema
- Pasos para reproducir  
- Información del sistema (OS, navegador, versión Node.js)
- Archivos de instancia problemáticos (si aplica)

---