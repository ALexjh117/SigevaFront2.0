import axios from "axios";
import { api } from "../api";

export type SolicitarOk = {
  success: boolean;
  message: string;
  data: {
    otp_generado: boolean;
    email_enviado_a: string;
    email_enviado: boolean;
    expira_en_minutos: number;
  };
};

export type ConfirmarOk = {
  success: boolean;
  message: string;
  data: {
    perfil: string;
    login: string;
  };
};

export type ErrorRecuperacion = {
  message: string;
  codigo_error?: string;
};

export function errorRecuperacion(error: unknown): ErrorRecuperacion {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return { message: "El servidor tardó demasiado. Intenta de nuevo." };
    }
    const data = error.response?.data as
      | { message?: string; codigo_error?: string }
      | undefined;
    return {
      message: data?.message || "No se pudo completar la solicitud",
      codigo_error: data?.codigo_error,
    };
  }
  return { message: "No se pudo completar la solicitud" };
}

const timeoutRecuperacion = 25000;

export async function solicitarRecuperacion(email: string) {
  const { data } = await api.post<SolicitarOk>(
    "/api/recuperar-password/solicitar",
    { email },
    { timeout: timeoutRecuperacion }
  );
  return data;
}

export async function confirmarRecuperacion(payload: {
  email: string;
  codigo: string;
  nueva_password: string;
}) {
  const { data } = await api.post<ConfirmarOk>(
    "/api/recuperar-password/confirmar",
    {
      email: payload.email,
      codigo: payload.codigo.trim().toUpperCase(),
      nueva_password: payload.nueva_password,
    },
    { timeout: timeoutRecuperacion }
  );
  return data;
}

export function rutaLoginSegunPerfil(perfil: string) {
  return perfil === "Aprendiz" ? "/login-aprendiz" : "/login";
}
