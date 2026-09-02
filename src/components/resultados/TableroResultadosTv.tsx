import { useState, useEffect } from "react";
import { formatoPorcentaje, formatoVotos } from "../../utils/fotoCandidato";
import type { CandidatoResultado } from "../../hooks/useResultadosEnVivo";
import "./tableroResultadosTv.css";

type Props = {
  candidatos: CandidatoResultado[];
  vacio?: string;
};

function iniciales(c: CandidatoResultado) {
  const a = (c.nombre || "").trim().slice(0, 1);
  const b = (c.apellido || "").trim().slice(0, 1);
  return (a + b || "?").toUpperCase();
}

function Foto({ candidato }: { candidato: CandidatoResultado }) {
  const [ok, setOk] = useState(Boolean(candidato.foto));
  const nombre = `${candidato.nombre} ${candidato.apellido}`.trim();

  useEffect(() => {
    setOk(Boolean(candidato.foto));
  }, [candidato.foto]);

  if (ok && candidato.foto) {
    return (
      <img
        src={candidato.foto}
        alt={nombre}
        onError={() => setOk(false)}
      />
    );
  }
  return <span aria-hidden>{iniciales(candidato)}</span>;
}

export function TableroResultadosTv({ candidatos, vacio }: Props) {
  if (candidatos.length === 0) {
    return (
      <div className="tv-studio">
        <div className="tv-empty">
          <strong>Sin candidatos en esta jornada</strong>
          <p>{vacio || "Cuando se inscriban, aquí se verá el escrutinio en vivo."}</p>
        </div>
      </div>
    );
  }

  const maxPct = Math.max(1, ...candidatos.map((c) => c.porcentaje));

  return (
    <div className="tv-studio">
      <div className="tv-board" role="list">
        {candidatos.map((c, i) => {
          const alto = Math.max(8, (c.porcentaje / maxPct) * 100);
          return (
            <article
              key={c.id || `${c.nombre}-${i}`}
              className={`tv-card${i === 0 && c.votos > 0 ? " is-lead" : ""}`}
              role="listitem"
            >
              <header className="tv-name">
                {`${c.nombre} ${c.apellido}`.trim()}
              </header>
              <div className="tv-body">
                <div className="tv-foto">
                  <Foto candidato={c} />
                </div>
                <div className="tv-stats">
                  <div className="tv-track">
                    <div className="tv-stack" style={{ height: `${alto}%` }}>
                      <div className="tv-pct">{formatoPorcentaje(c.porcentaje)}</div>
                      <div className="tv-bar" />
                    </div>
                  </div>
                </div>
              </div>
              <footer className="tv-foot">
                <small>VOTOS</small>
                <b>{formatoVotos(c.votos)}</b>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
