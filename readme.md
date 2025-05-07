# SoftCluVRP – Heurística y Metaheurística para Clústers Suaves

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)

Este repositorio contiene una implementación completa del problema **Soft Clustered Vehicle Routing Problem (SoftCluVRP)**, una variante del TSP que permite romper clústers con penalización. Se incluyen dos enfoques de resolución:

- ✅ **Heurística propia en Python** basada en vecino más cercano + penalización por clústers incompletos.  
- ⚙️ **LKH 3.0** para obtener rutas eficientes a partir del formato `.tsp`.

## 📂 Estructura del repositorio

| Archivo / Carpeta           | Descripción                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|
| `eil22.vrp`                 | Instancia CVRP original con demandas y coordenadas                          |
| `transformar_vpr_tsp.py`    | Script que convierte `.vrp` → `.tsp` compatible con TSPLIB                  |
| `eil22.tsp`                 | Archivo `.tsp` resultante                                                   |
| `eil22.clu`                 | Asignación de clústers para cada nodo (formato simple `CLUSTER_SECTION`)    |
| `eil22.par`                 | Archivo de parámetros para LKH                                              |
| `eil22.sol`                 | Tour generado por LKH 3.0                                                   |
| `LKH.exe`                   | Ejecutable del solver LKH 3.0 (Windows)                                     |
| `main.py`                   | Visualización + penalización SoftCluVRP sobre el tour de LKH                |
| `heuristica_softcluvrp.py`  | Heurística pura en Python (no depende de LKH)                               |

## 🚀 Cómo ejecutar

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/softcluvrp.git
cd softcluvrp
```

### 2. Instalar dependencias

```bash
pip install matplotlib numpy pandas
```

> **Recomendación:** Crear un entorno virtual mediante `python -m venv venv` seguido de `source venv/bin/activate` (Linux/macOS) o `venv\Scripts\activate` (Windows).

### 3. Ejecutar la heurística propia (Python)

```bash
python heuristica_softcluvrp.py
```

Esta heurística:
- Construye un recorrido utilizando el algoritmo de vecino más cercano
- Calcula la penalización por clústers incompletos
- Muestra un gráfico interactivo del tour resultante

### 4. Ejecutar LKH 3.0

```bash
LKH.exe eil22.par
```

Esto generará el archivo `eil22.sol`. Para visualizar el resultado con la penalización SoftCluVRP:

```bash
python main.py
```

## 📊 SoftCluVRP: Fundamentos teóricos

SoftCluVRP generaliza el CluVRP permitiendo interrumpir un clúster a cambio de una penalización. La función objetivo a minimizar es:

```
Costo total = Distancia del tour + α · (número de clústers rotos)
```

Donde:
- Un clúster se considera "roto" si sus clientes no son visitados de forma continua
- α es el coeficiente de penalización (por defecto 1000 en esta implementación)

Este modelo es especialmente útil en escenarios logísticos donde seguir agrupaciones es deseable pero no obligatorio cuando implica un costo excesivo.

## 📈 Visualización

La visualización incluye:
- Representación gráfica de la ruta completa
- Identificación de clústers mediante colores
- Círculos que delimitan las zonas de cada clúster
- Marcado especial para el depósito (nodo 1)

## 📚 Créditos

**Desarrollado por:**
- Martin Gomez
- Diego Barria
- Vicente Gaete

Proyecto para el curso CINF105 – Optimización, Universidad de Chile, 2025.

## 🧠 Licencia

Distribuido bajo la [licencia MIT](LICENSE).
