import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import "./registrarChartJs";
import { GraficaCard, GraficaVacia } from "./GraficaCard";
import { hayValores } from "./agregar";
import { coloresPara, type DatoGrafica } from "./tipos";

type Props = {
  titulo: string;
  datos: DatoGrafica[];
  alto?: "sm" | "md";
  pie?: string;
};

export function GraficaDona({ titulo, datos, alto = "md", pie }: Props) {
  if (!hayValores(datos)) {
    return (
      <GraficaCard titulo={titulo} pie={pie} alto={alto}>
        <GraficaVacia />
      </GraficaCard>
    );
  }

  const colores = coloresPara(datos.length);
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const n = Number(ctx.parsed || 0);
            return ` ${ctx.label}: ${n.toLocaleString("es-CO")}`;
          },
        },
      },
    },
  };

  return (
    <GraficaCard titulo={titulo} pie={pie} alto={alto}>
      <Doughnut
        key={titulo}
        options={options}
        data={{
          labels: datos.map((d) => d.etiqueta),
          datasets: [
            {
              data: datos.map((d) => d.valor),
              backgroundColor: colores,
              borderWidth: 2,
              borderColor: "#FFFFFF",
              hoverOffset: 4,
            },
          ],
        }}
      />
    </GraficaCard>
  );
}
