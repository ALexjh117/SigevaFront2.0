import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/auth/auth.context";
import { esAdministradorRed } from "../utils/roles";
import { comoLista, etiquetaAnidada } from "../utils/comoLista";
import type {
  AprendizGrafica,
  EleccionGrafica,
  FuncionarioGrafica,
  VotoGrafica,
} from "../components/graficas/PanelGraficasApp";

type CentroRed = {
  idcentroFormacion?: number;
  idcentro_formacion?: number;
  centroFormacioncol?: string;
  idregional?: number;
};

type RegionalRed = {
  idregional?: number;
  regional?: string;
};

function claveDiaLocal(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hoyLocal(): string {
  return claveDiaLocal(new Date());
}

function diaDeVoto(iso?: string | null): string {
  if (!iso) return "";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return String(iso).slice(0, 10);
  return claveDiaLocal(fecha);
}

function idCentroDe(row: Record<string, unknown>): number | undefined {
  const anidado = row.centro as Record<string, unknown> | undefined;
  const n = Number(
    row.idcentroFormacion ??
      row.idcentro_formacion ??
      anidado?.idcentroFormacion ??
      anidado?.idcentro_formacion
  );
  return n || undefined;
}

function mapearEleccion(
  row: Record<string, unknown>,
  centrosPorId: Map<number, CentroRed>,
  regionalesPorId: Map<number, string>
): EleccionGrafica {
  const idCentro = idCentroDe(row);
  const centroInfo = idCentro ? centrosPorId.get(idCentro) : undefined;
  const centroFila = etiquetaAnidada(row.centro);
  const regionalFila = etiquetaAnidada(row.regional);

  return {
    ideleccion: Number(row.ideleccion) || undefined,
    idcentroFormacion: idCentro,
    centro:
      centroFila ||
      centroInfo?.centroFormacioncol ||
      (idCentro ? String(idCentro) : "Sin centro"),
    regional:
      regionalFila ||
      (centroInfo?.idregional ? regionalesPorId.get(centroInfo.idregional) : undefined) ||
      "Sin regional",
    jornada: (row.jornada as string | null) ?? null,
    fechaFin: row.fechaFin ? String(row.fechaFin) : undefined,
    horaFin: row.horaFin ? String(row.horaFin) : undefined,
  };
}

export function useDatosDashboard() {
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);

  const [cargando, setCargando] = useState(true);
  const [votacionesActivas, setVotacionesActivas] = useState(0);
  const [usuariosRegistrados, setUsuariosRegistrados] = useState(0);
  const [aprendizDisponible, setAprendizDisponible] = useState(0);
  const [votosHoy, setVotosHoy] = useState(0);
  const [aprendices, setAprendices] = useState<AprendizGrafica[]>([]);
  const [elecciones, setElecciones] = useState<EleccionGrafica[]>([]);
  const [funcionarios, setFuncionarios] = useState<FuncionarioGrafica[]>([]);
  const [votos, setVotos] = useState<VotoGrafica[]>([]);

  useEffect(() => {
    let vivo = true;

    const cargar = async () => {
      if (!esRed && !user?.centroFormacion) {
        setCargando(false);
        return;
      }

      try {
        const centro = user?.centroFormacion;
        const peticiones: Array<Promise<unknown>> = [
          esRed
            ? api.get("api/eleccion").catch(() => api.get("api/eleccion/activas"))
            : api.get(`/api/eleccion/traerTodas/${centro}`).catch(() =>
                api.get(`api/eleccionPorCentro/${centro}`)
              ),
          esRed
            ? api.get("api/aprendiz/listar")
            : api.get(`api/aprendiz/inscritos/centro/${centro}`),
          esRed
            ? api.get("api/aprendiz/disponibles/")
            : api.get(`api/aprendiz/disponibles/centros/${centro}`),
          api.get("/api/votoXCandidato/traer"),
        ];

        if (esRed) {
          peticiones.push(
            api.get("api/usuarios/funcionarios"),
            api.get("api/centrosFormacion/obtiene"),
            api.get("api/regionales")
          );
        }

        const respuestas = await Promise.allSettled(peticiones);
        if (!vivo) return;

        const valor = (i: number) => {
          const r = respuestas[i];
          if (r?.status === "fulfilled") {
            const ok = r.value as { data?: unknown };
            return ok?.data;
          }
          return undefined;
        };

        const centrosPorId = new Map<number, CentroRed>();
        const regionalesPorId = new Map<number, string>();
        if (esRed) {
          comoLista<CentroRed>(valor(5)).forEach((c) => {
            const id = Number(c.idcentroFormacion ?? c.idcentro_formacion);
            if (id) centrosPorId.set(id, c);
          });
          comoLista<RegionalRed>(valor(6)).forEach((r) => {
            const id = Number(r.idregional);
            if (id && r.regional) regionalesPorId.set(id, r.regional);
          });
        }

        const listaElecciones = comoLista<Record<string, unknown>>(valor(0)).map((row) =>
          mapearEleccion(row, centrosPorId, regionalesPorId)
        );
        const listaAprendices = comoLista<AprendizGrafica>(valor(1));
        const listaDisponibles = comoLista<unknown>(valor(2));
        let listaVotos = comoLista<VotoGrafica>(valor(3));
        const listaFuncionarios = esRed ? comoLista<FuncionarioGrafica>(valor(4)) : [];

        if (!esRed) {
          const idsEleccion = new Set(
            listaElecciones
              .map((e) => e.ideleccion)
              .filter((id): id is number => Boolean(id))
          );
          const votoTieneEleccion = (v: VotoGrafica) => {
            const extra = v as VotoGrafica & Record<string, unknown>;
            const anidado = extra.eleccion as Record<string, unknown> | undefined;
            return Number(
              extra.ideleccion ??
                extra.idEleccion ??
                extra.eleccionId ??
                anidado?.ideleccion ??
                anidado?.id
            );
          };
          if (idsEleccion.size > 0 && listaVotos.some((v) => votoTieneEleccion(v))) {
            listaVotos = listaVotos.filter((v) => idsEleccion.has(votoTieneEleccion(v)));
          }
        }

        const hoy = hoyLocal();
        const votosDeHoy = listaVotos.filter((v) => diaDeVoto(v.createdAt || v.created_at) === hoy);
        const eleccionesAbiertas = listaElecciones.filter((e) => {
          const fin = e.horaFin || e.fechaFin;
          if (!fin) return true;
          const cierre = new Date(fin);
          return Number.isNaN(cierre.getTime()) || Date.now() <= cierre.getTime();
        }).length;

        setElecciones(listaElecciones);
        setAprendices(listaAprendices);
        setVotos(listaVotos);
        setFuncionarios(listaFuncionarios);
        setUsuariosRegistrados(listaAprendices.length);
        setAprendizDisponible(listaDisponibles.length);
        setVotosHoy(votosDeHoy.length);
        setVotacionesActivas(eleccionesAbiertas);
      } catch (error) {
        console.error("Error al traer datos del dashboard:", error);
      } finally {
        if (vivo) setCargando(false);
      }
    };

    void cargar();
    return () => {
      vivo = false;
    };
  }, [esRed, user?.centroFormacion]);

  return {
    cargando,
    esRed,
    votacionesActivas,
    usuariosRegistrados,
    aprendizDisponible,
    votosHoy,
    aprendices,
    elecciones,
    funcionarios,
    votos,
  };
}
