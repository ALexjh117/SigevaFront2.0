import { createContext, use } from "react";
import type { UserNormalizado } from "./types/authTypes";
import type { Jornada } from "../../constants/jornada";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserNormalizado | null;
  login: (response: any) => boolean;
  logout: () => void;
  setJornada: (jornada: Jornada) => void;
}

export const AuthContext = createContext({} as AuthContextType);

export const useAuth = () => {
  const context = use(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
