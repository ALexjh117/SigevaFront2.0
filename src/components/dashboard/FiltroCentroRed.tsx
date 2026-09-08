import { Col, Form, Row } from "react-bootstrap";
import type { CentroOpcion, RegionalOpcion } from "../../hooks/useCatalogoCentros";

type Props = {
  regionales: RegionalOpcion[];
  centros: CentroOpcion[];
  idRegional: number;
  idCentro: number;
  onRegional: (id: number) => void;
  onCentro: (id: number) => void;
};

export function FiltroCentroRed({
  regionales,
  centros,
  idRegional,
  idCentro,
  onRegional,
  onCentro,
}: Props) {
  return (
    <Row className="mb-3 g-3">
      <Col md={6}>
        <Form.Label>Regional</Form.Label>
        <Form.Select
          value={idRegional || ""}
          onChange={(e) => onRegional(Number(e.target.value) || 0)}
        >
          <option value="">Selecciona una regional</option>
          {regionales.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </Form.Select>
      </Col>
      <Col md={6}>
        <Form.Label>Centro de formación</Form.Label>
        <Form.Select
          value={idCentro || ""}
          disabled={!idRegional}
          onChange={(e) => onCentro(Number(e.target.value) || 0)}
        >
          <option value="">
            {idRegional
              ? "Selecciona un centro de formación"
              : "Primero elige la regional"}
          </option>
          {centros.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Form.Select>
      </Col>
    </Row>
  );
}
