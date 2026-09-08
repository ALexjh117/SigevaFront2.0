import { api } from "../api";
import { comoLista } from "./comoLista";

export function diaDeFecha(valor: unknown): string {
  if (valor == null || valor === "") return "";
  const texto = String(valor).trim();
  const coincidencia = texto.match(/^(\d{4}-\d{2}-\d{2})/);
  return coincidencia ? coincidencia[1] : "";
}

function filasEleccion(payload: unknown): Record<string, unknown>[] {
  const visto = new Set<number>();
  const filas: Record<string, unknown>[] = [];

  const recoger = (valor: unknown, profundidad: number) => {
    if (profundidad > 2 || valor == null) return;
    if (Array.isArray(valor)) {
      for (const item of valor) {
        if (!item || typeof item !== "object") continue;
        const row = item as Record<string, unknown>;
        const id = Number(row.ideleccion ?? row.idEleccion ?? row.id);
        if (id && visto.has(id)) continue;
        if (id) visto.add(id);
        filas.push(row);
      }
      return;
    }
    if (typeof valor !== "object") return;
    const o = valor as Record<string, unknown>;
    for (const clave of ["data", "elecciones", "eleccionesActivas", "rows"]) {
      recoger(o[clave], profundidad + 1);
    }
  };

  recoger(payload, 0);
  if (filas.length === 0) {
    recoger(comoLista(payload), 0);
  }
  return filas;
}

export async function obtenerEleccionesDelCentro(idCentro: number) {
  const respuestas = await Promise.allSettled([
    api.get(`/api/eleccion/traerTodas/${idCentro}`),
    api.get(`/api/eleccionPorCentro/${idCentro}`),
  ]);

  const combinadas: Record<string, unknown>[] = [];
  for (const r of respuestas) {
    if (r.status !== "fulfilled") continue;
    combinadas.push(...filasEleccion(r.value.data));
  }
  return filasEleccion(combinadas);
}

function rangoDeEleccion(row: Record<string, unknown>) {
  const inicio =
    diaDeFecha(row.fechaInicio ?? row.fecha_inicio) ||
    diaDeFecha(row.horaInicio ?? row.hora_inicio);
  const fin =
    diaDeFecha(row.fechaFin ?? row.fecha_fin) ||
    diaDeFecha(row.horaFin ?? row.hora_fin) ||
    inicio;
  return { inicio, fin };
}

/** Hay otra elección del mismo centro cuyo rango de fechas se cruza con el propuesto. */
export function hayEleccionEnElMismoDia(
  elecciones: Record<string, unknown>[],
  fechaInicio: string,
  fechaFin: string,
  exceptId?: number
) {
  const inicio = diaDeFecha(fechaInicio);
  const fin = diaDeFecha(fechaFin) || inicio;
  if (!inicio) return false;

  return elecciones.some((row) => {
    const id = Number(row.ideleccion ?? row.idEleccion ?? row.id);
    if (exceptId && id === exceptId) return false;
    const rango = rangoDeEleccion(row);
    if (!rango.inicio) return false;
    return inicio <= rango.fin && rango.inicio <= fin;
  });
}
