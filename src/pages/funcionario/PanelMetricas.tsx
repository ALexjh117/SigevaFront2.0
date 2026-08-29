import { useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import { esAdministradorRed } from "../../utils/roles";
import { comoLista, etiquetaAnidada } from "../../utils/comoLista";
import { GraficaBarras } from "../../components/graficas/GraficaBarras";
import { GraficaDona } from "../../components/graficas/GraficaDona";
import type { DatoGrafica } from "../../components/graficas/tipos";
import { generarReporte } from "../../utils/generarReporte";
import { adminTableStyles } from "../../theme/adminTableStyles";
import { LupaDetalle, textoCorto } from "../../components/tabla/detalleTabla";
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

type CandidatoResultado = {
  id: number;
  nombre: string;
  apellido: string;
  votos: number;
  porcentaje: number;
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

async function traerReporte(id: number) {
  try {
    const { data } = await api.get(`/reporte/eleccion/${id}`);
    return data;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 404) {
      const { data } = await api.get(`/api/reporte/eleccion/${id}`);
      return data;
    }
    throw err;
  }
}

function nombreCandidato(c: Record<string, unknown>) {
  const aprendiz = c.aprendiz as Record<string, unknown> | undefined;
  const nombres =
    etiquetaAnidada(c.nombres) ||
    etiquetaAnidada(aprendiz) ||
    [aprendiz?.nombres, aprendiz?.apellidos].filter(Boolean).join(" ") ||
    "Candidato";
  return nombres;
}

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
  const [cargando, setCargando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [habilitados, setHabilitados] = useState(0);
  const [candidatos, setCandidatos] = useState<CandidatoResultado[]>([]);
  const [jornada, setJornada] = useState("—");
  const [centroNombre, setCentroNombre] = useState("—");
  const [inicio, setInicio] = useState("—");
  const [cierre, setCierre] = useState("—");
  const [titulo, setTitulo] = useState("Estadísticas de la elección");

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
    return elecciones.filter((e) => e.idcentroFormacion === idCentro);
  }, [elecciones, idCentro]);

  const centroActual = centros.find((c) => c.id === idCentro);

  useEffect(() => {
    if (!idCentro) {
      setIdEleccion("");
      return;
    }
    const delCentro = elecciones.filter((e) => e.idcentroFormacion === idCentro);
    const sigue = delCentro.some((e) => String(e.ideleccion) === idEleccion);
    if (!sigue) {
      setIdEleccion(delCentro[0] ? String(delCentro[0].ideleccion) : "");
    }
  }, [idCentro, elecciones, idEleccion]);

  useEffect(() => {
    const cargarDetalle = async () => {
      if (!idEleccion || !idCentro) {
        setCandidatos([]);
        setCargando(false);
        return;
      }
      setCargando(true);
      const actual = elecciones.find((e) => String(e.ideleccion) === idEleccion);
      if (actual) {
        setTitulo(actual.titulo);
        setCentroNombre(actual.centro);
        setJornada(actual.jornada || "—");
        setInicio(actual.fechaInicio || "—");
        setCierre(actual.fechaFin || "—");
      }

      try {
        try {
          const habilitadosRes = await api.get(
            `api/aprendiz/disponibles/centros/${idCentro}`
          );
          setHabilitados(comoLista(habilitadosRes.data).length);
        } catch {
          setHabilitados(0);
        }

        let resultados: CandidatoResultado[] = [];
        try {
          const rep = await traerReporte(Number(idEleccion));
          const lista = comoLista<Record<string, unknown>>(rep?.candidatos ?? rep);
          resultados = lista.map((c) => {
            const votos = Number(c.votos || 0);
            const partes = nombreCandidato(c).split(" ");
            return {
              id: Number(c.idcandidatos ?? c.id ?? 0),
              nombre: partes[0] || nombreCandidato(c),
              apellido: partes.slice(1).join(" "),
              votos,
              porcentaje: 0,
            };
          });
          if (rep?.eleccion) {
            setTitulo(
              String(rep.eleccion.nombre ?? actual?.titulo ?? "Estadísticas de la elección")
            );
            if (rep.eleccion.fecha_inicio) setInicio(String(rep.eleccion.fecha_inicio));
            if (rep.eleccion.fecha_fin) setCierre(String(rep.eleccion.fecha_fin));
          }
          if (typeof rep?.totalParticipantes === "number") {
            setHabilitados((prev) => (prev > 0 ? prev : Number(rep.totalParticipantes)));
          }
        } catch {
          try {
            const candRes = await api.get(`/api/candidatos/listar/${idEleccion}`);
            const lista = comoLista<Record<string, unknown>>(candRes.data);
            resultados = lista.map((c) => {
              const partes = nombreCandidato(c).split(" ");
              return {
                id: Number(c.idcandidatos ?? 0),
                nombre: partes[0] || "Candidato",
                apellido: partes.slice(1).join(" "),
                votos: Number(c.votos || 0),
                porcentaje: 0,
              };
            });
          } catch {
            resultados = [];
          }
        }

        const totalVotos = resultados.reduce((s, c) => s + c.votos, 0);
        setCandidatos(
          resultados
            .map((c) => ({
              ...c,
              porcentaje: totalVotos > 0 ? (c.votos / totalVotos) * 100 : 0,
            }))
            .sort((a, b) => b.votos - a.votos)
        );
      } catch (error) {
        console.error("Error al cargar métricas:", error);
        setCandidatos([]);
      } finally {
        setCargando(false);
      }
    };

    void cargarDetalle();
  }, [idEleccion, idCentro, elecciones]);

  const totalVotos = useMemo(
    () => candidatos.reduce((s, c) => s + c.votos, 0),
    [candidatos]
  );
  const participacion =
    habilitados > 0 ? Math.min(100, (totalVotos / habilitados) * 100) : 0;

  const barras: DatoGrafica[] = candidatos.map((c) => ({
    etiqueta: `${c.nombre} ${c.apellido}`.trim(),
    valor: c.votos,
  }));
  const dona: DatoGrafica[] = candidatos.map((c) => ({
    etiqueta: `${c.nombre} ${c.apellido}`.trim(),
    valor: c.votos,
  }));

  const abrirCentro = (id: number) => {
    setIdCentro(id);
    irArriba();
  };

  const volverACentros = () => {
    setIdCentro(null);
    setIdEleccion("");
    setCandidatos([]);
    irArriba();
  };

  const exportar = async () => {
    setExportando(true);
    try {
      await generarReporte({
        id: idEleccion,
        nombre: titulo,
        fechaInicio: inicio,
        fechaFin: cierre,
        estado: "En curso",
        centro: centroNombre,
        jornada,
        totalVotos,
        totalParticipantes: habilitados,
        candidatos,
        participantes: [],
      });
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="admin-page">
      <Container className="px-0">
        {esRed && !idCentro ? (
          <>
            <h3 className="fw-bold">Estadísticas por centro</h3>
            <p className="text-muted">
              Busca el centro y ábrelo con la lupa. Las gráficas salen enseguida,
              sin bajar por la tabla.
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
              {eleccionesDelCentro.length}{" "}
              {eleccionesDelCentro.length === 1
                ? "elección en este centro"
                : "elecciones en este centro"}
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

                <Row className="g-3 mb-4">
                  <Col md>
                    <div className="grafica-card grafica-kpi">
                      <small>Habilitados del centro</small>
                      <p>{habilitados.toLocaleString("es-CO")}</p>
                    </div>
                  </Col>
                  <Col md>
                    <div className="grafica-card grafica-kpi">
                      <small>Votos emitidos</small>
                      <p>{totalVotos.toLocaleString("es-CO")}</p>
                    </div>
                  </Col>
                  <Col md>
                    <div className="grafica-card grafica-kpi">
                      <small>Participación</small>
                      <p>{participacion.toFixed(1)}%</p>
                    </div>
                  </Col>
                  <Col md>
                    <div className="grafica-card grafica-kpi">
                      <small>Candidatos</small>
                      <p>{candidatos.length}</p>
                    </div>
                  </Col>
                </Row>

                <p className="text-muted small mb-4">
                  {titulo} · Jornada {jornada} · {inicio} — {cierre}
                  {cargando ? " · Cargando…" : ""}
                </p>

                <div className="grafica-grid grafica-grid--2 mb-4">
                  <GraficaBarras
                    titulo="Votos por candidato"
                    datos={barras}
                    horizontal
                    unidad="votos"
                  />
                  <GraficaDona titulo="Distribución de votos" datos={dona} />
                </div>

                <div className="admin-table-shell mb-4">
                  <Table responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Candidato</th>
                        <th>Votos</th>
                        <th>Porcentaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidatos.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-muted">
                            No hay resultados para esta elección todavía.
                          </td>
                        </tr>
                      ) : (
                        candidatos.map((c) => (
                          <tr key={c.id || `${c.nombre}-${c.apellido}`}>
                            <td>
                              {c.nombre} {c.apellido}
                            </td>
                            <td className="fw-bold app-accent">{c.votos}</td>
                            <td>{c.porcentaje.toFixed(1)}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    onClick={() => void exportar()}
                    disabled={exportando || candidatos.length === 0}
                  >
                    {exportando ? "Generando PDF…" : "Exportar informe PDF"}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
