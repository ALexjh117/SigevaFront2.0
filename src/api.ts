import axios from 'axios';

const VITE_URL_BACK = import.meta.env.VITE_BASE_URL;

export const api = axios.create({
  baseURL: VITE_URL_BACK,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/** Sin JWT: el back aísla por x-user-id (HU-S2-030). */
export function setActorHeader(userId: number | null) {
  if (userId) {
    api.defaults.headers.common['x-user-id'] = String(userId);
  } else {
    delete api.defaults.headers.common['x-user-id'];
  }
}