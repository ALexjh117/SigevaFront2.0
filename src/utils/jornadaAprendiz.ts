import { esJornada, type Jornada } from "../constants/jornada"
import type { UserNormalizado } from "../context/auth/types/authTypes"

function clave(idAprendiz: number) {
  return `sigeva.jornada.aprendiz.${idAprendiz}`
}

/** El back a veces manda `id` y a veces `idaprendiz`. */
export function idDelAprendiz(user: { id?: number; idaprendiz?: number } | null | undefined) {
  const n = Number(user?.id ?? user?.idaprendiz)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export function getJornadaGuardada(idAprendiz: number): Jornada | null {
  const cruda = localStorage.getItem(clave(idAprendiz))
  return esJornada(cruda) ? cruda : null
}

export function guardarJornada(idAprendiz: number, jornada: Jornada) {
  localStorage.setItem(clave(idAprendiz), jornada)
}

/** Jornada del perfil, de la sesión o la que ya quedó en este navegador. */
export function jornadaDelAprendiz(user: UserNormalizado | null): Jornada | null {
  if (!user || user.perfil !== "Aprendiz") return null
  if (esJornada(user.jornada)) return user.jornada
  const id = idDelAprendiz(user)
  return id ? getJornadaGuardada(id) : null
}
