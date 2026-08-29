import { GraficaBarras } from "./GraficaBarras";
import { GraficaDona } from "./GraficaDona";
import { contarPor, topN } from "./agregar";
import type { DatoGrafica } from "./tipos";

type Props = {
  barras: {
    titulo: string;
    datos: DatoGrafica[];
    horizontal?: boolean;
    unidad?: string;
  };
  dona: {
    titulo: string;
    datos: DatoGrafica[];
  };
};

export function MiniGraficas({ barras, dona }: Props) {
  return (
    <div className="grafica-grid grafica-grid--mini">
      <GraficaBarras
        titulo={barras.titulo}
        datos={barras.datos}
        horizontal={barras.horizontal}
        unidad={barras.unidad}
        alto="sm"
      />
      <GraficaDona titulo={dona.titulo} datos={dona.datos} alto="sm" />
    </div>
  );
}

export { contarPor, topN };
