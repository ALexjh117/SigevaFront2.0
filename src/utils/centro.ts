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
  ).trim()
}

function idNumerico(valor: unknown): number {
  if (typeof valor === "number" && Number.isInteger(valor) && valor > 0) return valor
  if (typeof valor === "string" && /^\d+$/.test(valor.trim())) return Number(valor.trim())
  return 0
}

function nombreRegionalDe(valor: unknown): string {
  if (typeof valor === "string") return valor.trim()
  if (!valor || typeof valor !== "object") return ""
  const o = valor as Record<string, unknown>
  return String(o.regional ?? o.nombre ?? "").trim()
}

/** Centro y regional del usuario logueado, venga el back como id o como objeto anidado. */
export function ubicacionDesdeUsuario(raw?: unknown | null): {
  idCentro: number
  nombreCentro: string
  nombreRegional: string
  idRegional: number
} {
  const vacio = { idCentro: 0, nombreCentro: "", nombreRegional: "", idRegional: 0 }
  if (!raw || typeof raw !== "object") return vacio

  const o = raw as Record<string, unknown>
  const candidatos = [
    o.centroFormacion,
    o.CentroFormacion,
    o.centro_formacion,
    o.centro,
  ]

  let idCentro = 0
  let nombreCentro = ""
  let nombreRegional = ""
  let idRegional = 0

  for (const cand of candidatos) {
    if (cand == null || cand === "") continue
    if (typeof cand === "object") {
      const c = cand as Record<string, unknown>
      idCentro = idDeCentro(c)
      nombreCentro = nombreDeCentro(c)
      idRegional = idNumerico(c.idregional ?? c.idRegional ?? c.id_regional)
      nombreRegional = nombreRegionalDe(c.regional ?? c.Regional)
      if (!idRegional) {
        const nested = c.regional
        if (nested && typeof nested === "object") {
          idRegional = idNumerico(
            (nested as Record<string, unknown>).idregional ??
              (nested as Record<string, unknown>).id
          )
        }
      }
      break
    }
    const n = idNumerico(cand)
    if (n) {
      idCentro = n
      break
    }
  }

  if (!idCentro) {
    idCentro = idNumerico(
      o.centroFormacionIdcentroFormacion ??
        o.idcentro_formacion ??
        o.idcentroFormacion
    )
  }

  if (!nombreCentro) {
    nombreCentro = String(o.centroFormacioncol ?? o.centro_formacioncol ?? "").trim()
  }

  if (!nombreRegional) {
    nombreRegional = nombreRegionalDe(o.regional ?? o.Regional)
  }

  if (!idRegional) {
    idRegional = idNumerico(o.idregional ?? o.idRegional ?? o.id_regional)
  }

  return { idCentro, nombreCentro, nombreRegional, idRegional }
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
