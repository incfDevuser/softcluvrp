import math
from collections import defaultdict
import matplotlib.pyplot as plt
import os
import numpy as np
from matplotlib.patches import Circle
import sys
import re
class Node:
    def __init__(self, id, x, y, demand, cluster):
        self.id = id
        self.x = x
        self.y = y
        self.demand = demand
        self.cluster = cluster

    def distance_to(self, other):
        return math.hypot(self.x - other.x, self.y - other.y)
class SoftCluVRPMultiVehicle:
    def __init__(self, nodes, depot_id, num_vehicles, capacity, penalty=2):
        self.nodes = {node.id: node for node in nodes}
        self.depot_id = depot_id
        self.penalty = penalty
        self.num_vehicles = num_vehicles
        self.capacity = capacity
        self.routes = [[] for _ in range(num_vehicles)]
        self.cluster_colors = None
    def calculate_cluster_densities(self):
        from scipy.spatial import ConvexHull
        cluster_points = defaultdict(list)
        for node in self.nodes.values():
            cluster_points[node.cluster].append((node.x, node.y))
        cluster_densities = {}
        for cluster_id, points in cluster_points.items():
            if len(points) < 3:
                cluster_densities[cluster_id] = float('inf')
                continue
            points_np = np.array(points)
            try:
                hull = ConvexHull(points_np)
                area = hull.volume
            except:
                area = 0.0001
            density = len(points) / area if area > 0 else float('inf')
            cluster_densities[cluster_id] = density
        return cluster_densities
    def construct_routes(self):
        cluster_densities = self.calculate_cluster_densities()
        for i in range(self.num_vehicles):
            self.routes[i] = [self.depot_id]
        unvisited = set(self.nodes.keys()) - {self.depot_id}
        remaining_capacity = [self.capacity for _ in range(self.num_vehicles)]
        while unvisited:
            min_cost = float('inf')
            best_node = None
            best_route = None
            for node_id in unvisited:
                node = self.nodes[node_id]
                raw_density = cluster_densities.get(node.cluster, 1.0)
                density = min(max(raw_density, 0.1), 10.0)
                for i, route in enumerate(self.routes):
                    if node.demand <= remaining_capacity[i]:
                        last_node = self.nodes[route[-1]]
                        base_cost = last_node.distance_to(node)
                        penalty_factor = 1.0 / density
                        adjusted_cost = base_cost * (1 + penalty_factor)

                        if adjusted_cost < min_cost:
                            min_cost = adjusted_cost
                            best_node = node_id
                            best_route = i
            if best_node is None:
                print("Advertencia: No se pudieron asignar todos los nodos debido a restricciones de capacidad")
                break
            self.routes[best_route].append(best_node)
            remaining_capacity[best_route] -= self.nodes[best_node].demand
            unvisited.remove(best_node)
        for i in range(self.num_vehicles):
            if self.routes[i][-1] != self.depot_id:
                self.routes[i].append(self.depot_id)
        for i in range(self.num_vehicles):
            self.routes[i] = self.local_2opt(self.routes[i])
        return self.routes
    def evaluate_route(self, route):
        """Evalúa una sola ruta"""
        total_dist = 0
        seen_clusters = defaultdict(list)
        for i in range(1, len(route)):
            a = self.nodes[route[i - 1]]
            b = self.nodes[route[i]]
            total_dist += a.distance_to(b)
            if route[i] != self.depot_id: 
                seen_clusters[b.cluster].append(i)
        cluster_violations = 0
        for cluster_id, positions in seen_clusters.items():
            if len(positions) <= 1:
                continue
            sorted_pos = sorted(positions)
            if max(sorted_pos) - min(sorted_pos) + 1 != len(sorted_pos):
                cluster_violations += 1 
        return total_dist, cluster_violations   
    def evaluate_solution(self):
        """Evalúa toda la solución (todas las rutas)"""
        total_dist = 0
        total_violations = 0
        route_metrics = []
        for i, route in enumerate(self.routes):
            dist, violations = self.evaluate_route(route)
            total_dist += dist
            total_violations += violations
            route_metrics.append({
                'vehicle': i+1,
                'distance': dist,
                'violations': violations,
                'nodes': len(route) - 2,  
                'total_demand': sum(self.nodes[n].demand for n in route if n != self.depot_id)
            })
        total_penalty = total_violations * self.penalty
        total_cost = total_dist + total_penalty
        return {
            'total_distance': total_dist,
            'total_violations': total_violations,
            'total_penalty': total_penalty,
            'total_cost': total_cost,
            'route_metrics': route_metrics
        }
    
    def plot_solution(self, title="SoftCluVRP - Solución Multi-Vehículo", save_path=None):
        plt.figure(figsize=(14, 10))
        unique_clusters = sorted(set(node.cluster for node in self.nodes.values()))
        cmap = plt.cm.get_cmap('tab10', len(unique_clusters))
        self.cluster_colors = {cl: cmap(i % 10) for i, cl in enumerate(unique_clusters)}
        vehicle_colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33', '#33FFF5', '#F533FF', '#FF8C33']
        centers = self._calculate_cluster_centers()
        radii = self._calculate_cluster_radius(centers)
        for cluster_id, center in centers.items():
            if cluster_id in radii:
                circle = Circle(
                    center, 
                    radii[cluster_id], 
                    alpha=0.1, 
                    color=self.cluster_colors[cluster_id],
                    fill=True,
                    zorder=1
                )
                plt.gca().add_patch(circle)
        for i, route in enumerate(self.routes):
            if not route:
                continue    
            color = vehicle_colors[i % len(vehicle_colors)]
            vehicle_label = f"Vehículo {i+1}"
            for j in range(len(route) - 1):
                a, b = route[j], route[j + 1]
                xa, ya = self.nodes[a].x, self.nodes[a].y
                xb, yb = self.nodes[b].x, self.nodes[b].y

                if j == 0:
                    plt.plot([xa, xb], [ya, yb], color=color, linestyle='-', linewidth=2, label=vehicle_label, zorder=2)
                else:
                    plt.plot([xa, xb], [ya, yb], color=color, linestyle='-', linewidth=2, zorder=2)
                
                if j % 3 == 0: 
                    dx, dy = xb - xa, yb - ya
                    length = np.sqrt(dx**2 + dy**2)
                    if length > 0:
                        mx, my = (xa + xb) / 2, (ya + yb) / 2
                        dx, dy = dx/length, dy/length
                        plt.arrow(mx-dx*2, my-dy*2, dx*4, dy*4, 
                                head_width=2, head_length=3, fc=color, ec=color, zorder=3)
        

        for node_id, node in self.nodes.items():
            if node_id == self.depot_id:

                plt.scatter(node.x, node.y, color='black', s=250, marker='*', edgecolors='white', linewidth=2, zorder=5)
                plt.text(node.x, node.y + 3, f"DEPOT", fontsize=12, ha='center', fontweight='bold', zorder=6, 
                       bbox=dict(facecolor='white', alpha=0.7, boxstyle='round'))
            else:
                plt.scatter(node.x, node.y, color=self.cluster_colors[node.cluster], s=100, edgecolors='black', linewidth=1, zorder=4)
                plt.text(node.x, node.y + 2, f"{node_id} (d:{node.demand})", fontsize=8, ha='center', zorder=6)
        
        densities = self.calculate_cluster_densities()

        for cluster_id, center in centers.items():
            density = densities.get(cluster_id, 0)
            plt.text(
                center[0], center[1], 
                f"Cluster {cluster_id}\nρ={density:.2f}",  # ρ = densidad
                fontsize=9, 
                ha='center', 
                va='center',
                bbox=dict(facecolor='white', alpha=0.7, boxstyle='round'),
                zorder=5
            )

        
        metrics = self.evaluate_solution()
        
        instance_parts = title.split(' - ')
        if len(instance_parts) > 1:
            instance_name = instance_parts[1]
            name_match = re.search(r'([A-Za-z0-9\-]+)', instance_name)
            if name_match:
                clean_name = name_match.group(1)
            else:
                clean_name = instance_name
        else:
            clean_name = "Solución"
        
        plt.title(f"SoftCluVRP - {clean_name}\n")
        plt.xlabel("X", fontsize=12)
        plt.ylabel("Y", fontsize=12)
        plt.grid(True, linestyle='--', alpha=0.7)
        
        from matplotlib.lines import Line2D
        cluster_handles = []
        for cl in unique_clusters:
            cluster_handles.append(
                Line2D([0], [0], marker='o', color='w', markerfacecolor=self.cluster_colors[cl], 
                      markersize=10, label=f'Cluster {cl}')
            )
        
        second_legend = plt.legend(handles=cluster_handles, loc='lower center', 
                                 bbox_to_anchor=(0.5, -0.15), ncol=min(6, len(unique_clusters)), 
                                 title="Clústeres", fontsize=9)
        plt.gca().add_artist(second_legend)
        
        plt.legend(loc='upper right', title="Vehículos")
        
        plt.tight_layout()
        
        if save_path:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            print(f"Visualización guardada en: {save_path}")
        
        plt.show()
        
        return metrics
    
    def _calculate_cluster_centers(self):
        """Calcula el centro de cada clúster"""
        cluster_points = defaultdict(list)
        for node_id, node in self.nodes.items():
            cluster_points[node.cluster].append((node.x, node.y))
        
        centers = {}
        for cluster_id, points in cluster_points.items():
            if points:
                x_coords, y_coords = zip(*points)
                centers[cluster_id] = (np.mean(x_coords), np.mean(y_coords))
        
        return centers
    
    def _calculate_cluster_radius(self, centers):
        """Calcula el radio de cada clúster"""
        cluster_radius = {}
        for cluster_id, center in centers.items():
            max_distance = 0
            for node_id, node in self.nodes.items():
                if node.cluster == cluster_id:
                    dist = math.sqrt((node.x - center[0])**2 + (node.y - center[1])**2)
                    max_distance = max(max_distance, dist)
            cluster_radius[cluster_id] = max_distance * 1.2 
        return cluster_radius
    def local_2opt(self, route):
        """Optimiza una ruta con 2-opt para reducir distancia manteniendo clústeres contiguos"""
        best = route[:]
        improved = True
        while improved:
            improved = False
            for i in range(1, len(best) - 2):
                for j in range(i + 1, len(best) - 1):
                    if best[i] == self.depot_id or best[j] == self.depot_id:
                        continue
                    # Propuesta de inversión
                    new_route = best[:i] + best[i:j+1][::-1] + best[j+1:]
                    # Verifica que no rompe clústeres
                    _, violations = self.evaluate_route(new_route)
                    if violations == 0:
                        old_dist, _ = self.evaluate_route(best)
                        new_dist, _ = self.evaluate_route(new_route)
                        if new_dist < old_dist:
                            best = new_route
                            improved = True
            route = best
        return best


def parse_cluvrp(filepath):
    nodes = []
    depot_id = 1 
    num_vehicles = 1
    capacity = 1000
    coords = {}
    clusters = {}
    demands = {}
    reading_coords = False
    reading_clusters = False
    reading_demands = False
    
    with open(filepath, 'r') as file:
        for line in file:
            line = line.strip()
            if line.startswith("VEHICLES:"):
                parts = line.split()
                if len(parts) >= 2:
                    num_vehicles = int(parts[1])
            elif line.startswith("CAPACITY:"):
                parts = line.split()
                if len(parts) >= 2:
                    capacity = int(parts[1])
            
            if line == "NODE_COORD_SECTION":
                reading_coords = True
                continue
            elif line == "GVRP_SET_SECTION":
                reading_coords = False
                reading_clusters = True
                continue
            elif line == "DEMAND_SECTION":
                reading_clusters = False
                reading_demands = True
                continue
            elif line == "EOF":
                break
                
            if reading_coords:
                parts = line.split()
                if len(parts) >= 3:
                    nid = int(parts[0])
                    x = float(parts[1])
                    y = float(parts[2])
                    coords[nid] = (x, y)
            
            elif reading_clusters:
                parts = line.split()
                if len(parts) >= 2:
                    cluster_id = int(parts[0])
                    for i in range(1, len(parts)):
                        if parts[i] == "-1":
                            break
                        node_id = int(parts[i])
                        clusters[node_id] = cluster_id
            
            elif reading_demands:
                parts = line.split()
                if len(parts) >= 2:
                    nid = int(parts[0])
                    demand = int(parts[1])
                    demands[nid] = demand
    
    for nid, (x, y) in coords.items():
        demand = demands.get(nid, 0)
        cluster = clusters.get(nid, 0)
        nodes.append(Node(nid, x, y, demand, cluster))
    
    return nodes, depot_id, num_vehicles, capacity

def main(instance_name=None):
    if not instance_name:
        instance_name = "A/A-n32-k5-C11-V2"
    parts = instance_name.split('/')
    if len(parts) > 1:
        group = parts[0]
        name = parts[-1]
    else:
        match = re.match(r'([A-Za-z]+)', instance_name)
        group = match.group(1) if match else ""
        name = instance_name
    file_path = os.path.join("INSTANCES", group, f"{name}.cluvrp")
    file_path = os.path.normpath(file_path)
    
    print(f"Buscando archivo: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"Error: Archivo no encontrado: {file_path}")
        print(f"Directorio actual: {os.getcwd()}")
        available_instances = []
        for root, dirs, files in os.walk("INSTANCES"):
            for file in files:
                if file.endswith(".cluvrp"):
                    instance_path = os.path.join(root, file)
                    available_instances.append(instance_path)
        if available_instances:
            print("Instancias disponibles:")
            for inst in available_instances[:10]:
                print(f"  - {inst}")
            if len(available_instances) > 10:
                print(f"  ... y {len(available_instances) - 10} más")
        return
    nodes, depot_id, num_vehicles, capacity = parse_cluvrp(file_path)

    print(f"=== Instancia: {instance_name} ===")
    print(f"Nodos: {len(nodes)}")
    print(f"Vehículos: {num_vehicles}")
    print(f"Capacidad: {capacity}")
    vrp = SoftCluVRPMultiVehicle(nodes, depot_id, num_vehicles, capacity)
    routes = vrp.construct_routes()
    print("\nRutas generadas:")
    for i, route in enumerate(routes):
        print(f"Vehículo {i+1}: {route}")
    metrics = vrp.evaluate_solution()
    
    print("\nMétricas por ruta:")
    print(f"{'Vehículo':<10}{'Distancia':<12}{'Violaciones':<14}{'Nodos':<8}{'Demanda Total'}")
    print("-" * 60)
    for route_data in metrics['route_metrics']:
        print(f"{route_data['vehicle']:<10}{route_data['distance']:<12.2f}{route_data['violations']:<14}{route_data['nodes']:<8}{route_data['total_demand']}")
    save_path = os.path.join("visualizations", f"{instance_name}_heuristica.png")
    vrp.plot_solution(title=f"SoftCluVRP - {instance_name}", save_path=save_path)
    print("\nDetalle de clústeres:")
    cluster_nodes = defaultdict(list)
    for node in nodes:
        cluster_nodes[node.cluster].append(node.id)
    for cluster_id, nodes_in_cluster in sorted(cluster_nodes.items()):
        print(f"Cluster {cluster_id}: {nodes_in_cluster}")
    return metrics

if __name__ == "__main__":
    if len(sys.argv) > 1:
        instance_name = sys.argv[1]
        main(instance_name)
    else:
        instances = []
        for root, dirs, files in os.walk("INSTANCES"):
            for file in files:
                if file.endswith(".cluvrp"):
                    group = os.path.basename(os.path.dirname(os.path.join(root, file)))
                    name = os.path.splitext(os.path.basename(file))[0]
                    instances.append(f"{group}/{name}")
        if not instances:
            print("No se encontraron instancias en la carpeta INSTANCES.")
            sys.exit(1)
        print("Instancias disponibles:")
        for i, inst in enumerate(instances, 1):
            print(f"{i}. {inst}")
        try:
            choice = input("\nSeleccione el número de instancia (o 'q' para salir): ")
            if choice.lower() == 'q':
                sys.exit(0)
            idx = int(choice) - 1
            if 0 <= idx < len(instances):
                main(instances[idx])
            else:
                print("Selección inválida.")
        except ValueError:
            print("Entrada inválida. Debe ingresar un número.")
            sys.exit(1)