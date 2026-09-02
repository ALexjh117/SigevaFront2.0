import { Modal, Row, Col, Card, Button } from "react-bootstrap";
import { FaCalendarAlt } from "react-icons/fa";
import { useState } from "react";
import GeneracionReporte from "../pages/funcionario/GeneracionReporte_NEW";
import { JORNADAS, esJornada } from "../constants/jornada";
import { useResultadosEnVivo } from "../hooks/useResultadosEnVivo";

interface Aprendiz {
  nombres: string;
  apellidos: string;
}

interface Candidato {
  idcandidatos: string;
  numeroTarjeton: string;
  foto: string;
  jornada?: string | null;
  aprendiz: Aprendiz;
}

interface Eleccion {
  ideleccion: number;
  titulo: string;
  centro: string;
  jornada: string | null;
  fechaInicio: string;
  fechaFin: string;
}

function FotoCandidato({ candidato }: { candidato: Candidato }) {
  const base = import.meta.env.VITE_BASE_URL as string | undefined;
  const raw = candidato.foto?.trim();
  const src = raw
    ? raw.startsWith("http")
      ? raw
      : base
        ? `${String(base).trim().replace(/\/$/, "")}/${raw.replace(/^\/+/, "")}`
        : raw
    : undefined;
  const iniciales =
    `${candidato.aprendiz.nombres?.[0] || ""}${candidato.aprendiz.apellidos?.[0] || ""}`.toUpperCase();

  return (
    <Card className="shadow-sm text-center p-2" style={{ width: "140px" }}>
      {src ? (
        <Card.Img
          src={src}
          alt={`${candidato.aprendiz.nombres} ${candidato.aprendiz.apellidos}`}
          className="rounded-circle mx-auto d-block"
          style={{ width: "80px", height: "80px", objectFit: "cover" }}
        />
      ) : (
        <div
          className="rounded-circle mx-auto d-flex align-items-center justify-content-center bg-light text-secondary"
          style={{ width: "80px", height: "80px", fontWeight: 600 }}
          aria-label="Sin foto"
        >
          {iniciales}
        </div>
      )}
      <Card.Body className="p-2">
        <Card.Title className="fw-bold" style={{ fontSize: "0.9rem" }}>
          {candidato.aprendiz.nombres} {candidato.aprendiz.apellidos}
        </Card.Title>
        <Card.Text style={{ fontSize: "0.8rem" }}>
          Tarjetón: {candidato.numeroTarjeton}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

interface EleccionDetalleModalProps {
  show: boolean;
  onClose: () => void;
  eleccion: Eleccion | null;
  candidatos: Candidato[];
}

export default function EleccionDetalleModal({
  show,
  onClose,
  eleccion,
  candidatos,
}: EleccionDetalleModalProps) {
  const [showReporte, setShowReporte] = useState(false);
  const { candidatos: resultados, meta, cargando, actualizado } = useResultadosEnVivo(
    show && showReporte && eleccion ? eleccion.ideleccion : null
  );

  const handleVolverDeReporte = () => {
    setShowReporte(false);
  };

  if (!eleccion) return null;

  const eleccionParaReporte = {
    id: String(eleccion.ideleccion),
    nombre: meta.titulo || eleccion.titulo,
    fechaInicio: meta.fechaInicio || eleccion.fechaInicio,
    fechaFin: meta.fechaFin || eleccion.fechaFin,
    estado: "En curso",
    centro: eleccion.centro,
    jornada: eleccion.jornada || "No especificada",
    totalVotos: resultados.reduce((s, c) => s + c.votos, 0),
    totalParticipantes: meta.totalParticipantes,
    candidatos: resultados,
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        setShowReporte(false);
        onClose();
      }}
      size={showReporte ? "xl" : "lg"}
      centered
    >
      <Modal.Body className="p-4">
        {!showReporte ? (
          <>
            <h4 className="fw-bold mb-3">{eleccion.titulo}</h4>
            <p className="text-muted">
              <FaCalendarAlt className="me-2" />
              {eleccion.fechaInicio} - {eleccion.fechaFin}
            </p>

            <Row className="g-3 mt-3">
              {candidatos.length === 0 ? (
                <p className="text-muted">No hay candidatos cargados.</p>
              ) : (
                <>
                  {JORNADAS.map((jornada) => {
                    const lista = candidatos.filter((c) => c.jornada === jornada);
                    return (
                      <Col xs={12} key={jornada}>
                        <p className="fw-semibold mb-2">Jornada {jornada}</p>
                        <Row className="g-3">
                          {lista.length === 0 ? (
                            <Col>
                              <p className="text-muted small">Sin candidatos en esta jornada.</p>
                            </Col>
                          ) : (
                            lista.map((candidato) => (
                              <Col key={candidato.idcandidatos} xs={6} md={4} lg={3}>
                                <FotoCandidato candidato={candidato} />
                              </Col>
                            ))
                          )}
                        </Row>
                      </Col>
                    );
                  })}
                  {candidatos.some((c) => !esJornada(c.jornada)) && (
                    <Col xs={12}>
                      <p className="fw-semibold mb-2">Sin jornada asignada</p>
                      <Row className="g-3">
                        {candidatos
                          .filter((c) => !esJornada(c.jornada))
                          .map((candidato) => (
                            <Col key={candidato.idcandidatos} xs={6} md={4} lg={3}>
                              <FotoCandidato candidato={candidato} />
                            </Col>
                          ))}
                      </Row>
                    </Col>
                  )}
                </>
              )}
            </Row>

            <div className="d-flex gap-3 mt-4">
              <Button variant="secondary" onClick={onClose}>
                Volver
              </Button>
              <Button className="btn-gradient" onClick={() => setShowReporte(true)}>
                Ver escrutinio en vivo
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button variant="outline-secondary" onClick={handleVolverDeReporte}>
                ← Volver al detalle
              </Button>
            </div>
            <GeneracionReporte
              eleccion={eleccionParaReporte}
              actualizado={actualizado}
              cargando={cargando}
            />
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
