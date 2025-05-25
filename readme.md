# SoftCluVRP – Heurística y Metaheurística para Clústers Suaves

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)

Este repositorio contiene una implementación completa del problema **Soft Clustered Vehicle Routing Problem (SoftCluVRP)**, una variante del TSP que permite romper clústers con penalización. Se incluyen dos enfoques de resolución:

- ✅ **Heurística propia en Python** basada en vecino más cercano + penalización por clústers incompletos.  
- ⚙️ **LKH 3.0** para obtener rutas eficientes a partir del formato `.tsp`.

## 📂 Estructura del repositorio

| Carpeta / Archivo        | Descripción                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `INSTANCES/`             | Contiene todas las instancias del problema SoftCluVRP en formato `.cluvrp` |
| `par_files/`             | Archivos `.par` generados automáticamente, listos para ejecutar con LKH    |
| `SOLUTIONS/`             | Archivos `.sol` generados por LKH que contienen la solución final          |
| `TOURS/`                 | Archivos `.tour` con el orden de visita resultante por LKH                 |
| `generar_par.py`         | Script para generar automáticamente los archivos `.par` a partir de las instancias |
| `run_all.sh`             | Script Bash que ejecuta todos los archivos `.par` con LKH desde MINGW64    |
| `LKH.exe`                | Ejecutable del solver LKH 3.0 (Windows)                                     |
| `main.py`                | Visualizador de soluciones con análisis de penalización por clústers rotos  |
| `visualizations/`        | Carpeta donde se guardan las imágenes de las visualizaciones               |




## 🚀 Cómo ejecutar

### 1. Clonar el repositorio
```bash
git clone https://github.com/incfDevuser/softcluvrp.git
cd softcluvrp
```

### 2. Instalar dependencias y preparar el entorno
> **Recomendación:** Crear un entorno virtual mediante `python -m venv venv` seguido de `source venv/bin/activate` (Linux/macOS) o `venv\Scripts\activate` (Windows).

```bash
pip install matplotlib numpy pandas
```

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
./LKH.exe par_files/instancia.par
```

Esto generará archivos de solución en la carpeta `SOLUTIONS/`. 

### 5. Visualizar soluciones con análisis de clústers

Para visualizar el resultado con la penalización SoftCluVRP:

```bash
python main.py
```

Se mostrará una lista de instancias disponibles y podrás seleccionar la que deseas visualizar. También puedes especificar directamente la instancia a visualizar:

```bash
python main.py nombre_instancia
```

La visualización:
- Muestra la ruta completa del tour
- Identifica los clústers con diferentes colores
- Dibuja círculos que delimitan cada clúster
- Marca el depósito (nodo 1) de forma especial
- Calcula y muestra el número de clústers rotos y su penalización
- Guarda la imagen en la carpeta `visualizations/`

## 📊 SoftCluVRP: Fundamentos teóricos

SoftCluVRP generaliza el CluVRP permitiendo interrumpir un clúster a cambio de una penalización. La función objetivo a minimizar es:

```
Costo total = Distancia del tour + α · (número de clústers rotos)
```

Donde:
- Un clúster se considera "roto" si sus clientes no son visitados de forma continua
- α es el coeficiente de penalización (por defecto 1000 en esta implementación)

Este modelo es especialmente útil en escenarios logísticos donde seguir agrupaciones es deseable pero no obligatorio cuando implica un costo excesivo.

## 📚 Créditos

**Desarrollado por:**
- Martin Gomez
- Diego Barria
- Vicente Gaete

Proyecto para el curso CINF105 – Optimización, Universidad Andrés Bello, 2025.