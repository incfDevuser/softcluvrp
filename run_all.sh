cd par_files
for file in *.par; do
  echo "Ejecutando $file"
  ./LKH.exe "$file"
done
