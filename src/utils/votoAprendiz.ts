import { api } from "../api";
import { comoLista } from "./comoLista";

export function idDeEleccion(v: Record<string, unknown>) {
  const n = Number(v.ideleccion ?? v.idEleccion ?? v.eleccionId);
  return n || 0;
}

export function idDeAprendizEnVoto(v: Record<string, unknown>) {
  const anidado =
    v.aprendiz && typeof v.aprendiz === "object"
      ? Number((v.aprendiz as Record<string, unknown>).idaprendiz)
      : 0;
  return Number(v.idaprendiz ?? v.aprendiz_idaprendiz ?? v.idAprendiz) || anidado || 0;
}

export function idDeCandidatoEnVoto(v: Record<string, unknown>) {
  const anidado =
    v.candidato && typeof v.candidato === "object"
      ? Number((v.candidato as Record<string, unknown>).idcandidatos)
      : 0;
  return Number(v.idcandidatos ?? v.idCandidatos ?? v.candidato_id) || anidado || 0;
}

export function idDeCandidato(v: Record<string, unknown>) {
  return Number(v.idcandidatos ?? v.id ?? 0) || 0;
}

/** Candidatos por los que este aprendiz ya votó (un voto por elección). */
export async function candidatosYaVotados(idAprendiz: number): Promise<Set<number>> {
  if (!idAprendiz) return new Set();
  try {
    const { data } = await api.get("/api/votoXCandidato/traer");
    return new Set(
      comoLista<Record<string, unknown>>(data)
        .filter((v) => idDeAprendizEnVoto(v) === idAprendiz)
        .map(idDeCandidatoEnVoto)
        .filter(Boolean)
    );
  } catch {
    return new Set();
  }
}

export function eleccionYaVotada(
  candidatosDeLaEleccion: Array<Record<string, unknown> | { idcandidatos?: unknown; id?: unknown }>,
  idsCandidatosVotados: Set<number>
) {
  return candidatosDeLaEleccion.some((c) =>
    idsCandidatosVotados.has(idDeCandidato(c as Record<string, unknown>))
  );
}
