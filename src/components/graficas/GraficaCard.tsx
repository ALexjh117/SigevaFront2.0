import type { ReactNode } from "react";
import "./graficas.css";

type Props = {
  titulo: string;
  pie?: string;
  alto?: "sm" | "md";
  children: ReactNode;
};

export function GraficaCard({ titulo, pie, alto = "md", children }: Props) {
  return (
    <article className="grafica-card">
      <header>
        <h3>{titulo}</h3>
        {pie ? <small>{pie}</small> : null}
      </header>
      <div className={`grafica-canvas grafica-canvas--${alto}`}>{children}</div>
    </article>
  );
}

export function GraficaVacia({ texto = "Aún no hay datos para graficar." }: { texto?: string }) {
  return <div className="grafica-vacia">{texto}</div>;
}
