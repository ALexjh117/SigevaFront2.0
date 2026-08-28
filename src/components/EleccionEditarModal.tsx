/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { api } from "../api";
import { useAuth } from "../context/auth/auth.context";

interface Eleccion {
  ideleccion: number;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  jornada?: string | null;
  idcentroFormacion?: number;
}

interface Props {
  show: boolean;
  onHide: () => void;
  eleccion: Eleccion | null;
  onUpdated: () => void;

}

export default function EleccionEditarModal({
  show,
  onHide,
  eleccion,
  onUpdated,
}: Props) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: "",
    jornada: "",
  });

  // Extraer solo hora "HH:mm" de un ISO string sin desfase
  const extractTimeFromISO = (timeValue?: string) => {
    if (!timeValue) return "";
    const match = timeValue.match(/T(\d{2}:\d{2})/);
    return match ? match[1] : "";
  };

  // Formatear fecha a "YYYY-MM-DD"
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  // Cargar datos de la elección seleccionada
  useEffect(() => {
    if (eleccion) {
      setFormData({
        nombre: eleccion.titulo,
        fecha_inicio: formatDate(eleccion.fechaInicio),
        fecha_fin: formatDate(eleccion.fechaFin),
        hora_inicio: extractTimeFromISO(eleccion.horaInicio),
        hora_fin: extractTimeFromISO(eleccion.horaFin),
        jornada: eleccion.jornada ?? "",
      });
    }
  }, [eleccion]);

  // Guardar cambios en inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Enviar datos al backend
  const handleSubmit = async () => {
    if (!eleccion) return;

    const idCentro =
      eleccion.idcentroFormacion ?? user?.centroFormacion;
    if (!idCentro) {
      alert("No se pudo determinar el centro de formación de esta elección.");
      return;
    }

    const payload: Record<string, string | number> = {
      idcentro_formacion: idCentro,
      nombre: formData.nombre,
    };

    if (formData.fecha_inicio) payload.fecha_inicio = formData.fecha_inicio;
    if (formData.fecha_fin) payload.fecha_fin = formData.fecha_fin;
    if (formData.hora_inicio && formData.fecha_inicio)
      payload.hora_inicio = `${formData.fecha_inicio}T${formData.hora_inicio}:00`;
    if (formData.hora_fin && formData.fecha_fin)
      payload.hora_fin = `${formData.fecha_fin}T${formData.hora_fin}:00`;

    

    try {
      await api.put(
        `/api/eleccionActualizar/${eleccion.ideleccion}`,
        payload
      );
      alert('Elección actualizada exitosamente');
   
      
      
      onUpdated();
      onHide();
    } catch (error) {
      console.error("Error al actualizar elección:", error);
      alert("Ocurrió un error al actualizar la elección");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Elección</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col sm={12}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hora Inicio</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Fin</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group className="mb-3">
                <Form.Label>Hora Fin</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col sm={12}>
              <Form.Group className="mb-3">

              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
