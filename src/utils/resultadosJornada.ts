import { api } from "../api";
import { JORNADAS, esJornada, type Jornada } from "../constants/jornada";
import { comoLista } from "./comoLista";

export async function mapaJornadaCandidatos(
  idEleccion: number
): Promise<Map<number, Jornada>> {
  const mapa = new Map<number, Jornada>();

  const anotar = (filas: Record<string, unknown>[], jornadaFija?: Jornada) => {
    for (const c of filas) {
      const id = Number(c.idcandidatos ?? c.id ?? 0);
      if (!id) continue;
      if (jornadaFija) {
        mapa.set(id, jornadaFija);
        continue;
      }
      if (esJornada(c.jornada)) mapa.set(id, c.jornada);
    }
  };

  try {
    const { data } = await api.get(`/api/candidatos/listar/${idEleccion}`);
    anotar(comoLista<Record<string, unknown>>(data?.data ?? data));
  } catch {
    /* se intenta por jornada */
  }

  if (mapa.size > 0) return mapa;

  await Promise.all(
    JORNADAS.map(async (jornada) => {
      try {
        const { data } = await api.get(`/api/candidatos/listar/${idEleccion}`, {
          params: { jornada },
        });
        anotar(comoLista<Record<string, unknown>>(data?.data ?? data), jornada);
      } catch {
        /* jornada sin candidatos */
      }
    })
  );

  return mapa;
}

export function jornadasPresentes(candidatos: { jornada?: string | null }[]): Jornada[] {
  const hay = new Set<Jornada>();
  for (const c of candidatos) {
    if (esJornada(c.jornada)) hay.add(c.jornada);
  }
  return JORNADAS.filter((j) => hay.has(j));
}

export function recortarPorJornada<T extends { votos: number; jornada?: string | null }>(
  candidatos: T[],
  jornada: string
) {
  const filtrados = candidatos.filter((c) => c.jornada === jornada);
  const totalVotos = filtrados.reduce((s, c) => s + Number(c.votos || 0), 0);
  const lista = filtrados
    .map((c) => ({
      ...c,
      porcentaje: totalVotos > 0 ? (Number(c.votos) / totalVotos) * 100 : 0,
    }))
    .sort((a, b) => Number(b.votos) - Number(a.votos));
  return { lista, totalVotos };
}

export type BloqueJornada<T> = {
  jornada: Jornada;
  lista: Array<T & { porcentaje: number }>;
  totalVotos: number;
  ganador: (T & { porcentaje: number }) | null;
  segundo: (T & { porcentaje: number }) | null;
  ventaja: number | null;
};

export function bloquesPorJornada<T extends { votos: number; jornada?: string | null }>(
  candidatos: T[],
  incluirVacias = false
): BloqueJornada<T>[] {
  const bloques = JORNADAS.map((jornada) => {
    const { lista, totalVotos } = recortarPorJornada(candidatos, jornada);
    const ganador = lista[0] ?? null;
    const segundo = lista[1] ?? null;
    return {
      jornada,
      lista,
      totalVotos,
      ganador,
      segundo,
      ventaja: ganador && segundo ? Number(ganador.votos) - Number(segundo.votos) : null,
    };
  });
  return incluirVacias ? bloques : bloques.filter((b) => b.lista.length > 0);
}
