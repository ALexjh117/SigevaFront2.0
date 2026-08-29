export interface Gestor {
  id: number;
  email: string;
  estado: string;
  perfil: "Funcionario" | "Administrador" | "admin_sistema";
  centroFormacion: number;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
}

export interface Aprendiz {
  id: number;
  idaprendiz?: number;
  nombre: string;
  apellidos: string;
  estado: string;
  perfil: "Aprendiz";
  jornada: string | null;
  CentroFormacion: number;
  centroFormacionIdcentroFormacion?: number;
}

export type User = Gestor | Aprendiz;

export interface ResponseType<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface UserNormalizado {
  id: number;
  email?: string;
  nombre?: string;
  nombres?: string;
  apellidos?: string;
  estado: string;
  perfil: "Funcionario" | "Administrador" | "Aprendiz" | "admin_sistema";
  jornada?: string | null;
  CentroFormacion?: number;
  centroFormacion?: number;
  idaprendiz?: number;
}
