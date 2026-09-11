import pandas as pd

# Leer archivo destino completo
print("=== CONTENIDO COMPLETO ARCHIVO DESTINO ===")
df_destino = pd.read_excel(r'C:\Users\Alex\Downloads\Reporte de Aprendices Ficha 2992857.xls', header=None)
print(df_destino.to_string())
