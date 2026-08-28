import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { MdHowToVote, MdOutlineAssignment } from "react-icons/md";
import { FaUsers, FaPlusCircle } from "react-icons/fa";
import { api } from "../../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth.context";
import { esAdministradorRed } from "../../utils/roles";
import { nombreDeUsuario } from "../../utils/usuario";
import { DiosBulb, DiosChip, DiosLeaf, DiosTarget } from "../../theme/DiosIcons";

export const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [votacionesActivas, setVotacionesActivas] = useState<number>(0);
  const [usuariosRegistrados, setUsuariosRegistrados] = useState<number>(0);
  const [aprendizDisponible, setAprendizDisponible] = useState<number>(0);
  const [votosHoy, setVotosHoy] = useState<number>(0);
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);
  const nombreVisible = nombreDeUsuario(user);
  const cifra = (n: number) => n.toLocaleString("es-CO");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resActivas = await api.get(
          esRed
            ? "api/eleccion/activas"
            : `api/eleccionPorCentro/${user?.centroFormacion}`
        );
        setVotacionesActivas(resActivas.data.eleccionesActivas?.length || 0);

        const resAprendizActivo = await api.get(
          esRed
            ? "api/aprendiz/disponibles/"
            : `api/aprendiz/disponibles/centros/${user?.centroFormacion}`
        );

        setAprendizDisponible(resAprendizActivo.data.data.length || 0);

        const resUsuarios = await api.get(
          esRed
            ? "/api/aprendiz/listar"
            : `api/aprendiz/inscritos/centro/${user?.centroFormacion}`
        );
        esRed
          ? setUsuariosRegistrados(resUsuarios.data?.length || 0)
          : setUsuariosRegistrados(resUsuarios.data.data?.length || 0);

        const resVotos = await api.get("/api/votoXCandidato/traer");
        const votos = resVotos.data?.data || [];
        const hoy = new Date().toISOString().split("T")[0];
        const votosDeHoy = votos.filter((v: { createdAt: string }) =>
          v.createdAt.startsWith(hoy)
        );
        setVotosHoy(votosDeHoy.length);
      } catch (error) {
        console.error("Error al traer datos del dashboard:", error);
      }
    };

    fetchData();
  }, []);

  if (esRed) {
    return (
      <div className="admin-dash">
        <header className="admin-dash-hero">
          <p className="admin-dash-eyebrow">Así va la votación</p>
          <h1>
            Bienvenido, <span>{nombreVisible}</span>
          </h1>
          <p className="admin-dash-lead">
            Cuatro números para ver cómo va el proceso: quiénes ya están,
            cuántos votaron hoy, qué elecciones siguen abiertas y quiénes
            pueden participar. Claro, al instante.
          </p>
        </header>

        <div className="admin-kpi-grid">
          <article
            className="admin-kpi admin-kpi--digital is-clickable"
            onClick={() => navigate("/aprendices")}
          >
            <h3 className="admin-kpi-pillar">Digital</h3>
            <div className="admin-kpi-icon">
              <DiosChip />
            </div>
            <p>{cifra(usuariosRegistrados)}</p>
            <strong className="admin-kpi-metric">Aprendices en el sistema</strong>
            <small>Quienes ya forman parte de esta votación.</small>
          </article>

          <article className="admin-kpi admin-kpi--innovador">
            <h3 className="admin-kpi-pillar">Innovador</h3>
            <div className="admin-kpi-icon">
              <DiosBulb />
            </div>
            <p>{cifra(votosHoy)}</p>
            <strong className="admin-kpi-metric">Votos registrados hoy</strong>
            <small>Cada voto de hoy acerca una decisión.</small>
          </article>

          <article className="admin-kpi admin-kpi--oferta">
            <h3 className="admin-kpi-pillar">Oferta pertinente</h3>
            <div className="admin-kpi-icon">
              <DiosTarget />
            </div>
            <p>{cifra(votacionesActivas)}</p>
            <strong className="admin-kpi-metric">Elecciones abiertas ahora</strong>
            <small>Las que puedes seguir en este momento.</small>
          </article>

          <article className="admin-kpi admin-kpi--sostenible">
            <h3 className="admin-kpi-pillar">Sostenibilidad</h3>
            <div className="admin-kpi-icon">
              <DiosLeaf />
            </div>
            <p>{cifra(aprendizDisponible)}</p>
            <strong className="admin-kpi-metric">Habilitados para votar</strong>
            <small>Quienes ya pueden emitir su voto.</small>
          </article>
        </div>

        <p className="admin-dash-slogan">Cada voto cuenta. Cada idea también.</p>

        <div className="admin-shortcut-grid">
          <button
            type="button"
            className="admin-shortcut admin-shortcut--digital"
            onClick={() => navigate("/aprendices")}
          >
            <span className="admin-shortcut-icon">
              <DiosChip />
            </span>
            <span>
              <strong>Aprendices de la red</strong>
              <small>Consultar el registro</small>
            </span>
          </button>
          <button
            type="button"
            className="admin-shortcut admin-shortcut--innovador"
            onClick={() => navigate("/aprendiz-form")}
          >
            <span className="admin-shortcut-icon">
              <DiosBulb />
            </span>
            <span>
              <strong>Añadir aprendiz</strong>
              <small>Registro individual</small>
            </span>
          </button>
          <button
            type="button"
            className="admin-shortcut admin-shortcut--oferta"
            onClick={() => navigate("/funcionarios")}
          >
            <span className="admin-shortcut-icon">
              <DiosTarget />
            </span>
            <span>
              <strong>Funcionarios</strong>
              <small>Equipo de bienestar</small>
            </span>
          </button>
          <button
            type="button"
            className="admin-shortcut admin-shortcut--sostenible"
            onClick={() => navigate("/elecciones")}
          >
            <span className="admin-shortcut-icon">
              <DiosLeaf />
            </span>
            <span>
              <strong>Elecciones de la red</strong>
              <small>Todos los centros</small>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Container fluid className="p-4 bg-light min-vh-100">
        <Row className="mb-4">
          <Col>
            <h2>
              Bienvenido de nuevo,{" "}
              <span
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontWeight: 700,
                  fontSize: "32px",
                  color: "#5F2EEA",
                }}
              >
                {nombreVisible}
              </span>
            </h2>
            <p className="text-muted">
              Desde aquí administras las elecciones y el padrón de tu centro de
              formación.
            </p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <h5>Resumen General</h5>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={4}>
            <Card className="shadow-sm text-center p-3">
              <Card.Body>
                <MdHowToVote size={40} color="brown" />
                <Card.Title>Votaciones Activas</Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {votacionesActivas}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card
              className="shadow-sm text-center p-3"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/aprendices")}
            >
              <Card.Body>
                <FaUsers size={40} color="#28a745" />
                <Card.Title>Aprendices Registrados</Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {usuariosRegistrados}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm text-center p-3">
              <Card.Body>
                <MdHowToVote size={40} color="brown" />
                <Card.Title>Aprendices habilitados</Card.Title>
                <Card.Text className="fs-4 fw-bold">
                  {aprendizDisponible}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm text-center p-3">
              <Card.Body>
                <MdOutlineAssignment size={40} color="#4285F4" />
                <Card.Title>Votos Totales Hoy</Card.Title>
                <Card.Text className="fs-4 fw-bold">{votosHoy}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Row className="mb-3 flex">
            <Col>
              <h5>Accesos Directos</h5>
            </Col>
          </Row>
          <Row className="">
            <Col md="auto">
              <Card className="shadow-sm text-center p-3">
                <Card.Body>
                  <FaPlusCircle
                    size={40}
                    className="text-primary mb-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/aprendiz-form")}
                  />
                  <Card.Title>Añadir Aprendiz</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Row>
      </Container>
    </div>
  );
};
