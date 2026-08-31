/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import * as XLSX from "xlsx";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import ProgressBar from "react-bootstrap/ProgressBar";
import Spinner from "react-bootstrap/Spinner";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import type { User, Gestor } from "../../context/auth/types/authTypes";
import { esRolDeCentro } from "../../utils/roles";
import Modal from "react-bootstrap/Modal";
import { Toast } from "react-bootstrap";
import ToastContainer from "react-bootstrap/ToastContainer";
import {
  ResumenImportacion,
  ResultadosImportacionModal,
  avisarImportacionOk,
} from "../../components/importacion/ResultadosImportacion";

// listo para explicar el codigoooooo
type FilaExcel = {
  [k: string]: any;
};

const UPLOAD_URL = "/api/aprendices/importarExcel";

export default function CargarAprendices() {
  const { user, isAuthenticated } = useAuth();
  const puedeImportar = isAuthenticated && esRolDeCentro((user as User)?.perfil);
  const userId = puedeImportar ? (user as Gestor).id : null;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FilaExcel[]>([]);
  const [allData, setAllData] = useState<FilaExcel[] | null>(null);
  const [programaDetectado, setProgramaDetectado] = useState("");
  const [fichaDetectada, setFichaDetectada] = useState("");
  const [msg, setMsg] = useState<{
    type: "success" | "danger" | "warning";
    text: string;
  } | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [skippedAprendices, setSkippedAprendices] = useState<FilaExcel[]>([]);
  const [showSkippedModal, setShowSkippedModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processed, setProcessed] = useState<FilaExcel[]>([]);
  const [showProcessedModal, setShowProcessedModal] = useState(false);

  // helper: quita tildes, pone en minúscula y limpia espacios
  const normalize = (s: any) =>
    String(s || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "") // quita acentos
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  // normaliza keys de un objeto (ej: "Correo Electrónico" -> "correo electronico")
  const normalizeKeys = (row: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      const nk = normalize(k);
      out[nk] = row[k];
    });
    return out;
  };

  const leerExcelParaPreview = async (archivo: File) => {
    setMsg(null);
    setPreview([]);
    setProgramaDetectado("");
    setFichaDetectada("");

    const buffer = await archivo.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    const c2 = sheet?.["C2"]?.v?.toString().trim() || "";
    const fichaLimpia = c2.replace(/–/g, "-");
    const partes = fichaLimpia.split(" - ");
    const numeroGrupo = partes[0]?.trim() || "";
    const nombrePrograma = partes[1]?.trim() || "";
    setFichaDetectada(numeroGrupo);
    setProgramaDetectado(nombrePrograma);

    const data = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      range: 4,
      defval: "",
    });

    // Guarda toda la data para validaciones posteriores
    setAllData(data);

    if (data.length > 0) {
    
      setPreview(data.slice(0, 20));
    } else {
      setPreview([]);
    }

    return data;
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setUploadPct(0);
    setAllData(null);
    setProcessed([]);
    setShowProcessedModal(false);
    if (!f) {
      setPreview([]);
      return;
    }
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls"].includes(ext || "")) {
      setMsg({ type: "danger", text: "El archivo debe ser .xlsx o .xls" });
      setPreview([]);
      return;
    }
    try {
      await leerExcelParaPreview(f);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "danger",
        text: "No se pudo leer el Excel para la vista previa.",
      });
    }
  };

  // onSubmit ahora acepta `force` para obligar la subida incluso si hay omitidos
  const onSubmit = async (force = false) => {
    if (!puedeImportar) {
      setMsg({
        type: "warning",
        text: "Solo el funcionario o el admin de centro pueden importar aprendices de su sede.",
      });
      setShowToast(true);
      return;
    }
    if (!userId) {
      setMsg({ type: "danger", text: "No se encontró el userId en sesión." });
      setShowToast(true);
      return;
    }
    if (!file) {
      setMsg({ type: "danger", text: "Selecciona un archivo Excel primero." });
      setShowToast(true);
      return;
    }

    // usa allData si está disponible (guardada en la lectura para preview), sino lee el archivo ahora
    let dataToValidate: Record<string, any>[] = [];
    if (allData && allData.length > 0) {
      dataToValidate = allData;
    } else {
      // leer todo desde el archivo (fallback)
      try {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        dataToValidate = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
          range: 4,
          defval: "",
        });
      } catch (err) {
        console.error(err);
        setMsg({
          type: "danger",
          text: "No se pudo leer el archivo para validar.",
        });
        setShowToast(true);
        return;
      }
    }

    // normalizamos keys y valores para validar correctamente sin depender de acentos o mayúsculas
    const normalizedRows = dataToValidate.map((r) => normalizeKeys(r));

    const invalidos = normalizedRows.filter((fila) => {
      const email = normalize(
        fila["correo electronico"] || fila["correo"] || fila["email"] || ""
      );
      const doc = normalize(
        fila["numero de documento"] || fila["documento"] || ""
      );
      return !email || !doc;
    });

    // Mapea a un formato legible para mostrar en el modal (si quieres mantener claves originales, ajusta aquí)
    setSkippedAprendices(
      invalidos.map((r) => ({
        documento: r["numero de documento"] || r["documento"] || "—",
        correo: r["correo electronico"] || r["correo"] || r["email"] || "—",
        nombre: r["nombre"] || "—",
        apellidos: r["apellidos"] || "—",
      }))
    );

    if (invalidos.length > 0 && !force) {
      setShowSkippedModal(true);
      return; // Detiene subida hasta que el usuario confirme
    }

    const fd = new FormData();
    fd.append("excel", file);
    fd.append("userId", String(userId));

    setSubiendo(true);
    setMsg(null);
    setUploadPct(0);

    try {
      const res = await api.post(UPLOAD_URL, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (pe) => {
          if (!pe.total) return;
          const pct = Math.round((pe.loaded * 100) / pe.total);
          setUploadPct(pct);
        },
      });

      const resp = res?.data ?? {};
      const inserted: number = resp?.inserted ?? 0;
      const updated: number = resp?.updated ?? 0;
      const skippedCount: number = resp?.skipped ?? 0;
      const processedResp: FilaExcel[] = resp?.processed ?? [];
      setProcessed(processedResp);
      const texto = `${resp?.message || "Importación procesada"} — Insertados: ${inserted} • Actualizados: ${updated} • Omitidos: ${skippedCount}. Clave inicial = número de documento.`;
      setMsg({
        type: "success",
        text: texto,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      await avisarImportacionOk({
        inserted,
        updated,
        skipped: skippedCount,
        message: resp?.message,
      });
    } catch (err: any) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Error al importar aprendices. Revisa el formato del archivo y los campos requeridos.";
      setMsg({ type: "danger", text: apiMsg });
      setShowToast(true);
    } finally {
      setSubiendo(false);
      setShowSkippedModal(false);
    }
  };

  // Confirmación desde el modal principal (antes de subir) -> no fuerza
  const handleConfirmUpload = async () => {
    setShowConfirmModal(false);
    await onSubmit(false);
  };

  // Confirmación desde el modal de omitidos -> fuerza la subida
  const handleConfirmSkipped = async () => {
    setShowSkippedModal(false);
    setShowConfirmModal(false);
    await onSubmit(true);
  };

  return (
    <div>
      <Container className="mb-3">
        <h1 className="mb-2">Cargar aprendices</h1>
        <p className="text-muted mb-0">
          Sube el <strong>Reporte de Aprendices</strong> de Sofia Plus (.xls). La ficha y el
          programa salen de la celda C2. La contraseña inicial de cada aprendiz es su{" "}
          <strong>número de documento</strong>. Si se le olvida, usa Recuperar contraseña.
          La jornada <strong>no se elige aquí</strong>: la elige el aprendiz cuando entra.
        </p>

        {!puedeImportar && (
          <Alert variant="warning" className="mt-3">
            Debes iniciar sesión como <strong>funcionario o admin de centro</strong> para importar
            aprendices de tu sede
          </Alert>
        )}
        {puedeImportar && (
          <Alert variant="info" className="mt-3">
            Estos aprendices quedan en <strong>tu centro de formación</strong>. No eliges otra sede.
          </Alert>
        )}
        {msg && (
          <Alert variant={msg.type} className="mt-3">
            {msg.text}
          </Alert>
        )}
      </Container>

      <Container className="mb-4">
        <div className="import-toolbar">
          <Form.Group controlId="fileExcel" className="import-toolbar-field mb-0">
            <Form.Label>Archivo Excel</Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileChange}
              disabled={!puedeImportar || subiendo}
            />
          </Form.Group>
          <Button
            variant="success"
            onClick={() => setShowConfirmModal(true)}
            disabled={!puedeImportar || !file || subiendo}
          >
            {subiendo ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Subiendo…
              </>
            ) : (
              "Subir y procesar"
            )}
          </Button>
        </div>

        {(fichaDetectada || programaDetectado) && (
          <div className="mt-2">
            <small className="text-muted">
              <strong>Ficha detectada:</strong> {fichaDetectada || "—"} |{" "}
              <strong>Programa:</strong> {programaDetectado || "—"}
            </small>
          </div>
        )}

        {subiendo && (
          <div className="mt-3">
            <ProgressBar now={uploadPct} label={`${uploadPct}%`} animated />
          </div>
        )}

        <ResumenImportacion
          processed={processed}
          onVerDetalle={() => setShowProcessedModal(true)}
        />
      </Container>

      <Container className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="m-0 fs-5">Vista previa</h2>
          <small className="text-muted">
            {preview.length === 0
              ? "Elige un Excel para ver las primeras filas"
              : `${preview.length} primeras filas`}
          </small>
        </div>

        <div className="import-preview-scroll">
          <Table responsive size="sm" className="align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Correo</th>
                <th>Programa (C2)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {preview.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No hay datos para mostrar.
                  </td>
                </tr>
              ) : (
                preview.map((fila, i) => {
                  const nombre =
                    `${fila["Nombre"] || fila["nombre"] || ""} ${
                      fila["Apellidos"] || fila["apellidos"] || ""
                    }`.trim() || "—";
                  const doc = (
                    fila["Número de Documento"] ||
                    fila["numero de documento"] ||
                    fila["documento"] ||
                    "—"
                  ).toString();
                  const correo =
                    fila["Correo Electrónico"] ||
                    fila["correo electronico"] ||
                    fila["correo"] ||
                    fila["email"] ||
                    "—";
                  const estado = (fila["Estado"] || fila["estado"] || "")
                    .toString()
                    .trim();
                  const activo = estado.toLowerCase() === "activo";
                  return (
                    <tr key={i}>
                      <td>{nombre}</td>
                      <td>{doc}</td>
                      <td>{correo}</td>
                      <td>{programaDetectado || "—"}</td>
                      <td>
                        {estado ? (
                          <Badge bg={activo ? "success" : "secondary"} pill>
                            {estado}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Container>
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={
            msg?.type === "success"
              ? "success"
              : msg?.type === "danger"
              ? "danger"
              : "warning"
          }
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">
              {msg?.type === "success"
                ? "Éxito"
                : msg?.type === "danger"
                ? "Error"
                : "Aviso"}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{msg?.text}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title> ⚠️Atención</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">
            Recuerda que los aprendices que no estén en estado activo y en
            formación ,no podrán votar a menos de que se modifique su estado
            manualmente.
          </p>
          <p>
            El archivo debe ser el <strong>Reporte de Aprendices</strong> de Sofia Plus
            (ejemplo: <code>Reporte de Aprendices Ficha 2992857.xls</code>). No cambies C2 ni los
            nombres de columnas.
          </p>
          <p>
            La contraseña inicial será el <strong>número de documento</strong>. Quien la olvide usa
            Recuperar contraseña.
          </p>
          <ul>
            <li>
              Archivo seleccionado: <strong>{file?.name || "—"}</strong>
            </li>

            <li className="text-danger">
              Ten en cuenta que los aprendices seran enlazados segun tu centro
              de Formación
            </li>
            <li>
              Ficha detectada: <strong>{fichaDetectada || "—"}</strong>
            </li>
            <li>
              Programa detectado: <strong>{programaDetectado || "—"}</strong>
            </li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
            disabled={subiendo}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmUpload}
            disabled={subiendo}
          >
            {subiendo ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />{" "}
                Subiendo…
              </>
            ) : (
              "Confirmar y subir"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showSkippedModal}
        onHide={() => setShowSkippedModal(false)}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Aprendices Omitidos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {skippedAprendices.length === 0 ? (
            <p>No hay aprendices omitidos.</p>
          ) : (
            <Table responsive className="align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th>Documento</th>
                  <th>Correo</th>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                </tr>
              </thead>
              <tbody>
                {skippedAprendices.map((a, i) => (
                  <tr key={i}>
                    <td>{a.documento || "—"}</td>
                    <td>{a.correo || "—"}</td>
                    <td>{a.nombre || "—"}</td>
                    <td>{a.apellidos || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowSkippedModal(false)}
            disabled={subiendo}
          >
            Cerrar
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmSkipped}
            disabled={subiendo}
          >
            Confirmar y subir
          </Button>
        </Modal.Footer>
      </Modal>
      <ResultadosImportacionModal
        show={showProcessedModal}
        onHide={() => setShowProcessedModal(false)}
        processed={processed}
      />
    </div>
  );
}
