import type { ReactNode } from "react";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

export function LupaDetalle({
  onClick,
  titulo = "Ver información completa",
}: {
  onClick: () => void;
  titulo?: string;
}) {
  return (
    <button
      type="button"
      className="tabla-lupa"
      onClick={onClick}
      title={titulo}
      aria-label={titulo}
    >
      <FaSearch />
    </button>
  );
}

export function textoCorto(valor: unknown, max = 28) {
  const texto = valor == null ? "" : String(valor).trim();
  if (!texto) return "—";
  if (texto.length <= max) return texto;
  return `${texto.slice(0, max).trim()}…`;
}

export function etiquetaEstado(estado?: string | null) {
  const crudo = (estado || "").trim();
  if (!crudo) return "Sin estado";
  return crudo
    .replace(/formacion/gi, "formación")
    .replace(/cancelado/gi, "Cancelado")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function colorSemaforo(estado?: string | null) {
  const valor = (estado || "").toLowerCase();
  if (
    valor === "activo" ||
    valor === "en formacion" ||
    valor === "en formación" ||
    valor === "certificado" ||
    valor === "condicionado"
  ) {
    return "verde";
  }
  if (valor === "trasladado" || valor === "pendiente") {
    return "amarillo";
  }
  return "rojo";
}

export function SemaforoEstado({
  estado,
  conTexto = false,
}: {
  estado?: string | null;
  conTexto?: boolean;
}) {
  const etiqueta = etiquetaEstado(estado);
  const color = colorSemaforo(estado);

  const cuadrito = (
    <span
      className={`semaforo semaforo--${color}`}
      tabIndex={0}
      aria-label={etiqueta}
    />
  );

  return (
    <span className="semaforo-wrap">
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{etiqueta}</Tooltip>}
        popperConfig={{ strategy: "fixed" }}
      >
        {cuadrito}
      </OverlayTrigger>
      {conTexto ? <span className="semaforo-texto">{etiqueta}</span> : null}
    </span>
  );
}

export function DetalleFilaModal({
  show,
  onHide,
  titulo,
  campos,
}: {
  show: boolean;
  onHide: () => void;
  titulo: string;
  campos: { etiqueta: string; valor: ReactNode }[];
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <dl className="tabla-detalle-lista">
          {campos.map((campo) => (
            <div key={campo.etiqueta} className="tabla-detalle-item">
              <dt>{campo.etiqueta}</dt>
              <dd>{campo.valor || "—"}</dd>
            </div>
          ))}
        </dl>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
