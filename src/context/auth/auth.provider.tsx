import { useState, type PropsWithChildren } from "react";
import { AuthContext } from "./auth.context";
import type { Gestor, ResponseType, User, UserNormalizado } from "./types/authTypes";
import toast from "react-hot-toast";
import type { Jornada } from "../../constants/jornada";
import { getJornadaGuardada, guardarJornada } from "../../utils/jornadaAprendiz";

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
      return;
    }

    if (
      response.data?.estado.toLowerCase() != "activo" &&
      response.data?.estado.toLowerCase() != "en formacion" &&
      response.data?.estado.toLowerCase() != "condicionado"
    ) {
      toast.error("Usuario no habilitado. Contacta con Bienestar al Aprendiz.");
      return;
    }

    const rawUser = response.data!;
    const centro = centroDe(rawUser);

    const jornadaGuardada =
      rawUser.perfil === "Aprendiz" ? getJornadaGuardada(rawUser.id) : null;

    const normalizado: UserNormalizado = {
      ...rawUser,
      centroFormacion: centro ?? (rawUser as Gestor).centroFormacion,
      CentroFormacion: centro,
      jornada: jornadaGuardada,
    };

    setIsAuthenticated(true);
    setUser(normalizado);
    toast.success("¡Inicio de sesión exitoso!");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    toast.success("Sesión cerrada correctamente");
  };

  const setJornada = (jornada: Jornada) => {
    if (user) {
      guardarJornada(user.id, jornada);
    }
    setUser((prev) => (prev ? { ...prev, jornada } : prev));
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
