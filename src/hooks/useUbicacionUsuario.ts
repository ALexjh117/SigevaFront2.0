import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/auth/auth.context";
import { comoLista, etiquetaAnidada } from "../utils/comoLista";
import { idDeCentro, nombreDeCentro } from "../utils/centro";
import { esAdministradorRed } from "../utils/roles";

type CentroRaw = {
  idcentroFormacion?: number;
  idcentro_formacion?: number;
  centroFormacioncol?: string;
  centro_formacioncol?: string;
  idregional?: number;
  regional?: unknown;
};

type RegionalRaw = {
  idregional?: number;
  regional?: string;
  nombre?: string;
};

export function useUbicacionUsuario() {
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);
  const idCentro = Number(user?.centroFormacion ?? user?.CentroFormacion) || 0;
  const [nombreCentro, setNombreCentro] = useState(user?.nombreCentro || "");
  const [nombreRegional, setNombreRegional] = useState(user?.nombreRegional || "");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;

    const cargar = async () => {
      if (esRed) {
        setNombreCentro("");
        setNombreRegional("");
        setCargando(false);
        return;
      }

      if (user?.nombreCentro && user?.nombreRegional) {
        setNombreCentro(user.nombreCentro);
        setNombreRegional(user.nombreRegional);
        setCargando(false);
        return;
      }

      if (!idCentro) {
        setNombreCentro(user?.nombreCentro || "");
        setNombreRegional(user?.nombreRegional || "");
        setCargando(false);
        return;
      }

      try {
        const [resCentros, resRegionales] = await Promise.all([
          api.get("api/centrosFormacion/obtiene"),
          api.get("api/regionales"),
        ]);
        if (!vivo) return;

        const regionalesPorId = new Map<number, string>();
        comoLista<RegionalRaw>(resRegionales.data).forEach((r) => {
          const id = Number(r.idregional);
          const nombre = (r.regional || r.nombre || "").trim();
          if (id && nombre) regionalesPorId.set(id, nombre);
        });

        const propio = comoLista<CentroRaw>(resCentros.data).find(
          (c) => idDeCentro(c as unknown as Record<string, unknown>) === idCentro
        );

        if (propio) {
          const centroNombre =
            nombreDeCentro(propio as unknown as Record<string, unknown>) ||
            user?.nombreCentro ||
            `Centro ${idCentro}`;
          const idReg = Number(propio.idregional);
          const regionalNombre =
            etiquetaAnidada(propio.regional) ||
            (idReg ? regionalesPorId.get(idReg) : "") ||
            user?.nombreRegional ||
            "";
          setNombreCentro(centroNombre);
          setNombreRegional(regionalNombre);
        } else {
          setNombreCentro(user?.nombreCentro || `Centro ${idCentro}`);
          setNombreRegional(user?.nombreRegional || "");
        }
      } catch {
        if (vivo) {
          setNombreCentro(user?.nombreCentro || (idCentro ? `Centro ${idCentro}` : ""));
          setNombreRegional(user?.nombreRegional || "");
        }
      } finally {
        if (vivo) setCargando(false);
      }
    };

    void cargar();
    return () => {
      vivo = false;
    };
  }, [esRed, idCentro, user?.nombreCentro, user?.nombreRegional]);

  return { nombreCentro, nombreRegional, esRed, idCentro, cargando };
}
