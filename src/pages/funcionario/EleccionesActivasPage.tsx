import { Container, Button } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { comoLista } from "../../utils/comoLista";
import { adminTableStyles } from "../../theme/adminTableStyles";
import {
  DetalleFilaModal,
  LupaDetalle,
  textoCorto,
} from "../../components/tabla/detalleTabla";
import { MiniGraficas, contarPor } from "../../components/graficas/MiniGraficas";
import { FiltroCentroRed } from "../../components/dashboard/FiltroCentroRed";
import { useFiltroCentroRed } from "../../hooks/useCatalogoCentros";

interface Aprendiz {
  nombres: string;
  apellidos: string
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
  idcentroFormacion?: number;
  idcentro_formacion?: number;
  centroFormacioncol?: string;
  idregional?: number;
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

function textoDe(row: Record<string, unknown>, ...claves: string[]) {
  for (const clave of claves) {
    const valor = row[clave];
    if (valor == null) continue;
    const texto = String(valor).trim();
    if (texto && texto !== "null" && texto !== "undefined") return texto;
  }
  return undefined;
}

/** Une las listas que manda el back para no perder elecciones recién creadas. */
function filasDeEleccion(payload: unknown): Record<string, unknown>[] {
  const listas: unknown[][] = [];
  const recoger = (valor: unknown, profundidad: number) => {
    if (profundidad > 2 || valor == null) return;
    if (Array.isArray(valor)) {
      listas.push(valor);
      return;
    }
    if (typeof valor !== "object") return;
    const o = valor as Record<string, unknown>;
    for (const clave of ["data", "elecciones", "eleccionesActivas", "rows"]) {
      recoger(o[clave], profundidad + 1);
    }
  };
  recoger(payload, 0);

  const visto = new Set<number>();
  const filas: Record<string, unknown>[] = [];
  for (const lista of listas) {
    for (const item of lista) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const id = Number(row.ideleccion ?? row.idEleccion ?? row.id);
      if (id && visto.has(id)) continue;
      if (id) visto.add(id);
      filas.push(row);
    }
  }
  return filas;
}

function mapearEleccion(
  row: Record<string, unknown>,
  centrosPorId: Map<number, CentroRed>,
  regionalesPorId: Map<number, string>
): Eleccion {
  const anidado = row.centro as Record<string, unknown> | undefined;
  const idCentro =
    Number(
      row.idcentroFormacion ??
        row.idcentro_formacion ??
        anidado?.idcentroFormacion ??
        anidado?.idcentro_formacion
    ) || undefined;
  const centroInfo = idCentro ? centrosPorId.get(idCentro) : undefined;
  const centroEnFila = etiquetaLugar(row.centro);
  const regionalEnFila = etiquetaLugar(row.regional);

  return {
    ideleccion: Number(row.ideleccion ?? row.idEleccion ?? row.id) || 0,
    titulo: String(row.titulo ?? row.nombre ?? "").trim(),
    centro:
      centroEnFila !== "—"
        ? centroEnFila
        : centroInfo?.centroFormacioncol ?? (idCentro ? String(idCentro) : "—"),
    regional:
      regionalEnFila !== "—"
        ? regionalEnFila
        : (centroInfo?.idregional
            ? regionalesPorId.get(centroInfo.idregional)
            : undefined) ?? "—",
    jornada: (row.jornada as string | null) ?? null,
    fechaInicio: textoDe(row, "fechaInicio", "fecha_inicio") ?? "",
    fechaFin: textoDe(row, "fechaFin", "fecha_fin") ?? "",
    horaInicio: textoDe(row, "horaInicio", "hora_inicio"),
    horaFin: textoDe(row, "horaFin", "hora_fin"),
    estado: textoDe(row, "estado"),
    idcentroFormacion: idCentro,
    createdAt: textoDe(row, "createdAt", "created_at", "updatedAt", "updated_at"),
  };
}

function aMillis(valor?: string) {
  if (!valor) return NaN;
  const normalizado = valor.includes("T") ? valor : valor.replace(" ", "T");
  return new Date(normalizado).getTime();
}

function esEleccionVigente(row: Eleccion) {
  const estado = (row.estado || "").toLowerCase();
  if (
    ["cerrada", "cerrado", "finalizada", "finalizado", "inactiva", "inactivo"].includes(
      estado
    )
  ) {
    return false;
  }
  const fin = row.horaFin || row.fechaFin;
  if (!fin) return true;
  const cierre = aMillis(fin);
  return Number.isNaN(cierre) || Date.now() <= cierre;
}

function claveReciente(row: Eleccion) {
  const creado = aMillis(row.createdAt);
  if (!Number.isNaN(creado) && creado > 0) return creado;
  return 0;
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
  const {
    regionales,
    centros,
    centrosFiltrados,
    idRegional,
    idCentro,
    centroElegido,
    elegirRegional,
    elegirCentro,
  } = useFiltroCentroRed(esRed);
  const centroConsulta = esRed ? idCentro : Number(user?.centroFormacion) || 0;

  const loadData = useCallback(async () => {
    if (!user || (!esRed && !user.centroFormacion)) {
      setEleccionActiva([]);
      setLoading(false);
      return;
    }
    if (esRed && !centroConsulta) {
      setEleccionActiva([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const centrosPorId = new Map<number, CentroRed>();
      const regionalesPorId = new Map<number, string>();
      centros.forEach((c) => {
        centrosPorId.set(c.id, {
          idcentroFormacion: c.id,
          centroFormacioncol: c.nombre,
          idregional: c.idRegional,
        });
      });
      regionales.forEach((r) => regionalesPorId.set(r.id, r.nombre));

      const respuestas = await Promise.allSettled([
        api.get(`/api/eleccion/traerTodas/${centroConsulta}`),
        api.get(`/api/eleccionPorCentro/${centroConsulta}`),
      ]);
      const combinadas: Record<string, unknown>[] = [];
      for (const r of respuestas) {
        if (r.status !== "fulfilled") continue;
        combinadas.push(...filasDeEleccion(r.value.data));
      }

      const lista = filasDeEleccion(combinadas)
        .map((row) => mapearEleccion(row, centrosPorId, regionalesPorId))
        .filter((row) => Number.isFinite(row.ideleccion) && row.ideleccion > 0);

      setEleccionActiva(ordenarElecciones(lista));
    } catch (error) {
      console.error("Error al cargar las votaciones:", error);
      setEleccionActiva([]);
    } finally {
      setLoading(false);
    }
  }, [esRed, user, centroConsulta, centros, regionales]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
      setCandidatos(comoLista<Candidato>(res.data));
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
            title="Ver candidatos / escrutinio"
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

  const eleccionesFiltradas = useMemo(
    () =>
      ordenarElecciones(
        eleccionActiva.filter((eleccion) =>
          [eleccion?.titulo, etiquetaLugar(eleccion?.centro), etiquetaLugar(eleccion?.regional)]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query)
        )
      ),
    [eleccionActiva, query]
  );

  return (
    <Container className="my-4 px-3 admin-page">
      {esRed ? (
        <>
          <h3 className="fw-bold">
            Elecciones por <span className="app-accent">centro</span>
          </h3>
          <p className="text-muted">
            {centroElegido
              ? `Activas y cerradas de ${centroElegido.nombre}${
                  centroElegido.regional ? ` · ${centroElegido.regional}` : ""
                }.`
              : "Elige la regional y el centro de formación para ver sus elecciones y gráficas."}
          </p>
          <FiltroCentroRed
            regionales={regionales}
            centros={centrosFiltrados}
            idRegional={idRegional}
            idCentro={idCentro}
            onRegional={(id) => {
              elegirRegional(id);
              setBuscador("");
              setEleccionActiva([]);
            }}
            onCentro={(id) => {
              elegirCentro(id);
              setBuscador("");
            }}
          />
        </>
      ) : (
        <>
          <h3 className="fw-bold">
            Elecciones de tu <span className="app-accent">centro</span>
          </h3>
          <p className="text-muted">
            Procesos de votación de tu centro de formación.
          </p>
          <h5 className="fw-semibold mt-3">
            {eleccionActiva.length > 0
              ? etiquetaLugar(eleccionActiva[0].centro)
              : "No hay centro asignado"}
          </h5>
        </>
      )}

      {(!esRed || idCentro) && (
        <>
      <MiniGraficas
        barras={{
          titulo: "Elecciones por jornada",
          datos: contarPor(eleccionActiva, (e) => e.jornada || "Sin jornada"),
          unidad: "elecciones",
        }}
        dona={{
          titulo: "Activas y cerradas",
          datos: [
            {
              etiqueta: "Activas",
              valor: eleccionActiva.filter(esEleccionVigente).length,
            },
            {
              etiqueta: "Cerradas",
              valor: eleccionActiva.filter((e) => !esEleccionVigente(e)).length,
            },
          ],
        }}
      />

      <Row className="align-items-center mt-3 mb-4">
        <Col md={8} lg={6} className="mb-2 mb-md-0">
          <Form.Control
            type="text"
            placeholder="Buscar elección por nombre..."
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
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 50]}
          paginationResetDefaultPage
          highlightOnHover
          striped
          customStyles={adminTableStyles}
          noDataComponent={
            loading
              ? "Cargando elecciones…"
              : "No hay elecciones registradas en este centro."
          }
        />
      </div>
        </>
      )}

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
          setShowEditarModal(false);
          void loadData();
        }}

      />
    </Container>
  );
}