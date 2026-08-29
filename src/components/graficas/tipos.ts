export type DatoGrafica = {
  etiqueta: string;
  valor: number;
};

export const COLORES_GRAFICA = [
  "#39A900",
  "#0E5C63",
  "#0B3D2E",
  "#1B6B42",
  "#E87A2A",
  "#4A90C8",
  "#C9A227",
  "#6B7C75",
  "#8BC34A",
  "#2F8A00",
] as const;

export function coloresPara(cantidad: number): string[] {
  if (cantidad <= 0) return [];
  return Array.from({ length: cantidad }, (_, i) => COLORES_GRAFICA[i % COLORES_GRAFICA.length]);
}
