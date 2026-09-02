import { JORNADAS, type Jornada } from "../../constants/jornada";
import { useAuth } from "../../context/auth/auth.context";
import { useNavigate } from "react-router-dom";
import { jornadaDelAprendiz } from "../../utils/jornadaAprendiz";
import { DiosBulb, DiosChip, DiosLeaf } from "../../theme/DiosIcons";

const DETALLE: Record<Jornada, string> = {
  Mañana: "Verás la elección de tu centro y solo los candidatos de la mañana.",
  Tarde: "Verás la elección de tu centro y solo los candidatos de la tarde.",
  Noche: "Verás la elección de tu centro y solo los candidatos de la noche.",
};

const ICONO: Record<Jornada, typeof DiosChip> = {
  Mañana: DiosChip,
  Tarde: DiosBulb,
  Noche: DiosLeaf,
};

const CLASE: Record<Jornada, string> = {
  Mañana: "admin-shortcut--digital",
  Tarde: "admin-shortcut--innovador",
  Noche: "admin-shortcut--sostenible",
};

export default function ElegirJornadaPage() {
  const { setJornada, user } = useAuth();
  const navigate = useNavigate();
  const actual = jornadaDelAprendiz(user);

  const elegir = (jornada: Jornada) => {
    setJornada(jornada);
    navigate("/votaciones", { replace: true });
  };

  return (
    <div className="admin-dash">
      <header className="admin-dash-hero">
        <p className="admin-dash-eyebrow">Antes de votar</p>
        <h1>
          Elige tu <span>jornada</span>
        </h1>
        <p className="admin-dash-lead">
          {actual
            ? `Ahora estás en ${actual}. Si ya votaste, cambiar de jornada solo cambia a quién ves: no puedes votar otra vez en la misma elección.`
            : "Así te mostramos solo la elección y los candidatos de tu turno. Un voto por elección, aunque cambies de jornada."}
        </p>
      </header>

      <div className="admin-shortcut-grid" style={{ marginTop: "1.6rem" }}>
        {JORNADAS.map((jornada) => {
          const Icono = ICONO[jornada];
          return (
            <button
              key={jornada}
              type="button"
              className={`admin-shortcut ${CLASE[jornada]}${actual === jornada ? " is-on" : ""}`}
              onClick={() => elegir(jornada)}
            >
              <span className="admin-shortcut-icon">
                <Icono />
              </span>
              <span>
                <strong>{jornada}</strong>
                <small>
                  {actual === jornada ? "Jornada actual · " : ""}
                  {DETALLE[jornada]}
                </small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
