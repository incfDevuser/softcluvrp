import os
import time
from heuristica_softcluvrp import main

def ejecutar_todas_instancias():
    os.makedirs("resultados", exist_ok=True)
    instancias = []
    for root, dirs, files in os.walk("INSTANCES"):
        for file in files:
            if file.endswith(".cluvrp"):
                group = os.path.basename(os.path.dirname(os.path.join(root, file)))
                name = os.path.splitext(os.path.basename(file))[0]
                instancias.append(f"{group}/{name}")
    if not instancias:
        print("No se encontraron instancias en la carpeta INSTANCES.")
        return
    print(f"Encontradas {len(instancias)} instancias. Ejecutando heurística...")
    txt_file = "resultados/tiempos_costos.txt"    
    with open(txt_file, 'w', encoding='utf-8') as f:
        f.write("RESULTADOS HEURISTICA SOFTCLUVRP\n")
        f.write("=" * 50 + "\n")
        f.write(f"{'Instancia':<25} {'Tiempo(s)':<12} {'Costo Total':<15}\n")
        f.write("-" * 52 + "\n")
        tiempo_total = 0
        costos_totales = []
        exitosas = 0
        for i, instancia in enumerate(instancias, 1):
            print(f"[{i}/{len(instancias)}] Procesando: {instancia}")
            try:
                inicio = time.time()
                metricas = main(instancia)
                fin = time.time()                
                tiempo_ejecucion = fin - inicio
                costo_total = metricas['total_cost']
                f.write(f"{instancia:<25} {tiempo_ejecucion:<12.4f} {costo_total:<15.2f}\n")
                tiempo_total += tiempo_ejecucion
                costos_totales.append(costo_total)
                exitosas += 1
                print(f"  ✓ Tiempo: {tiempo_ejecucion:.4f}s - Costo: {costo_total:.2f}")
            except Exception as e:
                print(f"  ✗ Error: {str(e)}")
                f.write(f"{instancia:<25} {'ERROR':<12} {'ERROR':<15}\n")
        
        f.write("\n" + "=" * 50 + "\n")
        f.write("RESUMEN:\n")
        f.write(f"Instancias procesadas: {len(instancias)}\n")
        f.write(f"Exitosas: {exitosas}\n")
        f.write(f"Con errores: {len(instancias) - exitosas}\n")
        
        if exitosas > 0:
            f.write(f"Tiempo total: {tiempo_total:.4f}s\n")
            f.write(f"Tiempo promedio: {tiempo_total/exitosas:.4f}s\n")
            f.write(f"Costo promedio: {sum(costos_totales)/len(costos_totales):.2f}\n")
            f.write(f"Mejor costo: {min(costos_totales):.2f}\n")
            f.write(f"Peor costo: {max(costos_totales):.2f}\n")
    
    print(f"\n=== FINALIZADO ===")
    print(f"Resultados guardados en: {txt_file}")
    
    if exitosas > 0:
        print(f"Tiempo total: {tiempo_total:.4f}s")
        print(f"Tiempo promedio: {tiempo_total/exitosas:.4f}s")
        print(f"Costo promedio: {sum(costos_totales)/len(costos_totales):.2f}")

if __name__ == "__main__":
    ejecutar_todas_instancias()
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader) 
        total_instancias = 0
        exitosas = 0
        tiempo_total = 0
        
        for row in reader:
            total_instancias += 1
            if row[1] != 'ERROR':
                exitosas += 1
                tiempo_total += float(row[1])
    print(f"Instancias procesadas: {total_instancias}")
    print(f"Exitosas: {exitosas}")
    print(f"Con errores: {total_instancias - exitosas}")
    if exitosas > 0:
        print(f"Tiempo promedio: {tiempo_total/exitosas:.4f}s")
if __name__ == "__main__":
    ejecutar_todas_instancias()
