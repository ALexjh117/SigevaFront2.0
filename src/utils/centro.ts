/** El back a veces manda snake_case y a veces camelCase. */

export function idDeCentro(row?: Record<string, unknown> | null): number {
  if (!row) return 0
  const n = Number(
    row.idcentro_formacion ??
      row.idcentroFormacion ??
      row.id ??
      row.centroFormacion
  )
  return Number.isInteger(n) && n > 0 ? n : 0
}

export function nombreDeCentro(row?: Record<string, unknown> | null): string {
  if (!row) return ""
  return String(
    row.centro_formacioncol ??
      row.centroFormacioncol ??
      row.nombre ??
      row.centro_formacion ??
      ""
  )
}

export function listaDe<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const obj = payload as { data?: unknown }
    if (Array.isArray(obj.data)) return obj.data as T[]
  }
  return []
}

export function mensajeApi(err: unknown): string {
  const ax = err as {
    response?: { data?: { message?: string; error?: string } }
    message?: string
  }
  return (
    ax?.response?.data?.message ||
    ax?.response?.data?.error ||
    ax?.message ||
    "Error inesperado"
  )
}

export function estadoCanonico(valor?: string | null): "Activo" | "Inactivo" {
  return String(valor || "")
    .toLowerCase()
    .startsWith("inac")
    ? "Inactivo"
    : "Activo"
}
