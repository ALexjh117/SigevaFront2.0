import { Col, Container, Row } from "react-bootstrap";
import { VotacionCard } from "../../components/aprendiz/VotacionCard";
import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import Navbar from "../../components/aprendiz/Navbar";
import { Navigate } from "react-router-dom";
import { jornadaDelAprendiz } from "../../utils/jornadaAprendiz";

type Votacion = {
  ideleccion: number;
  titulo: string;
  centro: string;
  hayCandidatos: boolean;
};

const VotacionesActivasPage = () => {
  const [votaciones, setVotaciones] = useState<Votacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const { user } = useAuth();
  const jornada = jornadaDelAprendiz(user);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.CentroFormacion || !jornada) {
        setCargando(false);
        return;
      }
      try {
        const response = await api.get(
          `/api/eleccionPorCentro/${user?.CentroFormacion}`
        );
        const elecciones = response.data.eleccionesActivas ?? [];

        const conCandidatos: Votacion[] = await Promise.all(
          elecciones.map(async (vote: { ideleccion: number; titulo: string; centro: string }) => {
            try {
              const cand = await api.get(`/api/candidatos/listar/${vote.ideleccion}`, {
                params: { jornada },
              });
              const lista = cand.data.data ?? [];
              return {
                ideleccion: vote.ideleccion,
                titulo: vote.titulo,
                centro: vote.centro,
                hayCandidatos: lista.length > 0,
              };
            } catch {
              return {
                ideleccion: vote.ideleccion,
                titulo: vote.titulo,
                centro: vote.centro,
                hayCandidatos: false,
              };
            }
          })
        );

        setVotaciones(conCandidatos);
      } catch (error) {
        console.error("Error al cargar las votaciones:", error);
      } finally {
        setCargando(false);
      }
    };
    loadData();
  }, [user?.CentroFormacion, jornada]);

  if (user?.perfil === "Aprendiz" && !jornada) {
    return <Navigate to="/elegir-jornada" replace />;
  }

  return (
    <>
      <Navbar />
      <Container className="my-4">
        <h3 className="fw-bold">Votaciones Activas</h3>
        <p className="text-muted">Participe en los procesos de elección de aprendices.</p>
        <Row className="g-4 my-4">
          {cargando ? (
            <Col xs={12}>
              <p className="text-muted">Cargando votaciones...</p>
            </Col>
          ) : votaciones.length === 0 ? (
            <Col xs={12}>
              <p className="text-muted">No hay votaciones activas en tu centro.</p>
            </Col>
          ) : (
            votaciones.map((vote) => (
              <Col key={vote.ideleccion} xs={12} md={6} lg={4}>
                <VotacionCard
                  titulo={vote.titulo}
                  centro={vote.centro}
                  ideleccion={vote.ideleccion}
                  hayCandidatos={vote.hayCandidatos}
                />
              </Col>
            ))
          )}
        </Row>
      </Container>
    </>
  );
};

export default VotacionesActivasPage;
