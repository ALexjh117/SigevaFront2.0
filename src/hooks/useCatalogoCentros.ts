import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { comoLista, etiquetaAnidada } from "../utils/comoLista";
import { idDeCentro, nombreDeCentro } from "../utils/centro";

export type RegionalOpcion = {
  id: number;
  nombre: string;
};

export type CentroOpcion = {
  id: number;
  nombre: string;
  idRegional: number;
  regional: string;
};

export function centrosDeLaRegional(
  centros: CentroOpcion[],
  regionales: RegionalOpcion[],
  idRegional: number
): CentroOpcion[] {
  if (!idRegional) return [];
  const porId = centros.filter((c) => c.idRegional === idRegional);
  if (porId.length) return porId;
  const nombre = regionales
    .find((r) => r.id === idRegional)
    ?.nombre.toLowerCase();
  if (!nombre) return [];
  return centros.filter((c) => c.regional.toLowerCase() === nombre);
}

export function useCatalogoCentros(activo = true) {
  const [regionales, setRegionales] = useState<RegionalOpcion[]>([]);
  const [centros, setCentros] = useState<CentroOpcion[]>([]);
  const [cargando, setCargando] = useState(activo);

  useEffect(() => {
    if (!activo) {
      setCargando(false);
      return;
    }
    let vivo = true;

    const cargar = async () => {
      setCargando(true);
      try {
        const [resCentros, resRegionales] = await Promise.all([
          api.get("api/centrosFormacion/obtiene"),
          api.get("api/regionales"),
        ]);
        if (!vivo) return;

        const regionalesPorId = new Map<number, string>();
        const listaRegionales = comoLista<Record<string, unknown>>(resRegionales.data)
          .map((r) => {
            const id = Number(r.idregional ?? r.id);
            const nombre = String(r.regional ?? r.nombre ?? "").trim();
            if (id && nombre) regionalesPorId.set(id, nombre);
            return { id, nombre };
          })
          .filter((r) => r.id && r.nombre)
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

        const listaCentros = comoLista<Record<string, unknown>>(resCentros.data)
          .map((c) => {
            const id = idDeCentro(c);
            const nested = c.regional;
            const idRegionalCentro = Number(
              c.idregional ??
                c.idRegional ??
                (nested && typeof nested === "object"
                  ? (nested as Record<string, unknown>).idregional
                  : 0)
            );
            return {
              id,
              nombre: nombreDeCentro(c) || `Centro ${id}`,
              idRegional: idRegionalCentro,
              regional:
                etiquetaAnidada(nested) ||
                (idRegionalCentro ? regionalesPorId.get(idRegionalCentro) : "") ||
                "Sin regional",
            };
          })
          .filter((c) => c.id)
          .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

        setRegionales(listaRegionales);
        setCentros(listaCentros);
      } catch (error) {
        console.error("Error al cargar regionales y centros:", error);
      } finally {
        if (vivo) setCargando(false);
      }
    };

    void cargar();
    return () => {
      vivo = false;
    };
  }, [activo]);

  return { regionales, centros, cargando };
}

export function useFiltroCentroRed(activo = true) {
  const catalogo = useCatalogoCentros(activo);
  const [idRegional, setIdRegional] = useState(0);
  const [idCentro, setIdCentro] = useState(0);

  const centrosFiltrados = useMemo(
    () => centrosDeLaRegional(catalogo.centros, catalogo.regionales, idRegional),
    [catalogo.centros, catalogo.regionales, idRegional]
  );

  const centroElegido = catalogo.centros.find((c) => c.id === idCentro);

  const elegirRegional = (id: number) => {
    setIdRegional(id);
    setIdCentro(0);
  };

  return {
    ...catalogo,
    idRegional,
    idCentro,
    centrosFiltrados,
    centroElegido,
    elegirRegional,
    elegirCentro: setIdCentro,
  };
}
