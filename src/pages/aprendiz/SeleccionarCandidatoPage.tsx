import { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import CandidatoCard from "../../components/aprendiz/CandidatoCard";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import SelecionarCandidato from "../../components/aprendiz/ModalCandidato";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import Navbar from "../../components/aprendiz/Navbar";
import { useAuth } from "../../context/auth/auth.context";
import { jornadaDelAprendiz } from "../../utils/jornadaAprendiz";

export default function CandidateSelectionPage() {
  const { id } = useParams();
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [idCandidato, setIdCandidato] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const jornada = jornadaDelAprendiz(user);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !jornada) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/candidatos/listar/${id}`, {
          params: { jornada },
        });
        setCandidatos(response.data.data ?? []);
      } catch (error) {
        console.error("Error al cargar candidatos:", error);
        setCandidatos([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, jornada]);

  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<{
    nombre: string;
    programa: string;
    propuesta: string;
    foto: string;
    numeroTarjeton: string;
    idCandidato: string;
  } | null>(null);


  if (user?.perfil === "Aprendiz" && !jornada) {
    return <Navigate to="/elegir-jornada" replace />;
  }

  return (
    <>
      <Navbar />
      {loading ? (
        <Container className="my-4 text-center">
          <p className="text-muted">Cargando candidatos de la jornada {jornada}...</p>
        </Container>
      ) : candidatos.length === 0 ? (
        <Container className="my-4 text-center">
          <div>
            No hay candidatos para tu jornada!
          <div className="d-flex justify-content-start">
              <Button variant="success" onClick={()=>navigate("/votaciones")}><FaArrowAltCircleLeft/> Volver</Button></div>
          </div>
        </Container>
      ) : (
        <Container className="my-4 text-center">
          <h3 className="fw-bold">Selección de Candidato</h3>
          <p className="text-muted">
            Seleccione un candidato para ver sus propuestas y emitir su voto.
          </p>
          <div className="d-flex justify-content-start">
              <Button variant="success" onClick={()=>navigate("/votaciones")}><FaArrowAltCircleLeft/> Volver</Button>
          </div>
         

          <Row className="g-4 my-4">
            {candidatos.map((c, index) => (
              <Col key={index} xs={12} md={6} lg={3} onClick={() => setIdCandidato(c.idcandidatos)}>
                <CandidatoCard
                  {...c}
                  seleccionado={candidatoSeleccionado === c.aprendiz.nombres}
                  onSelect={() => setCandidatoSeleccionado(c.aprendiz.nombres)}
                  onMoreInfo={(data) => {
                    setCandidatoSeleccionado(data);
                    setShowModal(true);
                  }}
                  idCandidato={idCandidato}
                  setIdCandidato={setIdCandidato}
                />
              </Col>
            ))}
          </Row>

          {/* {candidatoSeleccionado && (
          <div className="d-flex justify-content-center mt-4">
            <Button className="btn-gradient">
              Votar por {candidatoSeleccionado}
            </Button>
          </div>
        )} */}

          <SelecionarCandidato
            show={showModal}
            onHide={() => setShowModal(false)}
            candidato={candidatoSeleccionado}

          />

        </Container>
      )}

    </>
  );
}
