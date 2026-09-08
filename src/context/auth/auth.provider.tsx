import { useEffect, useState, type PropsWithChildren } from "react";
import { AuthContext } from "./auth.context";
import type { ResponseType, User, UserNormalizado } from "./types/authTypes";
import toast from "react-hot-toast";
import { type Jornada } from "../../constants/jornada";
import { getJornadaGuardada, guardarJornada, idDelAprendiz } from "../../utils/jornadaAprendiz";
import { api, setOnUnauthorized, silenciarUnauthorized } from "../../api";
import { esAprendiz } from "../../utils/roles";
import { ubicacionDesdeUsuario } from "../../utils/centro";

function estadoHabilitado(estado?: string) {
  const n = (estado || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  return n === "activo" || n === "en formacion" || n === "condicionado";
}

function hidratarUsuario(rawUser: User): UserNormalizado {
  const ubicacion = ubicacionDesdeUsuario(rawUser);
  const centro = ubicacion.idCentro || undefined;
  const idAprendiz = idDelAprendiz(rawUser) ?? Number(rawUser.id);
  const esApre = esAprendiz(rawUser.perfil);
  const jornada = esApre && idAprendiz ? getJornadaGuardada(idAprendiz) : null;

  if (esApre && jornada && idAprendiz) {
    guardarJornada(idAprendiz, jornada);
  }

  const nombre =
    (rawUser as { nombre?: string; nombres?: string }).nombre ||
    (rawUser as { nombres?: string }).nombres;

  return {
    ...rawUser,
    id: idAprendiz || rawUser.id,
    nombre,
    nombres: (rawUser as { nombres?: string }).nombres || nombre,
    centroFormacion: centro,
    CentroFormacion: centro ?? (rawUser as { CentroFormacion?: number }).CentroFormacion,
    nombreCentro: ubicacion.nombreCentro || undefined,
    nombreRegional: ubicacion.nombreRegional || undefined,
    jornada,
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserNormalizado | null>(null);
  const [sesionLista, setSesionLista] = useState(false);

  const login = (response: ResponseType<User>) => {
    if (!response.success) {
      setIsAuthenticated(false);
      setUser(null);
      toast.error(response.message);
      return false;
    }

    if (!estadoHabilitado(response.data?.estado)) {
      toast.error("Usuario no habilitado. Contacta con Bienestar al Aprendiz.");
      return false;
    }

    setIsAuthenticated(true);
    setUser(hidratarUsuario(response.data!));
    toast.success("¡Inicio de sesión exitoso!");
    return true;
  };

  const logout = () => {
    silenciarUnauthorized();
    void api.post("/api/auth/logout").catch(() => undefined);
    setIsAuthenticated(false);
    setUser(null);
    toast.success("Sesión cerrada correctamente");
  };

  const setJornada = (jornada: Jornada) => {
    setUser((prev) => {
      if (!prev) return prev;
      const id = idDelAprendiz(prev);
      if (id) guardarJornada(id, jornada);
      return { ...prev, jornada };
    });
  };

  useEffect(() => {
    setOnUnauthorized(() => {
      setIsAuthenticated(false);
      setUser(null);
      toast.error("Sesión expirada. Inicia sesión de nuevo.");
    });

    let cancelado = false;
    (async () => {
      try {
        const { data } = await api.get<ResponseType<User>>("/api/auth/me");
        if (!cancelado && data?.success && data.data && estadoHabilitado(data.data.estado)) {
          setIsAuthenticated(true);
          setUser(hidratarUsuario(data.data));
        }
      } catch {
        /* sin cookie o sesión inválida */
      } finally {
        if (!cancelado) setSesionLista(true);
      }
    })();

    return () => {
      cancelado = true;
      setOnUnauthorized(null);
    };
  }, []);

  return (
    <AuthContext
      value={{
        user,
        isAuthenticated,
        sesionLista,
        login,
        logout,
        setJornada,
      }}
    >
      {children}
    </AuthContext>
  );
}
