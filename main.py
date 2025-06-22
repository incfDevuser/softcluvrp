import matplotlib.pyplot as plt
import numpy as np
from collections import defaultdict
import os
import sys
from matplotlib.patches import Circle
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
def calculate_cluster_penalty_proportional(tour, clusters, alpha=1000):
    cluster_nodes = defaultdict(set)
    for node, cl_id in clusters.items():
        cluster_nodes[cl_id].add(node)

    visited_nodes = set(tour)
    penalties = {}
    for cl_id, nodes in cluster_nodes.items():
        visited = nodes & visited_nodes
        ratio = len(visited) / len(nodes)
        penalties[cl_id] = {
            "nodos_totales": len(nodes),
            "nodos_visitados": len(visited),
            "ratio": ratio,
            "penalizacion": round(alpha * (1 - ratio), 2)
        }
    return penalties
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
    
    # Calculate cluster centers and radii
    centers = calculate_cluster_centers(coords, clusters)
    radii = calculate_cluster_radius(coords, clusters, centers)
    
    # Plot cluster circles first (lowest layer)
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
    
    # Plot the tour lines
    for i in range(len(valid_tour)):
        a, b = valid_tour[i], valid_tour[(i + 1) % len(valid_tour)]
        if a in coords and b in coords:
            xa, ya = coords[a]
            xb, yb = coords[b]
            plt.plot([xa, xb], [ya, yb], color='gray', linestyle='-', linewidth=1, zorder=2)
    
    for node in sorted(coords.keys()):
        x, y = coords[node]
        cluster_id = clusters.get(node)
        
        # Node is in the tour
        if node in valid_tour:
            # Special handling for depot
            if node == 1:
                plt.scatter(x, y, color='black', s=180, marker='*', edgecolors='white', linewidth=2, zorder=5)
                plt.text(x, y + 2, f"DEPOT", fontsize=10, ha='center', fontweight='bold', zorder=6, 
                         bbox=dict(facecolor='white', alpha=0.7, boxstyle='round'))
            else:
                plt.scatter(x, y, color=cluster_colors.get(cluster_id, 'gray'), s=100, edgecolors='black', linewidth=1, zorder=3)
                plt.text(x, y + 1.5, str(node), fontsize=8, ha='center', zorder=5)
        # Node exists but not in the tour
        else:
            plt.scatter(x, y, color=cluster_colors.get(cluster_id, 'gray'), s=80, edgecolors='black', 
                      linewidth=1, zorder=2, alpha=0.5, marker='s')
            plt.text(x, y + 1.5, str(node), fontsize=8, ha='center', zorder=5, alpha=0.5)
    
    # Add cluster labels
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
    
    if len(valid_tour) > 1:
        for i in range(0, len(valid_tour)-1, max(1, len(valid_tour)//10)):
            a, b = valid_tour[i], valid_tour[i+1]
            if a in coords and b in coords:
                xa, ya = coords[a]
                xb, yb = coords[b]
                mx, my = (xa + xb) / 2, (ya + yb) / 2
                dx, dy = xb - xa, yb - ya
                length = np.sqrt(dx**2 + dy**2)
                if length > 0:
                    dx, dy = dx/length, dy/length
                    plt.arrow(mx-dx*5, my-dy*5, dx*10, dy*10, 
                              head_width=5, head_length=7, fc='black', ec='black', zorder=4)
    
    if "/" in instance_name:
        display_name = instance_name.split("/")[-1]
    else:
        display_name = instance_name
    
    plt.title(f"SoftCluVRP – {display_name} | {breaks} clústers rotos | Penalización: {penalty}", fontsize=14)
    plt.xlabel("X", fontsize=12)
    plt.ylabel("Y", fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.7)
    
    from matplotlib.lines import Line2D
    legend_elements = [
        Line2D([0], [0], marker='*', color='w', markerfacecolor='black', markersize=15, label='Depósito'),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='gray', markersize=10, label='Nodo en tour'),
        Line2D([0], [0], marker='s', color='w', markerfacecolor='gray', markersize=10, alpha=0.5, label='Nodo no visitado')
    ]
    for cl in unique_clusters:
        legend_elements.append(
            Line2D([0], [0], marker='o', color='w', markerfacecolor=cluster_colors[cl], 
                   markersize=10, label=f'Cluster {cl}')
        )
    plt.legend(handles=legend_elements, loc='upper right', fontsize=10)
    plt.tight_layout()
    
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"Visualización guardada en: {output_file}")
    
    plt.show()
def process_instance_by_name(instance_name):
    instance_parts = instance_name.split('/')
    if len(instance_parts) > 1:
        group = instance_parts[0]
        name = instance_parts[-1]
    else:
        match = re.match(r'([A-Za-z]+)', instance_name)
        group = match.group(1) if match else ""
        name = instance_name
    cluvrp_file = os.path.normpath(os.path.join("INSTANCES", group, f"{name}.cluvrp"))
    sol_file = os.path.normpath(os.path.join("SOLUTIONS", group, f"{name}.sol"))
    print(f"Buscando archivos:")
    print(f"- Instancia: {cluvrp_file}")
    print(f"- Solución: {sol_file}")
    
    if not os.path.exists(cluvrp_file):
        print(f"Error: Archivo de instancia no encontrado: {cluvrp_file}")
        return
    if not os.path.exists(sol_file):
        print(f"Error: Archivo de solución no encontrado: {sol_file}")
        return
    coords, clusters = load_coords_from_cluvrp(cluvrp_file)
    tour = load_tour(sol_file)
    valid_tour = [node for node in tour if node in coords]
    penalty_data = calculate_cluster_penalty_proportional(valid_tour, clusters)
    breaks = count_cluster_breaks(valid_tour, clusters)
    penalty = breaks * 1000
    print(f"\n=== Instancia: {instance_name} ===")
    print(f"Nodos en tour: {len(tour)}")
    print(f"Nodos válidos: {len(valid_tour)}")
    cluster_stats = defaultdict(lambda: {"total": 0, "visited": 0})
    for node, cl in clusters.items():
        cluster_stats[cl]["total"] += 1
        if node in valid_tour:
            cluster_stats[cl]["visited"] += 1
    
    print("\nEstadísticas de clústers:")
    print(f"{'Clúster':<10}{'Visitados':<12}{'Totales':<10}{'Ratio':<10}{'Penalización'}")
    print("-" * 60)
    total_penalty = 0
    for cl_id, data in penalty_data.items():
        print(f"{cl_id:<10}{data['nodos_visitados']:<12}{data['nodos_totales']:<10}{data['ratio']:<10.2f}{data['penalizacion']}")
        total_penalty += data['penalizacion']
    print("-" * 60)
    print(f"Clústers rotos: {breaks}")
    print(f"Penalización total (SoftCluVPR): {total_penalty:.2f}")
    tour_length = 0
    for i in range(len(valid_tour)):
        a, b = valid_tour[i], valid_tour[(i + 1) % len(valid_tour)]
        if a in coords and b in coords:
            xa, ya = coords[a]
            xb, yb = coords[b]
            tour_length += np.sqrt((xb - xa)**2 + (yb - ya)**2)
    print(f"Longitud del tour: {tour_length:.2f}")
    print(f"Costo total (longitud + penalización): {tour_length + total_penalty:.2f}")
    output_file = f"visualizations/{instance_name}.png"
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    plot_tour(coords, valid_tour, clusters, instance_name, output_file)
def list_available_instances():
    """List all available instances in the INSTANCES folder"""
    instances = []
    for root, dirs, files in os.walk("INSTANCES"):
        for file in files:
            if file.endswith(".cluvrp"):
                instance_name = os.path.splitext(os.path.basename(file))[0]
                group = os.path.basename(os.path.dirname(os.path.join(root, file)))
                instances.append(f"{group}/{instance_name}")
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
