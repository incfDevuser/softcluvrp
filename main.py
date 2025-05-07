import matplotlib.pyplot as plt
from collections import defaultdict
import numpy as np

def load_coords(tsp_file):
    coords = {}
    reading = False
    with open(tsp_file) as f:
        for line in f:
            line = line.strip()
            if line == "NODE_COORD_SECTION":
                reading = True
                continue
            if line in ["DEMAND_SECTION", "EOF"]:
                break
            if reading:
                parts = line.split()
                if len(parts) >= 3:
                    coords[int(parts[0])] = (float(parts[1]), float(parts[2]))
    return coords
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
            if reading:
                tour.append(int(line))
    return tour
def load_clusters(clu_file):
    clusters = {}
    with open(clu_file) as f:
        reading = False
        for line in f:
            line = line.strip()
            if line == "CLUSTER_SECTION":
                reading = True
                continue
            if line == "EOF":
                break
            if reading:
                parts = line.split()
                if len(parts) >= 2:
                    node_id = int(float(parts[0]))
                    cluster_id = int(float(parts[1]))
                    clusters[node_id] = cluster_id
    return clusters
def count_cluster_breaks(tour, clusters):
    seen = defaultdict(list)
    for i, node in enumerate(tour):
        cl = clusters.get(node)
        if cl is not None:
            seen[cl].append(i)
    broken = 0
    for cl, positions in seen.items():
        if len(positions) <= 1:
            continue
        sorted_pos = sorted(positions)
        if max(sorted_pos) - min(sorted_pos) + 1 != len(sorted_pos):
            broken += 1
    return broken
def plot_tour(coords, tour, clusters):
    plt.figure(figsize=(10, 6))
    unique_clusters = sorted(set(clusters.values()))
    cmap = plt.get_cmap("tab10", len(unique_clusters))
    cluster_colors = {cl: cmap(i % 10) for i, cl in enumerate(unique_clusters)}
    valid_tour = [node for node in tour if node in coords]
    for i in range(len(valid_tour)):
        a, b = valid_tour[i], valid_tour[(i + 1) % len(valid_tour)]
        xa, ya = coords[a]
        xb, yb = coords[b]
        plt.plot([xa, xb], [ya, yb], color='gray', linestyle='--', zorder=1)
    cluster_points = defaultdict(list)
    for node in valid_tour:
        if node in clusters and node != 1:
            cluster_points[clusters[node]].append(coords[node])
    for cl, points in cluster_points.items():
        xs, ys = zip(*points)
        xc, yc = np.mean(xs), np.mean(ys)
        r = max(np.sqrt((np.array(xs) - xc)**2 + (np.array(ys) - yc)**2)) + 3
        circle = plt.Circle((xc, yc), r, color=cluster_colors[cl], alpha=0.1, zorder=0)
        plt.gca().add_patch(circle)
    for node in valid_tour:
        x, y = coords[node]
        if node == 1:
            plt.scatter(x, y, color='black', s=90, edgecolors='white', zorder=3, marker='s')
            plt.text(x, y + 2.5, "d₀", fontsize=9, ha='center', color='black')
        else:
            cluster_id = clusters.get(node)
            if cluster_id is not None:
                plt.scatter(x, y, color=cluster_colors[cluster_id], s=60, edgecolors='black', zorder=2)
                plt.text(x, y + 1.5, str(node), fontsize=8, ha='center')

    plt.title("SoftCluVPR – Recorrido con clústers (círculos de agrupación)")
    plt.xlabel("X")
    plt.ylabel("Y")
    plt.grid(True)
    plt.tight_layout()
    plt.show()
TSP_FILE = "eil22.tsp"
SOL_FILE = "eil22.sol"
CLU_FILE = "eil22.clu"
coords = load_coords(TSP_FILE)
tour = load_tour(SOL_FILE)
clusters = load_clusters(CLU_FILE)
valid_tour = [node for node in tour if node in coords]
print(f"Nodes in tour: {len(tour)}")
print(f"Valid nodes in tour: {len(valid_tour)}")
breaks = count_cluster_breaks(valid_tour, clusters)
penalty = breaks * 1000
print(f"🔍 Clústers rotos: {breaks}")
print(f"💰 Penalización total (SoftCluVPR): {penalty}")

plot_tour(coords, valid_tour, clusters)
