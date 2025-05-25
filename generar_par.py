import os
carpeta_instancias = "INSTANCES"
carpeta_par = "par_files"
os.makedirs(carpeta_par, exist_ok=True)
print("Buscando instancias para generar .par...")
for grupo in os.listdir(carpeta_instancias):
    grupo_path = os.path.join(carpeta_instancias, grupo)
    if not os.path.isdir(grupo_path):
        continue
    print(f"Grupo encontrado: {grupo}")
    for archivo in os.listdir(grupo_path):
        if archivo.endswith(".cluvrp"):
            print(f"🔍 Archivo encontrado: {archivo}")
            archivo_sin_ext = os.path.splitext(archivo)[0]
            problem_file = f"../INSTANCES/{grupo}/{archivo}"
            tour_file = f"../TOURS/{grupo}/{archivo_sin_ext}.tour"
            output_file = f"../SOLUTIONS/{grupo}/{archivo_sin_ext}.sol"
            contenido_par = f"""PROBLEM_FILE = {problem_file}
TOUR_FILE = {tour_file}
OUTPUT_TOUR_FILE = {output_file}
RUNS = 10
"""
            par_path = os.path.join(carpeta_par, f"{archivo_sin_ext}.par")
            with open(par_path, "w") as f:
                f.write(contenido_par)
