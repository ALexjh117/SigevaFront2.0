import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth.context";
import { JORNADAS, type Jornada } from "../../constants/jornada";
import Navbar from "../../components/aprendiz/Navbar";
import { jornadaDelAprendiz } from "../../utils/jornadaAprendiz";

const DETALLE: Record<Jornada, string> = {
  Mañana: "Verás la elección de tu centro y solo los candidatos de la mañana.",
  Tarde: "Verás la elección de tu centro y solo los candidatos de la tarde.",
  Noche: "Verás la elección de tu centro y solo los candidatos de la noche.",
};

export default function ElegirJornadaPage() {
  const { user, setJornada } = useAuth();
  const navigate = useNavigate();

  if (user?.perfil === "Aprendiz" && jornadaDelAprendiz(user)) {
    return <Navigate to="/votaciones" replace />;
  }

  const elegir = (jornada: Jornada) => {
    setJornada(jornada);
    navigate("/votaciones", { replace: true });
  };

  return (
    <>
      <Navbar />
      <Container className="my-4" style={{ maxWidth: 960 }}>
        <h3 className="fw-bold">Elegir jornada</h3>
        <p className="text-muted">
          Elige tu jornada. La próxima vez que entres no te la volveremos a pedir.
        </p>
        <Row className="g-4 my-2">
          {JORNADAS.map((jornada) => (
            <Col key={jornada} xs={12} md={4}>
              <Card className="h-100 border-success border-1">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold">{jornada}</Card.Title>
                  <Card.Text className="text-muted flex-grow-1">{DETALLE[jornada]}</Card.Text>
                  <Button className="btn-gradient w-100 mt-2" onClick={() => elegir(jornada)}>
                    Elegir jornada {jornada}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
