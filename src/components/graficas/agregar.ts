import type { DatoGrafica } from "./tipos";

export function contarPor<T>(
  items: T[],
  clave: (item: T) => string | null | undefined
): DatoGrafica[] {
  const mapa = new Map<string, number>();
  for (const item of items) {
    const crudo = (clave(item) || "").trim() || "Sin dato";
    mapa.set(crudo, (mapa.get(crudo) || 0) + 1);
  }
  return [...mapa.entries()]
    .map(([etiqueta, valor]) => ({ etiqueta, valor }))
    .sort((a, b) => b.valor - a.valor);
}

export function topN(datos: DatoGrafica[], n = 8): DatoGrafica[] {
  if (datos.length <= n) return datos;
  const principales = datos.slice(0, n);
  const resto = datos.slice(n).reduce((acc, d) => acc + d.valor, 0);
  if (resto > 0) principales.push({ etiqueta: "Otros", valor: resto });
  return principales;
}

export function hayValores(datos: DatoGrafica[]): boolean {
  return datos.some((d) => d.valor > 0);
}

function claveDiaLocal(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function etiquetaCorta(isoDia: string): string {
  const [y, m, d] = isoDia.split("-").map(Number);
  const fecha = new Date(y, (m || 1) - 1, d || 1);
  return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

export function serieUltimosDias(
  fechasIso: Array<string | undefined | null>,
  dias = 14
): DatoGrafica[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const mapa = new Map<string, number>();

  for (let i = dias - 1; i >= 0; i--) {
    const dia = new Date(hoy);
    dia.setDate(hoy.getDate() - i);
    mapa.set(claveDiaLocal(dia), 0);
  }

  for (const crudo of fechasIso) {
    if (!crudo) continue;
    const fecha = new Date(crudo);
    if (Number.isNaN(fecha.getTime())) continue;
    const clave = claveDiaLocal(fecha);
    if (mapa.has(clave)) {
      mapa.set(clave, (mapa.get(clave) || 0) + 1);
    }
  }

  return [...mapa.entries()].map(([iso, valor]) => ({
    etiqueta: etiquetaCorta(iso),
    valor,
  }));
}
