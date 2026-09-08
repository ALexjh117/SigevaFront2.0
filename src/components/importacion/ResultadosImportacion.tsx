import { useEffect, useMemo, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import Swal from "sweetalert2";
import { ADMIN_PALETTE } from "../../theme/tokens";
import "./importacion.css";

export type FilaProcesada = {
  "Número de Documento"?: string;
  "Correo Electrónico"?: string;
  Nombre?: string;
  Apellidos?: string;
  status?: string;
  motivo?: string;
  [k: string]: unknown;
};

type Filtro = "todos" | "inserted" | "updated" | "skipped";

const ETIQUETA: Record<string, string> = {
  inserted: "Insertado",
  updated: "Actualizado",
  skipped: "Omitido",
};

function badgeDe(status?: string) {
  if (status === "inserted") return "success";
  if (status === "updated") return "info";
  return "secondary";
}

function contar(filas: FilaProcesada[]) {
  return {
    inserted: filas.filter((f) => f.status === "inserted").length,
    updated: filas.filter((f) => f.status === "updated").length,
    skipped: filas.filter((f) => f.status === "skipped").length,
  };
}

export function avisarImportacionOk(opts: {
  inserted: number;
  updated: number;
  skipped: number;
  message?: string;
}) {
  const tituloProceso = opts.message || "Importación procesada";
  return Swal.fire({
    title: "Importación creada exitosamente",
    html: `${tituloProceso} — Insertados: <strong>${opts.inserted}</strong> • Actualizados: <strong>${opts.updated}</strong> • Omitidos: <strong>${opts.skipped}</strong>.<br/>Clave inicial = número de documento.`,
    icon: "success",
    confirmButtonText: "Aceptar",
    confirmButtonColor: ADMIN_PALETTE.confirm,
    allowOutsideClick: false,
    customClass: { container: "swal-importacion" },
  });
}

export function ResumenImportacion({
  processed,
  onVerDetalle,
}: {
  processed: FilaProcesada[];
  onVerDetalle: () => void;
}) {
  if (processed.length === 0) return null;
  const t = contar(processed);
  return (
    <div className="mb-3">
      <div className="import-resumen">
        <div className="import-kpi import-kpi--ok">
          <small>Insertados</small>
          <strong>{t.inserted}</strong>
        </div>
        <div className="import-kpi import-kpi--upd">
          <small>Actualizados</small>
          <strong>{t.updated}</strong>
        </div>
        <div className="import-kpi import-kpi--skip">
          <small>Omitidos</small>
          <strong>{t.skipped}</strong>
        </div>
      </div>
      <div className="import-resumen-actions">
        <Button variant="outline-success" size="sm" onClick={onVerDetalle}>
          Ver detalle ({processed.length})
        </Button>
      </div>
    </div>
  );
}

export function ResultadosImportacionModal({
  show,
  onHide,
  processed,
}: {
  show: boolean;
  onHide: () => void;
  processed: FilaProcesada[];
}) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const t = contar(processed);

  useEffect(() => {
    if (show) setFiltro("todos");
  }, [show]);
  const filas = useMemo(() => {
    if (filtro === "todos") return processed;
    return processed.filter((f) => f.status === filtro);
  }, [processed, filtro]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Resultado de la carga</Modal.Title>
      </Modal.Header>
      <div className="import-filtros">
        {(
          [
            ["todos", `Todos (${processed.length})`],
            ["inserted", `Insertados (${t.inserted})`],
            ["updated", `Actualizados (${t.updated})`],
            ["skipped", `Omitidos (${t.skipped})`],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={filtro === id ? "success" : "outline-secondary"}
            onClick={() => setFiltro(id)}
          >
            {label}
          </Button>
        ))}
      </div>
      <Modal.Body className="p-0">
        {filas.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">No hay filas en este filtro.</p>
        ) : (
          <div className="import-tabla-modal">
            <Table hover size="sm" className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Correo</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((p, i) => {
                  const nombre =
                    `${p.Nombre || ""} ${p.Apellidos || ""}`.trim() || "—";
                  return (
                    <tr key={i}>
                      <td>{nombre}</td>
                      <td>{String(p["Número de Documento"] || "—")}</td>
                      <td>{String(p["Correo Electrónico"] || "—")}</td>
                      <td>
                        <Badge bg={badgeDe(String(p.status))} pill>
                          {ETIQUETA[String(p.status)] || String(p.status || "—")}
                        </Badge>
                        {p.motivo ? (
                          <div className="small text-muted">{String(p.motivo)}</div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
