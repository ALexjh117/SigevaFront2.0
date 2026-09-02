import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { FaFilePdf } from "react-icons/fa6";
import { JORNADAS, type Jornada } from "../../constants/jornada";
import type { CandidatoResultado } from "../../hooks/useResultadosEnVivo";
import { bloquesPorJornada, jornadasPresentes } from "../../utils/resultadosJornada";
import { formatoPorcentaje, formatoVotos } from "../../utils/fotoCandidato";
import { TableroResultadosTv } from "./TableroResultadosTv";
import "./tableroResultadosTv.css";

type Props = {
  candidatos: CandidatoResultado[];
  nombreEleccion: string;
  centro?: string;
  cargando?: boolean;
  actualizado?: Date | null;
  exportando?: Jornada | "todas" | "";
  jornadaInicial?: Jornada;
  onPdfJornada: (jornada: Jornada) => void | Promise<void>;
  onPdfTodas: () => void | Promise<void>;
};

function textoHace(fecha: Date | null | undefined) {
  if (!fecha) return "esperando escrutinio";
  const s = Math.max(0, Math.round((Date.now() - fecha.getTime()) / 1000));
  if (s < 3) return "ahora";
  if (s < 60) return `hace ${s} s`;
  return `hace ${Math.floor(s / 60)} min`;
}

export function PanelResultadosJornada({
  candidatos,
  nombreEleccion,
  centro,
  cargando,
  actualizado,
  exportando = "",
  jornadaInicial,
  onPdfJornada,
  onPdfTodas,
}: Props) {
  const bloques = useMemo(() => bloquesPorJornada(candidatos, true), [candidatos]);
  const presentes = useMemo(() => jornadasPresentes(candidatos), [candidatos]);
  const [jornada, setJornada] = useState<Jornada>(
    jornadaInicial || presentes[0] || "Mañana"
  );
  const [, setTick] = useState(0);

  useEffect(() => {
    if (presentes.length && !presentes.includes(jornada)) {
      setJornada(presentes[0]);
    }
  }, [presentes, jornada]);

  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const bloque = bloques.find((b) => b.jornada === jornada);
  const lista = bloque?.lista ?? [];
  const ganador = bloque?.ganador;
  const segundo = bloque?.segundo;
  const sinJornada = presentes.length === 0 && candidatos.length > 0;

  return (
    <section className="tv-panel">
      <div className="tv-panel-head">
        <div>
          <h2>Escrutinio en vivo</h2>
          <p>
            {nombreEleccion}
            {centro ? ` · ${centro}` : ""}
            {cargando ? " · Cargando…" : ""}
          </p>
        </div>
        <div className="tv-live" aria-live="polite">
          <i />
          EN VIVO
          <span>{textoHace(actualizado)}</span>
        </div>
      </div>

      <div className="tv-jornadas" role="tablist" aria-label="Jornada">
        {JORNADAS.map((j) => {
          const b = bloques.find((x) => x.jornada === j);
          return (
            <button
              key={j}
              type="button"
              role="tab"
              aria-selected={jornada === j}
              className={`tv-jornada${jornada === j ? " is-on" : ""}`}
              onClick={() => setJornada(j)}
            >
              {j}
              <small>
                {b?.lista.length
                  ? `${b.lista.length} candidato${b.lista.length === 1 ? "" : "s"}`
                  : "Sin lista"}
              </small>
            </button>
          );
        })}
      </div>

      {sinJornada ? (
        <div className="tv-ganador">
          <p className="mb-0">
            Estos candidatos aún no tienen jornada asignada. Así van en total.
          </p>
        </div>
      ) : ganador ? (
        <div className="tv-ganador">
          <p className="mb-0">
            En <strong>{jornada}</strong> va ganando{" "}
            <strong>
              {ganador.nombre} {ganador.apellido}
            </strong>{" "}
            con {formatoVotos(ganador.votos)} votos ({formatoPorcentaje(ganador.porcentaje)}
            ).
            {segundo && bloque?.ventaja != null
              ? ` Le saca ${formatoVotos(bloque.ventaja)} a ${segundo.nombre} ${segundo.apellido}.`
              : " Único candidato de esta jornada."}
          </p>
          <small className="text-muted">
            {formatoVotos(bloque?.totalVotos || 0)} votos escrutados en esta jornada
          </small>
        </div>
      ) : (
        <div className="tv-ganador">
          <p className="mb-0 text-muted">
            Todavía no hay candidatos cargados en la jornada {jornada}.
          </p>
        </div>
      )}

      <div className="tv-pdfs">
        {JORNADAS.map((j) => {
          const b = bloques.find((x) => x.jornada === j);
          return (
            <Button
              key={`pdf-${j}`}
              variant={j === jornada ? "success" : "outline-success"}
              disabled={!!exportando || !b?.lista.length}
              onClick={() => void onPdfJornada(j)}
            >
              <FaFilePdf className="me-2" />
              {exportando === j ? "Generando…" : `PDF ${j}`}
            </Button>
          );
        })}
        <Button
          variant="outline-secondary"
          disabled={!!exportando || candidatos.length === 0}
          onClick={() => void onPdfTodas()}
        >
          <FaFilePdf className="me-2" />
          {exportando === "todas" ? "Generando…" : "PDF de las 3 jornadas"}
        </Button>
      </div>

      <TableroResultadosTv
        candidatos={sinJornada ? candidatos : lista}
        vacio={`No hay tarjetones de ${jornada} en esta elección.`}
      />
    </section>
  );
}
