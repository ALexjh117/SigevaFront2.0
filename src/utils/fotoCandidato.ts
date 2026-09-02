/** Arma la URL de la foto del candidato (absoluta, relativa al back o vacía). */
export function urlFotoCandidato(raw?: string | null): string {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v) || v.startsWith("data:") || v.startsWith("blob:")) {
    return v;
  }
  const base = String(import.meta.env.VITE_BASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (!base) return v;
  return v.startsWith("/") ? `${base}${v}` : `${base}/${v}`;
}

export function formatoVotos(n: number) {
  return Number(n || 0).toLocaleString("es-CO");
}

export function formatoPorcentaje(n: number) {
  return `${Number(n || 0).toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}
