import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { MdHowToVote, MdOutlineAssignment } from "react-icons/md";
import { FaUsers, FaPlusCircle, FaUserGraduate } from "react-icons/fa";
import { api } from "../../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth.context";
import { esAdministradorRed } from "../../utils/roles";
export const DashboardAdmin = () => {
  const navigate = useNavigate();
  const [votacionesActivas, setVotacionesActivas] = useState<number>(0);
  const [usuariosRegistrados, setUsuariosRegistrados] = useState<number>(0);
  const [aprendizDisponible, setAprendizDisponible] = useState<number>(0);
  const [votosHoy, setVotosHoy] = useState<number>(0);
  const {user} = useAuth();
  const esRed = esAdministradorRed(user?.perfil);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Votaciones activas
        const resActivas = await api.get(esRed? "api/eleccion/activas":`api/eleccionPorCentro/${user?.centroFormacion}`);
        setVotacionesActivas(resActivas.data.eleccionesActivas?.length || 0);

        const resAprendizActivo = await api.get(esRed? "api/aprendiz/disponibles/":`api/aprendiz/disponibles/centros/${user?.centroFormacion}`);
        
        setAprendizDisponible(resAprendizActivo.data.data.length || 0);

        const resUsuarios = await api.get(esRed? "/api/aprendiz/listar" : `api/aprendiz/inscritos/centro/${user?.centroFormacion}`);
        esRed? setUsuariosRegistrados(resUsuarios.data?.length || 0) : setUsuariosRegistrados(resUsuarios.data.data?.length || 0);

        // Votos totales hoy
        const resVotos = await api.get("/api/votoXCandidato/traer");
        const votos =resVotos.data?.data || []
        const hoy = new Date().toISOString().split("T")[0];
        const votosDeHoy = votos.filter((v: any) => 
  v.createdAt.startsWith(hoy)
);
        setVotosHoy(votosDeHoy.length);
      } catch (error) {
        console.error("Error al traer datos del dashboard:", error);
      }
    };

    fetchData();
  }, []);

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
                {user?.perfil === "admin_sistema"
                  ? "admin de centro"
                  : user?.perfil}
              </span>
            </h2>
            <p className="text-muted">
              {esRed
                ? "Desde aquí puedes gestionar usuarios, supervisar el registro de aprendices y acceder a los reportes de votaciones realizadas en cada centro de formación."
                : "Desde aquí administras las elecciones y el padrón de tu centro de formación."}
            </p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <h5>Resumen General</h5>
          </Col>
        </Row>

        <Row className="mb-4">
          {/* Votaciones Activas */}
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

          {/* Usuarios Registrados */}
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
          {/* Aprendices Habilitados */}
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

          {/* Votos Totales Hoy */}
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
            {esRed && (
            <Col md="auto">
              <Card className="shadow-sm text-center p-3">
                <Card.Body>
                  <FaUserGraduate
                    size={40}
                    className="text-primary mb-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/aprendices")}
                  />
                  <Card.Title>Padrón de la red</Card.Title>
                </Card.Body>
              </Card>
            </Col>
            )}
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
          {esRed &&  
            <Col md="auto">
              <Card className="shadow-sm text-center p-3">
                <Card.Body>
                  <FaPlusCircle
                    size={40}
                    className="text-primary mb-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/funcionarios")}
                  />
                  <Card.Title>Añadir Funcionario</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          } 
          </Row>
        </Row>
      </Container>
    </div>
  );
};
