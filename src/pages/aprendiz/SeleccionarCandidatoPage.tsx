import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CandidatoCard from "../../components/aprendiz/CandidatoCard";
import SelecionarCandidato from "../../components/aprendiz/ModalCandidato";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import { jornadaDelAprendiz } from "../../utils/jornadaAprendiz";
import { comoLista } from "../../utils/comoLista";
import { esJornada } from "../../constants/jornada";
import {
  candidatosYaVotados,
  eleccionYaVotada,
} from "../../utils/votoAprendiz";

type CandidatoLista = {
  idcandidatos: string;
  programa: string;
  propuesta: string;
  foto: string;
  numeroTarjeton: string;
  jornada?: string;
  aprendiz: { nombres: string; apellidos: string };
};

export default function CandidateSelectionPage() {
  const { id } = useParams();
  const [candidatos, setCandidatos] = useState<CandidatoLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [yaVoto, setYaVoto] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<{
    nombre: string;
    programa: string;
    propuesta: string;
    foto: string;
    numeroTarjeton: string;
    idCandidato: string;
  } | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const jornada = jornadaDelAprendiz(user);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !jornada) return;
      try {
        setLoading(true);
        const [response, votados] = await Promise.all([
          api.get(`/api/candidatos/listar/${id}`),
          candidatosYaVotados(Number(user?.id)),
        ]);
        const todos = comoLista<CandidatoLista>(response.data);
        const hayJornada = todos.some((c) => esJornada(c.jornada));
        const deJornada = todos.filter((c) =>
          esJornada(c.jornada) ? c.jornada === jornada : true
        );
        setCandidatos(hayJornada ? deJornada : todos);
        setYaVoto(eleccionYaVotada(todos, votados));
      } catch (error) {
        console.error("Error al cargar candidatos:", error);
        setCandidatos([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, jornada, user?.id]);

  return (
    <div className="admin-dash">
      <header className="admin-dash-hero">
        <p className="admin-dash-eyebrow">Jornada {jornada}</p>
        <h1>
          Elige un <span>candidato</span>
        </h1>
        <p className="admin-dash-lead">
          {yaVoto
            ? "Ya votaste en esta elección. Puedes ver los candidatos de otra jornada, pero no puedes votar otra vez."
            : "Toca un candidato para leer su propuesta y votar. Si votas, te pediremos el código de 6 caracteres que llega a tu correo."}
        </p>
      </header>

      <p className="apz-muted" style={{ marginBottom: "1.2rem" }}>
        <button type="button" className="admin-vote-cta admin-vote-cta--go" onClick={() => navigate("/votaciones")}>
          Volver a votos
        </button>
      </p>

      {loading ? (
        <p className="apz-muted">Cargando candidatos de la jornada {jornada}…</p>
      ) : candidatos.length === 0 ? (
        <div className="grafica-card" style={{ textAlign: "left" }}>
          <h3>No hay candidatos para tu jornada</h3>
          <small>
            Cuando el centro publique la lista de {jornada}, podrás votar desde aquí.
          </small>
        </div>
      ) : (
        <div className="admin-election-grid admin-cand-grid">
          {candidatos.map((c) => (
            <CandidatoCard
              key={c.idcandidatos}
              {...c}
              seleccionado={
                showModal &&
                candidatoSeleccionado?.idCandidato === String(c.idcandidatos)
              }
              onOpen={(data) => {
                setCandidatoSeleccionado(data);
                setShowModal(true);
              }}
            />
          ))}
        </div>
      )}

      <SelecionarCandidato
        show={showModal}
        onHide={() => setShowModal(false)}
        candidato={candidatoSeleccionado}
        yaVoto={yaVoto}
      />
    </div>
  );
}
