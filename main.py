import matplotlib.pyplot as plt
import numpy as np
from collections import defaultdict
import os
import sys
from matplotlib.patches import Circle
import glob
import re
def load_coords_from_cluvrp(cluvrp_file):
    coords = {}
    reading_coords = False
    reading_clusters = False
    clusters = {}
    with open(cluvrp_file) as f:
        for line in f:
            line = line.strip()
            if line == "NODE_COORD_SECTION":
                reading_coords = True
                continue
            if line == "GVRP_SET_SECTION":
                reading_coords = False
                reading_clusters = True
                continue
            if line == "DEMAND_SECTION":
                reading_coords = False
                reading_clusters = False
                continue
            if line == "EOF":
                break
            if reading_coords:
                parts = line.split()
                if len(parts) >= 3:
                    coords[int(parts[0])] = (float(parts[1]), float(parts[2]))
            if reading_clusters:
                parts = line.split()
                if len(parts) >= 2:
                    cluster_id = int(parts[0])
                    for i in range(1, len(parts)):
                        if parts[i] == "-1":
                            break
                        node_id = int(parts[i])
                        clusters[node_id] = cluster_id
    
    return coords, clusters
def load_tour(sol_file):
    tour = []
    with open(sol_file) as f:
        reading = False
        for line in f:
            line = line.strip()
            if line == "TOUR_SECTION":
                reading = True
                continue
            if line in ("EOF", "-1"):
                break
            if reading and line.strip():
                try:
                    tour.append(int(line))
                except ValueError:
                    continue 
    return tour
def count_cluster_breaks(tour, clusters):
    seen = defaultdict(list)
    for i, node in enumerate(tour):
        if node in clusters:
            cl = clusters[node]
            seen[cl].append(i)
    broken = 0
    for cl, positions in seen.items():
        if len(positions) <= 1:
            continue
        sorted_pos = sorted(positions)
        if max(sorted_pos) - min(sorted_pos) + 1 != len(sorted_pos):
            broken += 1
    return broken
def calculate_cluster_centers(coords, clusters):
    cluster_points = defaultdict(list)
    for node, cluster_id in clusters.items():
        if node in coords:
            cluster_points[cluster_id].append(coords[node])
    centers = {}
    for cluster_id, points in cluster_points.items():
        if points:
            x_coords, y_coords = zip(*points)
            centers[cluster_id] = (np.mean(x_coords), np.mean(y_coords))
    
    return centers
def calculate_cluster_radius(coords, clusters, centers):
    cluster_radius = {}
    for cluster_id, center in centers.items():
        max_distance = 0
        for node, cl in clusters.items():
            if cl == cluster_id and node in coords:
                dist = np.sqrt((coords[node][0] - center[0])**2 + (coords[node][1] - center[1])**2)
                max_distance = max(max_distance, dist)
        cluster_radius[cluster_id] = max_distance * 1.1
    return cluster_radius
def plot_tour(coords, tour, clusters, instance_name="", output_file=None):
    plt.figure(figsize=(12, 8))
    valid_tour = [node for node in tour if node in coords]
    unique_clusters = sorted(set(clusters.values()))
    cmap = plt.cm.get_cmap('tab10', len(unique_clusters))
    cluster_colors = {cl: cmap(i % 10) for i, cl in enumerate(unique_clusters)}
    centers = calculate_cluster_centers(coords, clusters)
    radii = calculate_cluster_radius(coords, clusters, centers)
    for cluster_id, center in centers.items():
        if cluster_id in radii:
            circle = Circle(
                center, 
                radii[cluster_id], 
                alpha=0.1, 
                color=cluster_colors[cluster_id],
                fill=True,
                zorder=1
            )
            plt.gca().add_patch(circle)
    for i in range(len(valid_tour)):
        a, b = valid_tour[i], valid_tour[(i + 1) % len(valid_tour)]
        if a in coords and b in coords:
            xa, ya = coords[a]
            xb, yb = coords[b]
            plt.plot([xa, xb], [ya, yb], color='gray', linestyle='-', linewidth=1, zorder=2)
    for node in valid_tour:
        if node in coords:
            x, y = coords[node]
            cluster_id = clusters.get(node)
            if cluster_id is not None:
                if node == 1:
                    plt.scatter(x, y, color='black', s=180, marker='*', edgecolors='white', linewidth=2, zorder=4)
                    plt.text(x, y + 2, f"DEPOT", fontsize=10, ha='center', fontweight='bold', zorder=5)
                else:
                    plt.scatter(x, y, color=cluster_colors[cluster_id], s=100, edgecolors='black', linewidth=1, zorder=3)
                    plt.text(x, y + 1.5, str(node), fontsize=8, ha='center', zorder=5)
    for cluster_id, center in centers.items():
        plt.text(
            center[0], center[1], 
            f"Cluster {cluster_id}", 
            fontsize=12, 
            ha='center', 
            va='center',
            bbox=dict(facecolor='white', alpha=0.7, boxstyle='round'),
            zorder=5
        )
    breaks = count_cluster_breaks(valid_tour, clusters)
    penalty = breaks * 1000 
    plt.title(f"SoftCluVRP – {instance_name} | {breaks} clústers rotos | Penalización: {penalty}", fontsize=14)
    plt.xlabel("X", fontsize=12)
    plt.ylabel("Y", fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.7)
    legend_elements = [plt.Line2D([0], [0], marker='o', color='w', 
                                  markerfacecolor=cluster_colors[cl], 
                                  markersize=10, label=f'Cluster {cl}') 
                       for cl in unique_clusters]
    plt.legend(handles=legend_elements, loc='upper right')
    
    plt.tight_layout()
    
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"Visualización guardada en: {output_file}")
    
    plt.show()

def process_instance_by_name(instance_name):
    """Process an instance based on its name (e.g., 'A-n32-k5-C11-V2')"""
    match = re.match(r'([A-Za-z]+)', instance_name)
    group = match.group(1) if match else ""
    cluvrp_file = os.path.join("INSTANCES", group, f"{instance_name}.cluvrp")
    sol_file = os.path.join("SOLUTIONS", group, f"{instance_name}.sol")
    if not os.path.exists(cluvrp_file):
        print(f"Error: Archivo de instancia no encontrado: {cluvrp_file}")
        return
    if not os.path.exists(sol_file):
        print(f"Error: Archivo de solución no encontrado: {sol_file}")
        return
    coords, clusters = load_coords_from_cluvrp(cluvrp_file)
    tour = load_tour(sol_file)
    output_file = f"visualizations/{instance_name}.png"
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    valid_tour = [node for node in tour if node in coords]
    breaks = count_cluster_breaks(valid_tour, clusters)
    penalty = breaks * 1000
    print(f"\n=== Instancia: {instance_name} ===")
    print(f"Nodos en tour: {len(tour)}")
    print(f"Nodos válidos: {len(valid_tour)}")
    print(f"Clústers rotos: {breaks}")
    print(f"Penalización total (SoftCluVPR): {penalty}")
    plot_tour(coords, valid_tour, clusters, instance_name, output_file)
def list_available_instances():
    """List all available instances in the INSTANCES folder"""
    instances = []
    for root, dirs, files in os.walk("INSTANCES"):
        for file in files:
            if file.endswith(".cluvrp"):
                instance_name = os.path.splitext(file)[0]
                instances.append(instance_name)
    
    if instances:
        print("Instancias disponibles:")
        for i, instance in enumerate(instances, 1):
            print(f"{i}. {instance}")
    else:
        print("No se encontraron instancias en la carpeta INSTANCES.")
    
    return instances
def main():
    if len(sys.argv) == 1:
        instances = list_available_instances()
        if not instances:
            print("No se encontraron instancias para procesar.")
            return
        try:
            choice = input("\nSeleccione el número de la instancia a visualizar (o 'q' para salir): ")
            if choice.lower() == 'q':
                return
            idx = int(choice) - 1
            if 0 <= idx < len(instances):
                process_instance_by_name(instances[idx])
            else:
                print("Selección inválida.")
        except ValueError:
            print("Entrada inválida. Debe ingresar un número.")
    else:
        instance_name = sys.argv[1]
        process_instance_by_name(instance_name)

if __name__ == "__main__":
    main()
