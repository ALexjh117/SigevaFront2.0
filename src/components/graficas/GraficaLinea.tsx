import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import "./registrarChartJs";
import { GraficaCard, GraficaVacia } from "./GraficaCard";
import { hayValores } from "./agregar";
import type { DatoGrafica } from "./tipos";

type Props = {
  titulo: string;
  datos: DatoGrafica[];
  alto?: "sm" | "md";
  pie?: string;
  unidad?: string;
};

export function GraficaLinea({ titulo, datos, alto = "md", pie, unidad = "" }: Props) {
  if (!hayValores(datos)) {
    return (
      <GraficaCard titulo={titulo} pie={pie} alto={alto}>
        <GraficaVacia texto="Todavía no hay votos en este periodo." />
      </GraficaCard>
    );
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const n = Number(ctx.parsed.y ?? 0);
            return unidad ? ` ${n.toLocaleString("es-CO")} ${unidad}` : ` ${n.toLocaleString("es-CO")}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: "#F0F3F1" },
      },
    },
  };

  return (
    <GraficaCard titulo={titulo} pie={pie} alto={alto}>
      <Line
        key={titulo}
        options={options}
        data={{
          labels: datos.map((d) => d.etiqueta),
          datasets: [
            {
              data: datos.map((d) => d.valor),
              borderColor: "#39A900",
              backgroundColor: "rgba(57, 169, 0, 0.14)",
              fill: true,
              tension: 0.35,
              pointRadius: 3,
              pointBackgroundColor: "#39A900",
              pointBorderColor: "#FFFFFF",
              pointBorderWidth: 1,
              borderWidth: 2.4,
            },
          ],
        }}
      />
    </GraficaCard>
  );
}
