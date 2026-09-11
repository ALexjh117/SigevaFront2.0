# Convertidor de Aprendices

Este programa convierte archivos de Excel con datos de aprendices al formato específico que acepta tu sistema.

## Características

- Convierte archivos .xlsx al formato de reporte de aprendices
- Mantiene la estructura con encabezados (Ficha, Estado, Fecha del Reporte)
- Procesa todos los registros en un solo archivo
- Extrae automáticamente la información de la ficha y programa

## Requisitos

- Python 3.x
- pandas
- openpyxl
- xlrd

## Instalación

Si no tienes las librerías necesarias, instala con:

```bash
pip install pandas openpyxl xlrd
```

## Uso

### Opción 1: Usar las rutas predefinidas

Simplemente ejecuta:

```bash
python convertidor.py
```

Esto usará las rutas configuradas en el script:
- Origen: `C:\Users\Alex\Downloads\Aprendices Lectiva.xlsx`
- Destino: `C:\Users\Alex\sigevaFront\Reporte de Aprendices Convertido.xlsx`

### Opción 2: Especificar rutas personalizadas

```bash
python convertidor.py "ruta\archivo_origen.xlsx" "ruta\archivo_destino.xlsx"
```

### Opción 3: Solo especificar el archivo origen

El destino se generará automáticamente con el sufijo "_convertido":

```bash
python convertidor.py "ruta\archivo_origen.xlsx"
```

## Formato del archivo origen

El archivo de origen debe tener las siguientes columnas:
- Tipo de Documento
- Número de Documento
- Nombre
- Apellidos
- Celular
- Correo Electrónico
- Estado
- Ficha (opcional, para el encabezado)
- Programa (opcional, para el encabezado)

## Formato del archivo destino

El archivo generado tendrá:
1. Encabezado con información del reporte
2. Fila de títulos de columnas
3. Todos los datos de los aprendices

## Ejemplo de uso reciente

En la última ejecución se convirtieron:
- **3930 aprendices** del archivo original
- Ficha: 3141925
- Programa: AUTOMATIZACION DE SISTEMAS MECATRONICOS
- Archivo generado: `Reporte de Aprendices Convertido.xlsx`

## Solución de problemas

Si obtienes un error de columnas faltantes, verifica que tu archivo origen tenga las columnas requeridas en el formato correcto.
