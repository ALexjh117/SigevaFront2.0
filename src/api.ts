import axios from 'axios';

const VITE_URL_BACK = import.meta.env.VITE_BASE_URL;

export const api = axios.create({
  baseURL: VITE_URL_BACK,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

function esAuthPublica(url?: string) {
  const u = url || '';
  return (
    u.includes('/api/usuarios/login') ||
    u.includes('/api/aprendiz/login') ||
    u.includes('/api/recuperar-password') ||
    u.includes('/api/auth/me') ||
    u.includes('/api/auth/logout')
  );
}

let onUnauthorized: (() => void) | null = null;
let silenciar401 = false;

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function silenciarUnauthorized(ms = 2000) {
  silenciar401 = true;
  window.setTimeout(() => {
    silenciar401 = false;
  }, ms);
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || '');
    if (status === 401 && !esAuthPublica(url) && !silenciar401) {
      silenciar401 = true;
      onUnauthorized?.();
      window.setTimeout(() => {
        silenciar401 = false;
      }, 2000);
    }
    return Promise.reject(error);
  }
);
