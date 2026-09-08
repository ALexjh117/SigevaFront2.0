import { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import {
  FaArrowLeft,
  FaUsers,
  FaVoteYea,
  FaChartPie,
} from "react-icons/fa";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import { esAdministradorRed } from "../../utils/roles";
import { comoLista, etiquetaAnidada } from "../../utils/comoLista";
import { generarReporte } from "../../utils/generarReporte";
import { type Jornada } from "../../constants/jornada";
import { bloquesPorJornada } from "../../utils/resultadosJornada";
import { adminTableStyles } from "../../theme/adminTableStyles";
import { LupaDetalle, textoCorto } from "../../components/tabla/detalleTabla";
import { useResultadosEnVivo } from "../../hooks/useResultadosEnVivo";
import { PanelResultadosJornada } from "../../components/resultados/PanelResultadosJornada";
import "../../components/graficas/graficas.css";

type CentroOpcion = {
  id: number;
  nombre: string;
  regional: string;
};

type CentroFila = CentroOpcion & { total: number };

type EleccionOpcion = {
  ideleccion: number;
  titulo: string;
  centro: string;
  regional: string;
  idcentroFormacion?: number;
  jornada: string | null;
  fechaInicio: string;
  fechaFin: string;
  horaFin?: string;
};

type CentroRaw = {
  idcentroFormacion?: number;
  idcentro_formacion?: number;
  id?: number;
  centroFormacioncol?: string;
  centro_formacioncol?: string;
  idregional?: number;
  regional?: unknown;
};

type RegionalRaw = {
  idregional?: number;
  regional?: string;
};

function idCentroDe(row: Record<string, unknown>): number | undefined {
  const anidado = row.centro as Record<string, unknown> | undefined;
  const centroFormacion = row.centroFormacion as Record<string, unknown> | undefined;
  const n = Number(
    row.idcentroFormacion ??
      row.idcentro_formacion ??
      anidado?.idcentroFormacion ??
      anidado?.idcentro_formacion ??
      centroFormacion?.idcentroFormacion ??
      centroFormacion?.idcentro_formacion
  );
  return n || undefined;
}

function esEleccionVigente(row: EleccionOpcion) {
  const fin = row.horaFin || row.fechaFin;
  if (!fin) return true;
  const cierre = new Date(fin);
  return Number.isNaN(cierre.getTime()) || Date.now() <= cierre.getTime();
}

function irArriba() {
  requestAnimationFrame(() => {
    const main = document.querySelector(".main-content");
    if (main instanceof HTMLElement) {
      main.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function mapearEleccion(
  row: Record<string, unknown>,
  centrosPorId: Map<number, CentroOpcion>
): EleccionOpcion {
  const idCentro = idCentroDe(row);
  const centroInfo = idCentro ? centrosPorId.get(idCentro) : undefined;
  const centroFila = etiquetaAnidada(row.centro);

  return {
    ideleccion: Number(row.ideleccion),
    titulo: String(row.titulo ?? row.nombre ?? `Elección ${row.ideleccion}`).trim(),
    centro: centroFila || centroInfo?.nombre || (idCentro ? String(idCentro) : "Sin centro"),
    regional:
      etiquetaAnidada(row.regional) ||
      centroInfo?.regional ||
      "Sin regional",
    idcentroFormacion: idCentro,
    jornada: (row.jornada as string | null) ?? null,
    fechaInicio: String(row.fechaInicio ?? ""),
    fechaFin: String(row.fechaFin ?? ""),
    horaFin: row.horaFin ? String(row.horaFin) : undefined,
  };
}

export default function PanelMetricas() {
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);

  const [centros, setCentros] = useState<CentroOpcion[]>([]);
  const [elecciones, setElecciones] = useState<EleccionOpcion[]>([]);
  const [busquedaCentro, setBusquedaCentro] = useState("");
  const [idCentro, setIdCentro] = useState<number | null>(() =>
    esAdministradorRed(user?.perfil) ? null : user?.centroFormacion ?? null
  );
  const [idEleccion, setIdEleccion] = useState<string>("");
  const [cargandoLista, setCargandoLista] = useState(true);
  const [exportando, setExportando] = useState<Jornada | "todas" | "">("");
  const [habilitados, setHabilitados] = useState(0);
  const [centroNombre, setCentroNombre] = useState("—");
  const [inicio, setInicio] = useState("—");
  const [cierre, setCierre] = useState("—");
  const [titulo, setTitulo] = useState("Resultados de la elección");
  const { candidatos, meta, cargando, actualizado } = useResultadosEnVivo(
    idEleccion && idCentro ? Number(idEleccion) : null
  );

  useEffect(() => {
    const cargarLista = async () => {
      if (!esRed && !user?.centroFormacion) {
        setCargandoLista(false);
        return;
      }
      try {
        if (esRed) {
          const [resEle, resCentros, resRegionales] = await Promise.all([
            api.get("/api/eleccion").catch(() => api.get("api/eleccion/activas")),
            api.get("api/centrosFormacion/obtiene"),
            api.get("api/regionales"),
          ]);

          const regionalesPorId = new Map<number, string>();
          comoLista<RegionalRaw>(resRegionales.data).forEach((r) => {
            const id = Number(r.idregional);
            if (id && r.regional) regionalesPorId.set(id, r.regional);
          });

          const centrosPorId = new Map<number, CentroOpcion>();
          comoLista<CentroRaw>(resCentros.data).forEach((c) => {
            const id = Number(c.idcentroFormacion ?? c.idcentro_formacion ?? c.id);
            if (!id) return;
            const regionalObj = c.regional;
            const regional =
              etiquetaAnidada(regionalObj) ||
              (c.idregional ? regionalesPorId.get(Number(c.idregional)) : undefined) ||
              "Sin regional";
            centrosPorId.set(id, {
              id,
              nombre:
                c.centroFormacioncol ||
                c.centro_formacioncol ||
                `Centro ${id}`,
              regional,
            });
          });

          const listaEle = comoLista<Record<string, unknown>>(resEle.data).map((row) =>
            mapearEleccion(row, centrosPorId)
          );
          listaEle.forEach((e) => {
            if (!e.idcentroFormacion) return;
            if (!centrosPorId.has(e.idcentroFormacion)) {
              centrosPorId.set(e.idcentroFormacion, {
                id: e.idcentroFormacion,
                nombre: e.centro,
                regional: e.regional,
              });
            }
          });

          setCentros([...centrosPorId.values()]);
          setElecciones(listaEle);
        } else {
          const id = Number(user?.centroFormacion);
          const [res, resCentros] = await Promise.all([
            api.get(`/api/eleccion/traerTodas/${id}`).catch(() =>
              api.get(`api/eleccionPorCentro/${id}`)
            ),
            api.get("api/centrosFormacion/obtiene").catch(() => ({ data: [] })),
          ]);
          const centrosPorId = new Map<number, CentroOpcion>();
          comoLista<CentroRaw>(resCentros.data).forEach((c) => {
            const cid = Number(c.idcentroFormacion ?? c.idcentro_formacion ?? c.id);
            if (!cid) return;
            centrosPorId.set(cid, {
              id: cid,
              nombre: c.centroFormacioncol || c.centro_formacioncol || `Centro ${cid}`,
              regional: etiquetaAnidada(c.regional) || "—",
            });
          });
          const listaEle = comoLista<Record<string, unknown>>(res.data).map((row) => {
            const mapped = mapearEleccion(row, centrosPorId);
            return {
              ...mapped,
              idcentroFormacion: mapped.idcentroFormacion || id,
              centro:
                mapped.centro !== "Sin centro"
                  ? mapped.centro
                  : centrosPorId.get(id)?.nombre || `Centro ${id}`,
            };
          });
          const propio = centrosPorId.get(id);
          setCentros([
            {
              id,
              nombre: propio?.nombre || listaEle[0]?.centro || `Centro ${id}`,
              regional: propio?.regional || listaEle[0]?.regional || "—",
            },
          ]);
          setElecciones(listaEle);
          setIdCentro(id);
        }
      } catch (error) {
        console.error("Error al listar centros y elecciones:", error);
      } finally {
        setCargandoLista(false);
      }
    };
    void cargarLista();
  }, [esRed, user?.centroFormacion]);

  const conteoPorCentro = useMemo(() => {
    const mapa = new Map<number, number>();
    for (const e of elecciones) {
      if (!e.idcentroFormacion) continue;
      mapa.set(e.idcentroFormacion, (mapa.get(e.idcentroFormacion) || 0) + 1);
    }
    return mapa;
  }, [elecciones]);

  const centrosFiltrados = useMemo<CentroFila[]>(() => {
    const q = busquedaCentro.trim().toLowerCase();
    return centros
      .map((c) => ({ ...c, total: conteoPorCentro.get(c.id) || 0 }))
      .filter((c) => {
        if (!q) return true;
        return (
          c.nombre.toLowerCase().includes(q) ||
          c.regional.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return a.nombre.localeCompare(b.nombre, "es");
      });
  }, [centros, busquedaCentro, conteoPorCentro]);

  const columnasCentro: TableColumn<CentroFila>[] = [
    {
      name: "Centro",
      selector: (row) => row.nombre,
      sortable: true,
      grow: 2,
      cell: (row) => textoCorto(row.nombre, 42),
    },
    {
      name: "Regional",
      selector: (row) => row.regional,
      sortable: true,
      grow: 1,
      cell: (row) => textoCorto(row.regional, 28),
    },
    {
      name: "Elecciones",
      selector: (row) => row.total,
      sortable: true,
      width: "140px",
    },
    {
      name: "",
      width: "56px",
      center: true,
      cell: (row) => (
        <LupaDetalle
          titulo="Ver elecciones y gráficas de este centro"
          onClick={() => abrirCentro(row.id)}
        />
      ),
      ignoreRowClick: true,
    },
  ];

  const eleccionesDelCentro = useMemo(() => {
    if (!idCentro) return [];
    return elecciones
      .filter((e) => e.idcentroFormacion === idCentro)
      .sort((a, b) => {
        const vigente = Number(esEleccionVigente(b)) - Number(esEleccionVigente(a));
        if (vigente !== 0) return vigente;
        return b.ideleccion - a.ideleccion;
      });
  }, [elecciones, idCentro]);

  const centroActual = centros.find((c) => c.id === idCentro);

  useEffect(() => {
    if (!idCentro) {
      setIdEleccion("");
      return;
    }
    const sigue = eleccionesDelCentro.some((e) => String(e.ideleccion) === idEleccion);
    if (!sigue) {
      setIdEleccion(
        eleccionesDelCentro[0] ? String(eleccionesDelCentro[0].ideleccion) : ""
      );
    }
  }, [idCentro, eleccionesDelCentro, idEleccion]);

  useEffect(() => {
    const actual = elecciones.find((e) => String(e.ideleccion) === idEleccion);
    if (actual) {
      setTitulo(actual.titulo);
      setCentroNombre(actual.centro);
      setInicio(actual.fechaInicio || "—");
      setCierre(actual.fechaFin || "—");
    }
  }, [idEleccion, elecciones]);

  useEffect(() => {
    if (meta.titulo) setTitulo(meta.titulo);
    if (meta.fechaInicio) setInicio(meta.fechaInicio);
    if (meta.fechaFin) setCierre(meta.fechaFin);
    if (typeof meta.totalParticipantes === "number") {
      setHabilitados((prev) => (prev > 0 ? prev : meta.totalParticipantes || 0));
    }
  }, [meta]);

  useEffect(() => {
    const cargarHabilitados = async () => {
      if (!idCentro) {
        setHabilitados(0);
        return;
      }
      try {
        const habilitadosRes = await api.get(
          `api/aprendiz/disponibles/centros/${idCentro}`
        );
        setHabilitados(comoLista(habilitadosRes.data).length);
      } catch {
        setHabilitados(0);
      }
    };
    void cargarHabilitados();
  }, [idCentro]);

  const bloques = useMemo(
    () => bloquesPorJornada(candidatos, true),
    [candidatos]
  );

  const totalVotos = candidatos.reduce((s, c) => s + c.votos, 0);
  const participacion =
    habilitados > 0 ? Math.min(100, (totalVotos / habilitados) * 100) : 0;

  const abrirCentro = (id: number) => {
    setIdCentro(id);
    irArriba();
  };

  const volverACentros = () => {
    setIdCentro(null);
    setIdEleccion("");
    irArriba();
  };

  const baseReporte = {
    id: idEleccion,
    nombre: titulo,
    fechaInicio: inicio,
    fechaFin: cierre,
    estado: "En curso",
    centro: centroNombre,
    totalParticipantes: habilitados,
    participantes: [] as [],
  };

  const exportarJornada = async (jornadaPdf: Jornada) => {
    const bloque = bloques.find((b) => b.jornada === jornadaPdf);
    if (!bloque?.lista.length) return;
    setExportando(jornadaPdf);
    try {
      await generarReporte({
        ...baseReporte,
        jornada: jornadaPdf,
        totalVotos: bloque.totalVotos,
        candidatos: bloque.lista,
      });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    } finally {
      setExportando("");
    }
  };

  const exportarTodas = async () => {
    if (!candidatos.length) return;
    setExportando("todas");
    try {
      await generarReporte({
        ...baseReporte,
        jornada: "Mañana, Tarde y Noche",
        totalVotos,
        candidatos,
      });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    } finally {
      setExportando("");
    }
  };

  return (
    <div className="admin-page admin-page--resultados">
      <Container className="px-0">
        {esRed && !idCentro ? (
          <>
            <h3 className="fw-bold">Resultados por centro</h3>
            <p className="text-muted">
              Elige el centro para ver el escrutinio en vivo de sus elecciones.
              Luego podrás escoger la elección y la jornada.
            </p>

            <Row className="mb-3">
              <Col sm={6}>
                <Form.Control
                  type="text"
                  placeholder="Buscar por centro o regional..."
                  value={busquedaCentro}
                  onChange={(e) => setBusquedaCentro(e.target.value)}
                />
              </Col>
            </Row>

            <div className="admin-table-shell mb-2">
              <DataTable
                columns={columnasCentro}
                data={centrosFiltrados}
                progressPending={cargandoLista}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 15, 25, 50]}
                paginationComponentOptions={{
                  rowsPerPageText: "Filas por página",
                  rangeSeparatorText: "de",
                }}
                highlightOnHover
                pointerOnHover
                striped
                customStyles={adminTableStyles}
                onRowClicked={(row) => abrirCentro(row.id)}
                noDataComponent="Ningún centro coincide con esa búsqueda."
              />
            </div>
            <small className="text-muted">
              {cargandoLista
                ? "Cargando centros…"
                : `${centrosFiltrados.length} de ${centros.length} centros`}
            </small>
          </>
        ) : (
          <>
            {esRed && (
              <Button
                variant="outline-secondary"
                size="sm"
                className="mb-3"
                onClick={volverACentros}
              >
                <FaArrowLeft className="me-2" />
                Volver a centros
              </Button>
            )}

            <h3 className="fw-bold">{centroActual?.nombre || centroNombre}</h3>
            <p className="text-muted">
              {centroActual?.regional ? `${centroActual.regional} · ` : ""}
              Elige la elección y luego la jornada (Mañana, Tarde o Noche) para
              ver fotos, votos y porcentajes en tiempo real.
            </p>

            {eleccionesDelCentro.length === 0 ? (
              <p className="text-muted">
                Este centro aún no tiene elecciones registradas.
              </p>
            ) : (
              <>
                <Form.Group className="mb-4" style={{ maxWidth: 480 }}>
                  <Form.Label className="fw-semibold">Elección</Form.Label>
                  <Form.Select
                    value={idEleccion}
                    onChange={(e) => setIdEleccion(e.target.value)}
                  >
                    {eleccionesDelCentro.map((e) => (
                      <option key={e.ideleccion} value={e.ideleccion}>
                        {e.titulo || `Elección ${e.ideleccion}`}
                        {esEleccionVigente(e) ? " · Activa" : " · Cerrada"}
                        {e.jornada ? ` · ${e.jornada}` : ""}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row className="g-3 mb-4 escrutinio-kpis">
                  <Col md={true}>
                    <div className="grafica-card grafica-kpi escrutinio-kpi escrutinio-kpi--habilitados">
                      <div className="escrutinio-kpi-icon">
                        <FaUsers />
                      </div>

                      <div className="escrutinio-kpi-info">
                        <small>Habilitados del centro</small>
                        <p>{habilitados.toLocaleString("es-CO")}</p>
                      </div>
                    </div>
                  </Col>

                  <Col md={true}>
                    <div className="grafica-card grafica-kpi escrutinio-kpi escrutinio-kpi--votos">
                      <div className="escrutinio-kpi-icon">
                        <FaVoteYea />
                      </div>

                      <div className="escrutinio-kpi-info">
                        <small>Votos emitidos</small>
                        <p>{totalVotos.toLocaleString("es-CO")}</p>
                      </div>
                    </div>
                  </Col>

                  <Col md={true}>
                    <div className="grafica-card grafica-kpi escrutinio-kpi escrutinio-kpi--participacion">
                      <div className="escrutinio-kpi-icon">
                        <FaChartPie />
                      </div>

                      <div className="escrutinio-kpi-info">
                        <small>Participación</small>
                        <p>
                          {participacion.toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  </Col>

                  <Col md={true}>
                    <div className="grafica-card grafica-kpi escrutinio-kpi escrutinio-kpi--candidatos">
                      <div className="escrutinio-kpi-icon">
                        <FaUsers />
                      </div>

                      <div className="escrutinio-kpi-info">
                        <small>Candidatos</small>
                        <p>{candidatos.length}</p>
                      </div>
                    </div>
                  </Col>
                </Row>

                <p className="text-muted small mb-3">
                  {titulo} · {inicio} — {cierre}
                  {cargando ? " · Cargando…" : ""}
                </p>

                <PanelResultadosJornada
                  key={idEleccion}
                  candidatos={candidatos}
                  nombreEleccion={titulo}
                  centro={centroNombre}
                  cargando={cargando}
                  actualizado={actualizado}
                  exportando={exportando}
                  onPdfJornada={exportarJornada}
                  onPdfTodas={exportarTodas}
                />
              </>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
