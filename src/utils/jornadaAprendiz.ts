import { esJornada, type Jornada } from "../constants/jornada"
import type { UserNormalizado } from "../context/auth/types/authTypes"
import { esAprendiz } from "./roles"

function clave(idAprendiz: number) {
  return `sigeva.jornada.voto.${idAprendiz}`
}

/** El back a veces manda `id` y a veces `idaprendiz`. */
export function idDelAprendiz(user: { id?: number; idaprendiz?: number } | null | undefined) {
  for (const c of [user?.idaprendiz, user?.id]) {
    const n = Number(c)
    if (Number.isFinite(n) && n > 0) return n
  }
  return undefined
}

export function getJornadaGuardada(idAprendiz: number): Jornada | null {
  const cruda = localStorage.getItem(clave(idAprendiz))
  return esJornada(cruda) ? cruda : null
}

export function guardarJornada(idAprendiz: number, jornada: Jornada) {
  localStorage.setItem(clave(idAprendiz), jornada)
}

/**
 * Jornada de votación: la que eligió en este equipo (sesión o localStorage).
 * No se usa la jornada académica que traiga el back: esa no es la del voto.
 */
export function jornadaDelAprendiz(user: UserNormalizado | null): Jornada | null {
  if (!user || !esAprendiz(user.perfil)) return null
  if (esJornada(user.jornada)) return user.jornada
  const id = idDelAprendiz(user)
  return id ? getJornadaGuardada(id) : null
}
