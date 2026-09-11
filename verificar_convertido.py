import pandas as pd

# Configurar pandas para mostrar todas las columnas
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)

# Verificar el archivo convertido
print("=== VERIFICANDO ARCHIVO CONVERTIDO ===")
df_convertido = pd.read_excel(r'C:\Users\Alex\sigevaFront\Reporte de Aprendices Convertido.xlsx', header=None)
print("Encabezado:")
print(df_convertido.head(5).to_string())
print("\nPrimeros datos de aprendices:")
print(df_convertido.iloc[5:10].to_string())
print(f"\nTotal de filas: {len(df_convertido)}")
print(f"Total de aprendices: {len(df_convertido) - 5}")  # Restamos 5 filas de encabezado
