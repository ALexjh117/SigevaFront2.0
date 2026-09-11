import pandas as pd
from datetime import datetime
import os
import sys

def convertir_aprendices(archivo_origen, archivo_destino):
    """
    Convierte el archivo de Aprendices Lectiva.xlsx al formato del Reporte de Aprendices
    
    Args:
        archivo_origen: Ruta del archivo Excel de origen
        archivo_destino: Ruta donde se guardará el archivo convertido
    
    Returns:
        Ruta del archivo convertido
    """
    
    # Verificar que el archivo origen existe
    if not os.path.exists(archivo_origen):
        print(f"Error: El archivo origen no existe: {archivo_origen}")
        return None
    
    try:
        # Leer archivo origen
        print("Leyendo archivo origen...")
        df_origen = pd.read_excel(archivo_origen)
        print(f"Se encontraron {len(df_origen)} registros")
        
        # Obtener información de la ficha (primera fila para ejemplo)
        ficha_info = df_origen['Ficha'].iloc[0] if len(df_origen) > 0 else "2992857"
        programa_info = df_origen['Programa'].iloc[0] if len(df_origen) > 0 else "PROGRAMA"
        
        print(f"Ficha: {ficha_info}")
        print(f"Programa: {programa_info}")
        
        # Crear el formato de salida exacto como el archivo destino
        # Primero creamos las filas de encabezado
        filas_encabezado = [
            ["Reporte de Aprendices", "", "", "", "", "", ""],
            ["Ficha de Caracterización:", "", f"{ficha_info} - {programa_info}", "", "", "", ""],
            ["Estado:", "", "EN EJECUCION", "", "", "", ""],
            ["Fecha del Reporte:", "", datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "", "", "", ""],
            ["Tipo de Documento", "Número de Documento", "Nombre", "Apellidos", "Celular", "Correo Electrónico", "Estado"]
        ]
        
        # Seleccionar columnas del origen en el orden correcto
        columnas_origen = ['Tipo de Documento', 'Número de Documento', 'Nombre', 'Apellidos', 'Celular', 'Correo Electrónico', 'Estado']
        
        # Verificar que las columnas existan
        columnas_faltantes = [col for col in columnas_origen if col not in df_origen.columns]
        if columnas_faltantes:
            print(f"Error: Faltan las siguientes columnas en el archivo origen: {columnas_faltantes}")
            print(f"Columnas disponibles: {df_origen.columns.tolist()}")
            return None
        
        df_datos = df_origen[columnas_origen].copy()
        
        # Convertir a lista de listas
        filas_datos = df_datos.values.tolist()
        
        # Combinar encabezado con datos
        todas_las_filas = filas_encabezado + filas_datos
        
        # Crear DataFrame final sin índice
        df_final = pd.DataFrame(todas_las_filas)
        
        # Guardar como Excel
        output_file = archivo_destino
        df_final.to_excel(output_file, index=False, header=False)
        
        print(f"Archivo convertido exitosamente: {output_file}")
        print(f"Total de registros convertidos: {len(df_datos)}")
        
        return output_file
        
    except Exception as e:
        print(f"Error durante la conversión: {e}")
        return None

if __name__ == "__main__":
    # Rutas de los archivos (puedes cambiar estas rutas)
    archivo_origen = r'C:\Users\Alex\Downloads\Aprendices Lectiva.xlsx'
    archivo_destino = r'C:\Users\Alex\sigevaFront\Reporte de Aprendices Convertido.xlsx'
    
    # Permitir argumentos desde la línea de comandos
    if len(sys.argv) >= 3:
        archivo_origen = sys.argv[1]
        archivo_destino = sys.argv[2]
    elif len(sys.argv) == 2:
        archivo_origen = sys.argv[1]
        # Generar nombre automático para el destino
        nombre_base = os.path.splitext(os.path.basename(archivo_origen))[0]
        archivo_destino = os.path.join(os.path.dirname(archivo_origen), f"{nombre_base}_convertido.xlsx")
    
    print("="*60)
    print("CONVERTIDOR DE APRENDICES")
    print("="*60)
    print(f"Archivo origen: {archivo_origen}")
    print(f"Archivo destino: {archivo_destino}")
    print("="*60)
    
    # Ejecutar conversión
    resultado = convertir_aprendices(archivo_origen, archivo_destino)
    
    if resultado:
        print("\n¡Conversión completada con éxito!")
    else:
        print("\nLa conversión falló. Revisa los mensajes de error arriba.")
