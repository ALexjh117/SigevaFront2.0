import pandas as pd
import sys

# Leer archivo de origen (xlsx)
print("=== ESTRUCTURA ARCHIVO ORIGEN (Aprendices Lectiva.xlsx) ===")
df_origen = pd.read_excel(r'C:\Users\Alex\Downloads\Aprendices Lectiva.xlsx')
print(f"Filas: {len(df_origen)}, Columnas: {len(df_origen.columns)}")
print("\nColumnas:")
print(df_origen.columns.tolist())
print("\nPrimeras 5 filas:")
print(df_origen.head())
print("\nTipos de datos:")
print(df_origen.dtypes)

print("\n" + "="*80 + "\n")

# Leer archivo destino (xls)
print("=== ESTRUCTURA ARCHIVO DESTINO (Reporte de Aprendices Ficha 2992857.xls) ===")
df_destino = pd.read_excel(r'C:\Users\Alex\Downloads\Reporte de Aprendices Ficha 2992857.xls')
print(f"Filas: {len(df_destino)}, Columnas: {len(df_destino.columns)}")
print("\nColumnas:")
print(df_destino.columns.tolist())
print("\nPrimeras 5 filas:")
print(df_destino.head())
print("\nTipos de datos:")
print(df_destino.dtypes)
