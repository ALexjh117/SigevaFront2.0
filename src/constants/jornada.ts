/** Cadenas exactas del back (Vine + PostgreSQL). Con eñe. */
export const JORNADAS = ["Mañana", "Tarde", "Noche"] as const
export type Jornada = (typeof JORNADAS)[number]

export function esJornada(valor: unknown): valor is Jornada {
  return typeof valor === "string" && (JORNADAS as readonly string[]).includes(valor)
}
