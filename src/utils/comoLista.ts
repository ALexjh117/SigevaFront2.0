/** Normaliza respuestas del back que a veces vienen como arreglo y a veces envueltas. */
export function comoLista<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    const claves = [
      "data",
      "elecciones",
      "eleccionesActivas",
      "aprendices",
      "votos",
      "funcionarios",
      "candidatos",
      "centros",
      "regionales",
    ];
    for (const clave of claves) {
      if (Array.isArray(o[clave])) return o[clave] as T[];
    }
  }
  return [];
}

export function etiquetaAnidada(valor: unknown, extras: string[] = []): string {
  if (valor == null || valor === "") return "";
  if (typeof valor === "string" || typeof valor === "number") return String(valor).trim();
  if (typeof valor === "object") {
    const o = valor as Record<string, unknown>;
    const claves = [
      ...extras,
      "centroFormacioncol",
      "regional",
      "programa",
      "grupo",
      "nombre",
      "titulo",
      "nombres",
    ];
    for (const clave of claves) {
      const v = o[clave];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}
