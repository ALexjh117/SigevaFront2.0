import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

ChartJS.defaults.font.family = "Inter, sans-serif";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = "#5A6560";
ChartJS.defaults.borderColor = "#E4E9E5";
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.boxWidth = 8;
ChartJS.defaults.plugins.legend.labels.padding = 16;
ChartJS.defaults.plugins.tooltip.backgroundColor = "#0B3D2E";
ChartJS.defaults.plugins.tooltip.titleColor = "#FFFFFF";
ChartJS.defaults.plugins.tooltip.bodyColor = "#FFFFFF";
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
