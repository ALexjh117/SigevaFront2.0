import { useState, type PropsWithChildren } from "react";
import { AuthContext } from "./auth.context";
import type { Gestor, ResponseType, User, UserNormalizado } from "./types/authTypes";
import toast from "react-hot-toast";
import { type Jornada } from "../../constants/jornada";
import { getJornadaGuardada, guardarJornada, idDelAprendiz } from "../../utils/jornadaAprendiz";
import { setActorHeader } from "../../api";
import { esAprendiz } from "../../utils/roles";

function estadoHabilitado(estado?: string) {
  const n = (estado || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  return n === "activo" || n === "en formacion" || n === "condicionado";
}

function centroDe(rawUser: User): number | undefined {
  if ("CentroFormacion" in rawUser && rawUser.CentroFormacion != null) {
    return Number(rawUser.CentroFormacion);
  }
  if ("centroFormacion" in rawUser && rawUser.centroFormacion != null) {
    return Number(rawUser.centroFormacion);
  }
  if (
    "centroFormacionIdcentroFormacion" in rawUser &&
    rawUser.centroFormacionIdcentroFormacion != null
  ) {
    return Number(rawUser.centroFormacionIdcentroFormacion);
  }
  return undefined;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserNormalizado | null>(null);

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

    const rawUser = response.data!;
    const centro = centroDe(rawUser);
    const idAprendiz = idDelAprendiz(rawUser) ?? Number(rawUser.id);
    const esApre = esAprendiz(rawUser.perfil);
    const jornada = esApre && idAprendiz ? getJornadaGuardada(idAprendiz) : null;

    if (esApre && jornada && idAprendiz) {
      guardarJornada(idAprendiz, jornada);
    }

    const normalizado: UserNormalizado = {
      ...rawUser,
      id: idAprendiz || rawUser.id,
      centroFormacion: centro ?? (rawUser as Gestor).centroFormacion,
      CentroFormacion: centro,
      jornada,
    };

    setIsAuthenticated(true);
    setUser(normalizado);
    if (esApre) {
      setActorHeader(null);
    } else {
      setActorHeader(rawUser.id);
    }
    toast.success("¡Inicio de sesión exitoso!");
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActorHeader(null);
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

  return (
    <AuthContext
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        setJornada,
      }}
    >
      {children}
    </AuthContext>
  );
}
