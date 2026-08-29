import { Container, Button } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth/auth.context";
import { api } from "../../api";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import EleccionDetalleModal from "../../components/EleccionDetalleModal";
import { FiUserPlus, FiEdit, FiEye } from "react-icons/fi";
import { Row, Col, Form } from "react-bootstrap";
import EleccionEditarModal from "../../components/EleccionEditarModal";
import { esAdministradorRed } from "../../utils/roles";
import { adminTableStyles } from "../../theme/adminTableStyles";
import {
  DetalleFilaModal,
  LupaDetalle,
  textoCorto,
} from "../../components/tabla/detalleTabla";
import { SigevaName } from "../../components/landing/SigevaMark";

interface Aprendiz {
  nombres: string;
  apellidos: string
}

interface Candidato {
  idcandidatos: string;
  numeroTarjeton: string;
  foto: string;
  aprendiz: Aprendiz;
}

interface Eleccion {
  ideleccion: number;
  titulo: string;
  regional: string;
  centro: string;
  jornada: string | null;
  fechaInicio: string;
  fechaFin: string;
  horaInicio?: string;
  horaFin?: string;
  estado?: string;
  idcentroFormacion?: number;
  createdAt?: string;
}

interface CentroRed {
  idcentroFormacion: number;
  centroFormacioncol: string;
  idregional: number;
}

interface RegionalRed {
  idregional: number;
  regional: string;
}

function etiquetaLugar(valor: unknown) {
  if (!valor) return "—";
  if (typeof valor === "string") return valor;
  if (typeof valor === "object") {
    const o = valor as Record<string, unknown>;
    return String(
      o.centroFormacioncol || o.regional || o.nombre || o.centro || "—"
    );
  }
  return "—";
}

function comoLista<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data as T[];
    if (Array.isArray(o.elecciones)) return o.elecciones as T[];
    if (Array.isArray(o.eleccionesActivas)) return o.eleccionesActivas as T[];
  }
  return [];
}

function mapearEleccion(
  row: Record<string, unknown>,
  centrosPorId: Map<number, CentroRed>,
  regionalesPorId: Map<number, string>
): Eleccion {
  const idCentro = Number(row.idcentroFormacion ?? row.idcentro_formacion) || undefined;
  const centroInfo = idCentro ? centrosPorId.get(idCentro) : undefined;
  const centroEnFila = etiquetaLugar(row.centro);
  const regionalEnFila = etiquetaLugar(row.regional);

  return {
    ideleccion: Number(row.ideleccion),
    titulo: String(row.titulo ?? row.nombre ?? "").trim(),
    centro:
      centroEnFila !== "—"
        ? centroEnFila
        : centroInfo?.centroFormacioncol ?? (idCentro ? String(idCentro) : "—"),
    regional:
      regionalEnFila !== "—"
        ? regionalEnFila
        : (centroInfo ? regionalesPorId.get(centroInfo.idregional) : undefined) ?? "—",
    jornada: (row.jornada as string | null) ?? null,
    fechaInicio: String(row.fechaInicio ?? ""),
    fechaFin: String(row.fechaFin ?? ""),
    horaInicio: row.horaInicio ? String(row.horaInicio) : undefined,
    horaFin: row.horaFin ? String(row.horaFin) : undefined,
    idcentroFormacion: idCentro,
    createdAt: row.createdAt ? String(row.createdAt) : undefined,
  };
}

function esEleccionVigente(row: Eleccion) {
  const fin = row.horaFin || row.fechaFin;
  if (!fin) return true;
  const cierre = new Date(fin);
  return Number.isNaN(cierre.getTime()) || Date.now() <= cierre.getTime();
}

function claveReciente(row: Eleccion) {
  if (row.createdAt) {
    const t = new Date(row.createdAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return row.ideleccion;
}

function ordenarElecciones(lista: Eleccion[]) {
  return [...lista].sort((a, b) => {
    const vigente = Number(esEleccionVigente(b)) - Number(esEleccionVigente(a));
    if (vigente !== 0) return vigente;
    const reciente = claveReciente(b) - claveReciente(a);
    if (reciente !== 0) return reciente;
    return b.ideleccion - a.ideleccion;
  });
}

export default function EleccionesActivasPage() {
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [selectedEleccion, setSelectedEleccion] = useState<Eleccion | null>(null);
  const [eleccionActiva, setEleccionActiva] = useState<Eleccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCandidatos, setLoadingCandidatos] = useState(false);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [buscador, setBuscador] = useState("");
  const [ficha, setFicha] = useState<Eleccion | null>(null);
  const { user } = useAuth();
  const navegar = useNavigate();
  const esRed = esAdministradorRed(user?.perfil);

  const loadData = async () => {
    if (!esRed && !user?.centroFormacion) return;
    try {
      if (esRed) {
        const [resEle, resCentros, resRegionales] = await Promise.all([
          api.get("/api/eleccion").catch(() => api.get("api/eleccion/activas")),
          api.get("api/centrosFormacion/obtiene"),
          api.get("api/regionales"),
        ]);
        const centrosPorId = new Map<number, CentroRed>();
        comoLista<CentroRed>(resCentros.data).forEach((c) => {
          const id = Number(c.idcentroFormacion);
          if (id) centrosPorId.set(id, c);
        });
        const regionalesPorId = new Map<number, string>();
        comoLista<RegionalRed>(resRegionales.data).forEach((r) => {
          const id = Number(r.idregional);
          if (id) regionalesPorId.set(id, r.regional);
        });
        setEleccionActiva(
          ordenarElecciones(
            comoLista<Record<string, unknown>>(resEle.data).map((row) =>
              mapearEleccion(row, centrosPorId, regionalesPorId)
            )
          )
        );
      } else {
        const idCentro = user?.centroFormacion;
        if (!idCentro) return;
        const res = await api.get(`/api/eleccion/traerTodas/${idCentro}`);
        setEleccionActiva(
          ordenarElecciones(
            comoLista<Record<string, unknown>>(res.data).map((row) =>
              mapearEleccion(row, new Map(), new Map())
            )
          )
        );
      }
    } catch (error) {
      console.error("Error al cargar las votaciones:", error);
      setEleccionActiva([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [user?.centroFormacion, esRed]);

  // 🔹 Formatear fecha + hora en la misma celda
  const formatDateTime = (fecha: string, hora?: string) => {
    if (!fecha) return "Fecha no disponible";

    const date = hora ? new Date(hora) : new Date(fecha);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  const handleDetalles = async (eleccion: Eleccion) => {
    if (loadingCandidatos) return;
    setSelectedEleccion(eleccion);
    setShowDetalleModal(true);
    setLoadingCandidatos(true);
    try {
      const res = await api.get(`/api/candidatos/listar/${eleccion.ideleccion}`);
      setCandidatos(res.data.data);
    } catch (error) {
      console.error("Error al cargar los candidatos:", error);
      setCandidatos([]);
    } finally {
      setLoadingCandidatos(false);
    }
  };

  const estadoDe = (row: Eleccion) =>
    esEleccionVigente(row) ? "Activa" : "Cerrada";

  const columns: TableColumn<Eleccion>[] = [
    {
      name: "Título",
      selector: (row) => row.titulo,
      sortable: true,
      grow: 2,
      cell: (row) => textoCorto(row.titulo, 34),
    },
    ...(esRed
      ? [
          {
            name: "Centro",
            selector: (row: Eleccion) => etiquetaLugar(row.centro),
            sortable: true,
            grow: 2,
            cell: (row: Eleccion) => textoCorto(etiquetaLugar(row.centro), 36),
          } satisfies TableColumn<Eleccion>,
        ]
      : []),
    {
      name: "Estado",
      width: "110px",
      cell: (row) => {
        const estado = estadoDe(row);
        return (
          <span
            style={{
              color: estado === "Activa" ? "green" : "orange",
              fontWeight: "bold",
            }}
          >
            {estado}
          </span>
        );
      },
    },
    {
      name: "",
      width: "56px",
      center: true,
      cell: (row) => <LupaDetalle onClick={() => setFicha(row)} />,
      ignoreRowClick: true,
    },
    {
      name: "",
      width: "128px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <Button
            size="sm"
            variant="outline-primary"
            title="Candidatos"
            onClick={() => navegar(`/gestion-candidatos/${row.ideleccion}`)}
          >
            <FiUserPlus />
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            title="Editar"
            onClick={() => {
              setSelectedEleccion(row);
              setShowEditarModal(true);
            }}
          >
            <FiEdit />
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            title="Ver candidatos / PDF"
            onClick={() => handleDetalles(row)}
          >
            <FiEye />
          </Button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const query = (buscador ?? "").toLowerCase();

  const eleccionesFiltradas = eleccionActiva.filter((eleccion) =>
    [eleccion?.titulo, etiquetaLugar(eleccion?.centro), etiquetaLugar(eleccion?.regional)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query)
  );

  return (
    <Container className={`my-4 px-3 ${esRed ? "admin-page" : ""}`}>
      {esRed ? (
        <>
          <h3 className="fw-bold">
            Elecciones de la <span className="app-accent">red</span>
          </h3>
          <p className="text-muted">
            Procesos de votación de todos los centros de formación.
          </p>
        </>
      ) : (
        <>
          <h3 className="fw-bold">Bienvenido</h3>
          <p className="text-muted">
            Aquí tiene un resumen de la actividad reciente en <SigevaName />.
          </p>
          <h5 className="fw-semibold mt-4">Resumen de Elecciones Activas</h5>
          <h3 className="fw-bold ">
            {eleccionActiva.length > 0
              ? `Centro de formación ${eleccionActiva[0].centro}`
              : "No hay centro asignado"}
          </h3>
        </>
      )}

      <Row className="align-items-center mt-3 mb-4">
        <Col md={8} lg={6} className="mb-2 mb-md-0">
          <Form.Control
            type="text"
            placeholder={
              esRed
                ? "Buscar por título, centro o regional..."
                : "Buscar elección por nombre..."
            }
            value={buscador}
            onChange={(e) => setBuscador(e.target.value)}
          />
        </Col>
        <Col md={4} lg={6} className="d-flex justify-content-md-end">
          {!esRed && (
            <Button className="btn-gradient" onClick={() => navegar("/nueva-eleccion")}>
              <FaPlusCircle className="me-2" /> Crear Elección
            </Button>
          )}
        </Col>
      </Row>

      <div className={`mt-4 ${esRed ? "admin-table-shell" : ""}`}>
        <DataTable
          columns={columns}
          data={eleccionesFiltradas}
          progressPending={loading}
          pagination
          highlightOnHover
          striped
          customStyles={esRed ? adminTableStyles : undefined}
          noDataComponent={
            esRed
              ? "No hay elecciones registradas en la red."
              : "No hay elecciones activas en este momento."
          }
        />
      </div>

      <DetalleFilaModal
        show={!!ficha}
        onHide={() => setFicha(null)}
        titulo="Información de la elección"
        campos={
          ficha
            ? [
                { etiqueta: "Título", valor: ficha.titulo },
                { etiqueta: "Centro", valor: etiquetaLugar(ficha.centro) },
                { etiqueta: "Regional", valor: etiquetaLugar(ficha.regional) },
                { etiqueta: "Jornada", valor: ficha.jornada },
                {
                  etiqueta: "Fecha de inicio",
                  valor: formatDateTime(ficha.fechaInicio, ficha.horaInicio),
                },
                {
                  etiqueta: "Fecha de cierre",
                  valor: formatDateTime(ficha.fechaFin, ficha.horaFin),
                },
                { etiqueta: "Estado", valor: estadoDe(ficha) },
              ]
            : []
        }
      />

      <EleccionDetalleModal
        show={showDetalleModal}
        onClose={() => {
          setShowDetalleModal(false);
          setCandidatos([]);
        }}
        eleccion={selectedEleccion}
        candidatos={candidatos}
      />

      <EleccionEditarModal
        show={showEditarModal}
        onHide={() => setShowEditarModal(false)}
        eleccion={selectedEleccion as any}
        onUpdated={() => {
          void loadData();
        }}

      />
    </Container>
  );
}
