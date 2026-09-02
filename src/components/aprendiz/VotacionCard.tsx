import { useNavigate } from "react-router-dom";

interface Props {
  titulo: string;
  centro: string;
  ideleccion: string | number;
  hayCandidatos: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  yaVoto?: boolean;
}

function rango(inicio?: string, fin?: string) {
  const fmt = (s?: string) => {
    if (!s) return "";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  };
  const a = fmt(inicio);
  const b = fmt(fin);
  if (!a && !b) return null;
  return [a, b].filter(Boolean).join(" — ");
}

export const VotacionCard = ({
  titulo,
  centro,
  ideleccion,
  hayCandidatos,
  fechaInicio,
  fechaFin,
  yaVoto,
}: Props) => {
  const navigate = useNavigate();
  const fechas = rango(fechaInicio, fechaFin);
  const puedeEntrar = hayCandidatos;
  const puedeVotar = hayCandidatos && !yaVoto;

  return (
    <article
      className={`grafica-card admin-vote-card${puedeEntrar ? " is-clickable" : ""}`}
      onClick={puedeEntrar ? () => navigate(`/seleccion/${ideleccion}`) : undefined}
    >
      <header>
        <h3>{titulo}</h3>
        <small className={yaVoto ? "admin-pill-done" : hayCandidatos ? "admin-pill-on" : "admin-pill-off"}>
          {yaVoto ? "Ya votaste" : hayCandidatos ? "Abierta" : "Sin lista"}
        </small>
      </header>
      <p className="admin-vote-meta">{centro}</p>
      {fechas ? <p className="admin-vote-meta">{fechas}</p> : null}
      {yaVoto ? (
        <p className="admin-vote-cta">
          {hayCandidatos
            ? "Tu voto ya quedó registrado. Puedes ver candidatos, no votar otra vez."
            : "Tu voto ya quedó registrado."}
        </p>
      ) : puedeVotar ? (
        <p className="admin-vote-cta admin-vote-cta--go">Participar</p>
      ) : (
        <p className="admin-vote-cta">Todavía no hay candidatos para tu jornada.</p>
      )}
    </article>
  );
};
