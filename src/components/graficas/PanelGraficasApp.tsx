import { GraficaBarras } from "./GraficaBarras";
import { GraficaDona } from "./GraficaDona";
import { GraficaLinea } from "./GraficaLinea";
import { contarPor, serieUltimosDias, topN } from "./agregar";
import type { DatoGrafica } from "./tipos";
import { etiquetaEstado } from "../tabla/detalleTabla";
import { etiquetaAnidada } from "../../utils/comoLista";

export type AprendizGrafica = {
  estado?: string;
  centro_formacion?: unknown;
  centroFormacion?: unknown;
  programa?: unknown;
  grupo?: unknown;
};

export type EleccionGrafica = {
  ideleccion?: number;
  centro?: unknown;
  regional?: unknown;
  jornada?: string | null;
  fechaFin?: string;
  horaFin?: string;
};

export type VotoGrafica = {
  createdAt?: string;
  created_at?: string;
  ideleccion?: number;
  idEleccion?: number;
  eleccionId?: number;
  eleccion?: unknown;
};

export type FuncionarioGrafica = {
  estado?: string;
  centroFormacion?: {
    centroFormacioncol?: string;
    regional?: { regional?: string };
  };
};

function esEleccionVigente(row: EleccionGrafica) {
  const fin = row.horaFin || row.fechaFin;
  if (!fin) return true;
  const cierre = new Date(fin);
  return Number.isNaN(cierre.getTime()) || Date.now() <= cierre.getTime();
}

function nombreCentroAprendiz(a: AprendizGrafica) {
  return (
    etiquetaAnidada(a.centro_formacion) ||
    etiquetaAnidada(a.centroFormacion) ||
    "Sin centro"
  );
}

function nombrePrograma(a: AprendizGrafica) {
  return etiquetaAnidada(a.programa, ["programa"]) || "Sin programa";
}

type Props = {
  aprendices: AprendizGrafica[];
  elecciones: EleccionGrafica[];
  funcionarios?: FuncionarioGrafica[];
  votos: VotoGrafica[];
  esRed: boolean;
};

export function PanelGraficasApp({
  aprendices,
  elecciones,
  funcionarios = [],
  votos,
  esRed,
}: Props) {
  const porLugarAprendiz = topN(
    contarPor(aprendices, (a) => (esRed ? nombreCentroAprendiz(a) : nombrePrograma(a))),
    8
  );
  const porEstadoAprendiz = contarPor(aprendices, (a) => etiquetaEstado(a.estado));
  const eleccionesEstado: DatoGrafica[] = [
    { etiqueta: "Activas", valor: elecciones.filter(esEleccionVigente).length },
    { etiqueta: "Cerradas", valor: elecciones.filter((e) => !esEleccionVigente(e)).length },
  ];
  const eleccionesPorJornada = contarPor(elecciones, (e) => e.jornada || "Sin jornada");
  const eleccionesPorCentro = topN(
    contarPor(elecciones, (e) => etiquetaAnidada(e.centro) || "Sin centro"),
    8
  );
  const funcionariosPorRegional = topN(
    contarPor(
      funcionarios,
      (f) => f.centroFormacion?.regional?.regional || "Sin regional"
    ),
    8
  );
  const funcionariosPorEstado = contarPor(funcionarios, (f) => etiquetaEstado(f.estado));
  const votosSerie = serieUltimosDias(
    votos.map((v) => v.createdAt || v.created_at),
    14
  );

  return (
    <section className="grafica-panel">
      <div className="grafica-panel-head">
        <h2>Gráficas del aplicativo</h2>
        <p>
          {esRed
            ? "Barras, donas y tendencia de votos de toda la red SENA."
            : "Barras, donas y tendencia de votos de tu centro de formación."}
        </p>
      </div>

      <div className="grafica-grid grafica-grid--2">
        <GraficaBarras
          titulo={esRed ? "Aprendices por centro" : "Aprendices por programa"}
          datos={porLugarAprendiz}
          horizontal
          unidad="aprendices"
        />
        <GraficaDona titulo="Aprendices por estado" datos={porEstadoAprendiz} />
        <GraficaBarras
          titulo={esRed ? "Elecciones por centro" : "Elecciones por jornada"}
          datos={esRed ? eleccionesPorCentro : eleccionesPorJornada}
          horizontal={esRed}
          unidad="elecciones"
        />
        <GraficaDona titulo="Estado de las elecciones" datos={eleccionesEstado} />
        <GraficaLinea
          titulo="Votos en los últimos 14 días"
          datos={votosSerie}
          unidad="votos"
        />
        {esRed ? (
          <GraficaDona titulo="Elecciones por jornada" datos={eleccionesPorJornada} />
        ) : (
          <GraficaDona
            titulo="Aprendices por grupo"
            datos={topN(contarPor(aprendices, (a) => etiquetaAnidada(a.grupo, ["grupo"]) || "Sin grupo"), 8)}
          />
        )}
        {esRed && funcionarios.length > 0 ? (
          <>
            <GraficaBarras
              titulo="Funcionarios por regional"
              datos={funcionariosPorRegional}
              horizontal
              unidad="funcionarios"
            />
            <GraficaDona titulo="Funcionarios por estado" datos={funcionariosPorEstado} />
          </>
        ) : null}
      </div>
    </section>
  );
}
