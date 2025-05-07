import pandas as pd
from sklearn.cluster import KMeans
def parse_vrp(file_path):
    with open(file_path) as f:
        lines = f.readlines()
    coords, demands = [], []
    reading = None
    for line in lines:
        line = line.strip()
        if "CAPACITY" in line:
            capacity = int(line.split(":")[1])
        elif line == "NODE_COORD_SECTION":
            reading = "coords"
            continue
        elif line == "DEMAND_SECTION":
            reading = "demands"
            continue
        elif line == "DEPOT_SECTION":
            break
        elif reading == "coords":
            parts = line.split()
            coords.append((int(parts[0]), float(parts[1]), float(parts[2])))
        elif reading == "demands":
            parts = line.split()
            demands.append((int(parts[0]), int(parts[1])))

    df_coords = pd.DataFrame(coords, columns=["id", "x", "y"])
    df_demands = pd.DataFrame(demands, columns=["id", "demand"])
    df = pd.merge(df_coords, df_demands, on="id")
    return df, capacity

def write_files(df, capacity, tsp_file, clu_file, par_file, n_clusters=6):
    # .tsp
    with open(tsp_file, "w") as f:
        f.write(f"NAME : eil22\nTYPE : CVRP\nDIMENSION : {len(df)}\n")
        f.write(f"EDGE_WEIGHT_TYPE : EUC_2D\nCAPACITY : {capacity}\n")
        f.write("NODE_COORD_SECTION\n")
        for _, row in df.iterrows():
            f.write(f"{row['id']} {int(row['x'])} {int(row['y'])}\n")
        f.write("DEMAND_SECTION\n")
        for _, row in df.iterrows():
            f.write(f"{row['id']} {row['demand']}\n")
        f.write("DEPOT_SECTION\n1\n-1\nEOF\n")
    kmeans = KMeans(n_clusters=n_clusters, random_state=42).fit(df[['x', 'y']])
    df['cluster'] = kmeans.labels_ + 1
    with open(clu_file, "w") as f:
        f.write("CLUSTER_SECTION\n")
        for _, row in df.iterrows():
            f.write(f"{row['id']} {row['cluster']}\n")
        f.write("EOF\n")
    with open(par_file, "w") as f:
        f.write(f"PROBLEM_FILE = {tsp_file}\n")
        f.write(f"OUTPUT_TOUR_FILE = eil22.sol\n")
        f.write("RUNS = 1\nTRACE_LEVEL = 1\n")

    print("✅ Archivos generados: eil22.tsp, eil22.clu, eil22.par")
df, cap = parse_vrp("eil22.vrp")
write_files(df, cap, "eil22.tsp", "eil22.clu", "eil22.par", n_clusters=6)
