import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import "./registrarChartJs";
import { GraficaCard, GraficaVacia } from "./GraficaCard";
import { hayValores } from "./agregar";
import { coloresPara, type DatoGrafica } from "./tipos";

type Props = {
  titulo: string;
  datos: DatoGrafica[];
  horizontal?: boolean;
  alto?: "sm" | "md";
  pie?: string;
  unidad?: string;
};

export function GraficaBarras({
  titulo,
  datos,
  horizontal = false,
  alto = "md",
  pie,
  unidad = "",
}: Props) {
  if (!hayValores(datos)) {
    return (
      <GraficaCard titulo={titulo} pie={pie} alto={alto}>
        <GraficaVacia />
      </GraficaCard>
    );
  }

  const colores = coloresPara(datos.length);
  const options: ChartOptions<"bar"> = {
    indexAxis: horizontal ? "y" : "x",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const n = Number(ctx.raw ?? 0);
            return unidad ? ` ${n.toLocaleString("es-CO")} ${unidad}` : ` ${n.toLocaleString("es-CO")}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: !horizontal, color: "#F0F3F1" },
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8, precision: 0 },
        beginAtZero: true,
      },
      y: {
        grid: { display: horizontal, color: "#F0F3F1" },
        ticks: { autoSkip: true, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  return (
    <GraficaCard titulo={titulo} pie={pie} alto={alto}>
      <Bar
        key={titulo}
        options={options}
        data={{
          labels: datos.map((d) => d.etiqueta),
          datasets: [
            {
              data: datos.map((d) => d.valor),
              backgroundColor: colores,
              borderWidth: 0,
              borderRadius: 4,
              maxBarThickness: horizontal ? 22 : 42,
            },
          ],
        }}
      />
    </GraficaCard>
  );
}
