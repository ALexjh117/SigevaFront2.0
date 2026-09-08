import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { esJornada } from "../constants/jornada";
import { comoLista, etiquetaAnidada } from "../utils/comoLista";
import { urlFotoCandidato } from "../utils/fotoCandidato";
import { mapaJornadaCandidatos } from "../utils/resultadosJornada";
import { idDeCandidatoEnVoto } from "../utils/votoAprendiz";

const INTERVALO_MS = 5000;

export type CandidatoResultado = {
  id: number;
  nombre: string;
  apellido: string;
  votos: number;
  porcentaje: number;
  jornada?: string;
  foto?: string;
  numeroTarjeton?: string;
  propuesta?: string;
};

export type MetaEleccionResultados = {
  titulo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  totalParticipantes?: number;
};

function partirNombre(c: Record<string, unknown>) {
  const aprendiz = c.aprendiz as Record<string, unknown> | undefined;
  const nomA = String(aprendiz?.nombres ?? "").trim();
  const apeA = String(aprendiz?.apellidos ?? "").trim();
  if (nomA || apeA) {
    return { nombre: nomA || "Candidato", apellido: apeA };
  }

  const full =
    etiquetaAnidada(c.nombres) ||
    etiquetaAnidada(c.nombre) ||
    etiquetaAnidada(aprendiz) ||
    "Candidato";
  const partes = full.trim().split(/\s+/);
  return { nombre: partes[0] || "Candidato", apellido: partes.slice(1).join(" ") };
}

function fotoDe(c: Record<string, unknown>) {
  return urlFotoCandidato(String(c.foto ?? c.urlFoto ?? c.imagen ?? ""));
}

function tarjetonDe(c: Record<string, unknown>) {
  const v = c.numeroTarjeton ?? c.numero_tarjeton ?? c.tarjeton;
  return v != null && String(v).trim() ? String(v) : undefined;
}

function jornadaDe(...valores: unknown[]) {
  for (const v of valores) {
    if (esJornada(v)) return v;
  }
  return undefined;
}

const eleccionesSinReporte = new Set<number>();

async function traerReporte(id: number) {
  if (eleccionesSinReporte.has(id)) return null;
  try {
    const { data } = await api.get(`/api/reporte/eleccion/${id}`);
    return data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      eleccionesSinReporte.add(id);
      return null;
    }
    throw err;
  }
}

async function votosPorCandidato(ids: Set<number>) {
  if (ids.size === 0) return new Map<number, number>();
  try {
    const { data } = await api.get("/api/votoXCandidato/traer");
    const mapa = new Map<number, number>();
    for (const voto of comoLista<Record<string, unknown>>(data)) {
      const idCandidato = idDeCandidatoEnVoto(voto);
      if (!ids.has(idCandidato)) continue;
      mapa.set(idCandidato, (mapa.get(idCandidato) || 0) + 1);
    }
    return mapa;
  } catch {
    return new Map<number, number>();
  }
}

export async function cargarResultadosEleccion(idEleccion: number): Promise<{
  candidatos: CandidatoResultado[];
  meta: MetaEleccionResultados;
}> {
  const [repResult, listarResult] = await Promise.allSettled([
    traerReporte(idEleccion),
    api.get(`/api/candidatos/listar/${idEleccion}`),
  ]);

  const rep = repResult.status === "fulfilled" ? repResult.value : null;
  const listaCandidatos =
    listarResult.status === "fulfilled"
      ? comoLista<Record<string, unknown>>(
          listarResult.value.data?.data ?? listarResult.value.data
        )
      : [];

  const porId = new Map<number, Record<string, unknown>>();
  for (const c of listaCandidatos) {
    const id = Number(c.idcandidatos ?? c.id ?? 0);
    if (id) porId.set(id, c);
  }

  const listaVotos = comoLista<Record<string, unknown>>(rep?.candidatos ?? rep);
  const fuente = listaVotos.length > 0 ? listaVotos : listaCandidatos;

  let conteo: Map<number, number> | null = null;
  if (listaVotos.length === 0 && porId.size > 0) {
    conteo = await votosPorCandidato(new Set(porId.keys()));
  }

  let resultados: CandidatoResultado[] = fuente.map((c) => {
    const id = Number(c.idcandidatos ?? c.id ?? 0);
    const extra = porId.get(id) || {};
    const { nombre, apellido } = partirNombre({ ...extra, ...c });
    const votosReporte = Number(c.votos ?? extra.votos ?? 0);
    return {
      id,
      nombre,
      apellido,
      votos: conteo ? conteo.get(id) || 0 : votosReporte,
      porcentaje: 0,
      jornada: jornadaDe(c.jornada, extra.jornada),
      foto: fotoDe(extra) || fotoDe(c),
      numeroTarjeton: tarjetonDe(c) || tarjetonDe(extra),
      propuesta: String(c.propuesta ?? extra.propuesta ?? "") || undefined,
    };
  });

  if (resultados.some((c) => !esJornada(c.jornada))) {
    try {
      const mapa = await mapaJornadaCandidatos(idEleccion);
      resultados = resultados.map((c) => ({
        ...c,
        jornada: jornadaDe(c.jornada, mapa.get(c.id)),
      }));
    } catch {
      /* se queda la jornada que ya tenía */
    }
  }

  const totalVotos = resultados.reduce((s, c) => s + c.votos, 0);
  resultados = resultados
    .map((c) => ({
      ...c,
      porcentaje: totalVotos > 0 ? (c.votos / totalVotos) * 100 : 0,
    }))
    .sort((a, b) => b.votos - a.votos);

  const meta: MetaEleccionResultados = {};
  if (rep?.eleccion) {
    if (rep.eleccion.nombre) meta.titulo = String(rep.eleccion.nombre);
    if (rep.eleccion.fecha_inicio) meta.fechaInicio = String(rep.eleccion.fecha_inicio);
    if (rep.eleccion.fecha_fin) meta.fechaFin = String(rep.eleccion.fecha_fin);
  }
  if (typeof rep?.totalParticipantes === "number") {
    meta.totalParticipantes = Number(rep.totalParticipantes);
  }

  return { candidatos: resultados, meta };
}

export function useResultadosEnVivo(idEleccion: number | null) {
  const [candidatos, setCandidatos] = useState<CandidatoResultado[]>([]);
  const [meta, setMeta] = useState<MetaEleccionResultados>({});
  const [cargando, setCargando] = useState(false);
  const [actualizado, setActualizado] = useState<Date | null>(null);

  const refrescar = useCallback(
    async (silencioso: boolean) => {
      if (!idEleccion) return;
      if (!silencioso) setCargando(true);
      try {
        const data = await cargarResultadosEleccion(idEleccion);
        setCandidatos(data.candidatos);
        setMeta(data.meta);
        setActualizado(new Date());
      } catch (error) {
        console.error("Error al cargar resultados en vivo:", error);
        if (!silencioso) setCandidatos([]);
      } finally {
        setCargando(false);
      }
    },
    [idEleccion]
  );

  useEffect(() => {
    if (!idEleccion) {
      setCandidatos([]);
      setMeta({});
      setActualizado(null);
      setCargando(false);
      return;
    }

    void refrescar(false);
    const timer = window.setInterval(() => {
      if (!document.hidden) void refrescar(true);
    }, INTERVALO_MS);

    const alVisibilidad = () => {
      if (!document.hidden) void refrescar(true);
    };
    document.addEventListener("visibilitychange", alVisibilidad);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", alVisibilidad);
    };
  }, [idEleccion, refrescar]);

  return { candidatos, meta, cargando, actualizado };
}
