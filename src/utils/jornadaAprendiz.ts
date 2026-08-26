import { esJornada, type Jornada } from "../constants/jornada"
import type { UserNormalizado } from "../context/auth/types/authTypes"

function clave(idAprendiz: number) {
  return `sigeva.jornada.aprendiz.${idAprendiz}`
}

export function getJornadaGuardada(idAprendiz: number): Jornada | null {
  const cruda = localStorage.getItem(clave(idAprendiz))
  return esJornada(cruda) ? cruda : null
}

export function guardarJornada(idAprendiz: number, jornada: Jornada) {
  localStorage.setItem(clave(idAprendiz), jornada)
}

/** Jornada elegida en sesión o la que ya quedó guardada en este navegador. */
export function jornadaDelAprendiz(user: UserNormalizado | null): Jornada | null {
  if (!user || user.perfil !== "Aprendiz") return null
  if (esJornada(user.jornada)) return user.jornada
  return getJornadaGuardada(user.id)
}

