import { useEffect, useMemo, useState } from "react";
import { Form, Button, Badge, Container, Spinner } from "react-bootstrap";
import { FaEdit, FaSearch } from "react-icons/fa";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import { esAdministradorRed } from "../../utils/roles";
import "./Aprendices.css";

export interface AprendizResponse {
  idaprendiz: number;
  idgrupo: number;
  idprogramaFormacion: number;
  perfilIdperfil: number;
  centroFormacionIdcentroFormacion: number;
  nombres: string;
  apellidos: string;
  celular: string;
  estado: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  centro_formacion?: {
    idcentroFormacion?: number;
    centroFormacioncol?: string;
    regional?: { regional?: string };
  };
  grupo?: { grupo?: string; jornada?: string | null };
  programa?: { programa?: string };
}

type ResumenCentro = {
  id: number;
  nombre: string;
  regional: string;
  total: number;
  habilitados: number;
};

type GrupoLista = {
  id: number;
  nombre: string;
  regional: string;
  personas: AprendizResponse[];
};

const HABILITADOS = ["activo", "en formacion", "condicionado"];

function esHabilitado(estado?: string) {
  return HABILITADOS.includes((estado || "").toLowerCase());
}

function badgeEstado(estado: string) {
  const e = estado.toLowerCase();
  if (HABILITADOS.includes(e) || e === "certificado") return "success";
  if (e === "trasladado") return "warning";
  return "danger";
}

function idCentroDe(a: AprendizResponse) {
  return (
    a.centroFormacionIdcentroFormacion ||
    a.centro_formacion?.idcentroFormacion ||
    0
  );
}

function nombreCentroDe(a: AprendizResponse) {
  return a.centro_formacion?.centroFormacioncol || "Sin centro";
}

function regionalDe(a: AprendizResponse) {
  return a.centro_formacion?.regional?.regional || "—";
}

function iniciales(nombres: string, apellidos: string) {
  const n = (nombres || "").trim().split(/\s+/)[0]?.[0] || "";
  const a = (apellidos || "").trim().split(/\s+/)[0]?.[0] || "";
  return `${n}${a}`.toUpperCase() || "?";
}

const Aprendices: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);

  const [buscar, setBuscar] = useState("");
  const [estado, setEstado] = useState("");
  const [centroId, setCentroId] = useState<number | "todos">("todos");
  const [abierto, setAbierto] = useState<number | null>(null);
  const [aprendices, setAprendices] = useState<AprendizResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!esAdministradorRed(user?.perfil) && !user?.centroFormacion) {
        setLoading(false);
        return;
      }
      try {
        const path = esRed
          ? "api/aprendiz/listar"
          : `api/aprendiz/inscritos/centro/${user?.centroFormacion}`;
        const res = await api.get(path);
        setAprendices(esRed ? res.data : res.data.data);
      } catch (error) {
        console.error("Error al cargar aprendices:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.centroFormacion, user?.perfil, esRed]);

  const resumenCentros = useMemo<ResumenCentro[]>(() => {
    const map = new Map<number, ResumenCentro>();
    for (const a of aprendices) {
      const id = idCentroDe(a);
      const actual = map.get(id) || {
        id,
        nombre: nombreCentroDe(a),
        regional: regionalDe(a),
        total: 0,
        habilitados: 0,
      };
      actual.total += 1;
      if (esHabilitado(a.estado)) actual.habilitados += 1;
      map.set(id, actual);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [aprendices]);

  const estados = useMemo(() => {
    const set = new Set(aprendices.map((a) => a.estado).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, "es"));
  }, [aprendices]);

  const kpis = useMemo(() => {
    const total = aprendices.length;
    const habilitados = aprendices.filter((a) => esHabilitado(a.estado)).length;
    return {
      total,
      habilitados,
      otros: total - habilitados,
      centros: resumenCentros.length,
    };
  }, [aprendices, resumenCentros]);

  const filteredData = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    return aprendices.filter((a) => {
      if (esRed && centroId !== "todos" && idCentroDe(a) !== centroId) return false;
      if (estado && a.estado !== estado) return false;
      if (!q) return true;
      return [a.nombres, a.apellidos, a.numeroDocumento, a.email, a.celular, nombreCentroDe(a)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [aprendices, buscar, estado, centroId, esRed]);

  const grupos = useMemo<GrupoLista[]>(() => {
    const map = new Map<number, GrupoLista>();
    for (const a of filteredData) {
      const id = idCentroDe(a);
      const actual = map.get(id) || {
        id,
        nombre: nombreCentroDe(a),
        regional: regionalDe(a),
        personas: [],
      };
      actual.personas.push(a);
      map.set(id, actual);
    }
    return [...map.values()].sort((a, b) => b.personas.length - a.personas.length);
  }, [filteredData]);

  const irAEditar = (row: AprendizResponse) => {
    navigate("/aprendiz-form", { state: { aprendiz: row } });
  };

  return (
    <Container fluid className="p-4 padron">
      <div className="padron-head">
        <div>
          <h3>
            Gestión de <span style={{ color: "#5027BC" }}>Aprendices</span>
          </h3>
          <p>
            {esRed
              ? "Elige un centro para ver su padrón. Correo y celular salen al abrir cada ficha."
              : "Padrón de tu centro. Busca y actualiza a quienes pueden votar."}
          </p>
        </div>
        <Button
          style={{ backgroundColor: "#5027BC", border: "none" }}
          onClick={() => navigate("/aprendiz-form")}
        >
          <AiOutlinePlusCircle className="me-2 fs-4" />
          Nuevo Aprendiz
        </Button>
      </div>

      <div className="padron-stats">
        <div className="padron-stat">
          <strong>{kpis.total}</strong>
          <span>{esRed ? "En la red" : "En el centro"}</span>
        </div>
        {esRed && (
          <div className="padron-stat">
            <strong>{kpis.centros}</strong>
            <span>Centros</span>
          </div>
        )}
        <div className="padron-stat">
          <strong>{kpis.habilitados}</strong>
          <span>Habilitados</span>
        </div>
        <div className="padron-stat">
          <strong>{kpis.otros}</strong>
          <span>Otros estados</span>
        </div>
      </div>

      <div className="padron-toolbar">
        <div className="padron-search position-relative">
          <FaSearch className="position-absolute text-muted" style={{ left: 12, top: 12 }} />
          <Form.Control
            type="text"
            placeholder={
              esRed
                ? "Buscar nombre, documento, correo o centro..."
                : "Buscar nombre, documento o correo..."
            }
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {estados.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Form.Select>
      </div>

      <div>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: "#5027BC" }} />
            </div>
          ) : esRed && centroId === "todos" && !buscar.trim() && !estado ? (
            <div className="padron-cards">
              {resumenCentros.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className="padron-card"
                  onClick={() => setCentroId(c.id)}
                >
                  <span className="reg">{c.regional}</span>
                  <h6>{c.nombre}</h6>
                  <div className="nums">
                    <span>
                      <b>{c.total}</b> aprendices
                    </span>
                    <span>
                      <b>{c.habilitados}</b> habilitados
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="padron-lista">
              <div className="padron-vacio">
                No hay aprendices con esos filtros. La consulta no es un error: la lista está vacía.
              </div>
            </div>
          ) : (
            <>
              {esRed && centroId !== "todos" && (
                <button
                  type="button"
                  className="padron-volver"
                  onClick={() => setCentroId("todos")}
                >
                  ← Todos los centros
                </button>
              )}
              {grupos.map((g) => (
              <section key={g.id} className="padron-lista mb-3">
                {(esRed || grupos.length > 1) && (
                  <div className="padron-seccion-head">
                    <div>
                      <h6>{g.nombre}</h6>
                      {g.regional !== "—" && <small>{g.regional}</small>}
                    </div>
                    <small className="text-muted">
                      {g.personas.length}{" "}
                      {g.personas.length === 1 ? "aprendiz" : "aprendices"}
                    </small>
                  </div>
                )}
                {g.personas.map((a) => {
                  const open = abierto === a.idaprendiz;
                  return (
                    <article
                      key={a.idaprendiz}
                      className={`padron-row${open ? " open" : ""}`}
                      onClick={() =>
                        setAbierto(open ? null : a.idaprendiz)
                      }
                    >
                      <div className="padron-avatar">
                        {iniciales(a.nombres, a.apellidos)}
                      </div>
                      <div className="padron-who">
                        <strong>
                          {a.nombres} {a.apellidos}
                        </strong>
                        <span>
                          {a.tipoDocumento} {a.numeroDocumento}
                          {a.grupo?.grupo ? ` · ${a.grupo.grupo}` : ""}
                          {a.grupo?.jornada ? ` · ${a.grupo.jornada}` : ""}
                        </span>
                      </div>
                      <Badge bg={badgeEstado(a.estado)}>{a.estado}</Badge>
                      <Button
                        variant="light"
                        size="sm"
                        className="padron-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          irAEditar(a);
                        }}
                      >
                        <FaEdit />
                      </Button>
                      {open && (
                        <div className="padron-detalle">
                          <div>
                            <b>Correo</b> {a.email || "—"}
                          </div>
                          <div>
                            <b>Celular</b> {a.celular || "—"}
                          </div>
                          <div>
                            <b>Programa</b> {a.programa?.programa || "—"}
                          </div>
                          {!esRed && (
                            <div>
                              <b>Centro</b> {nombreCentroDe(a)}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
              ))}
            </>
          )}
          {!(esRed && centroId === "todos" && !buscar.trim() && !estado) && (
            <div className="padron-foot">
              Mostrando {filteredData.length} de {aprendices.length} resultados
            </div>
          )}
      </div>
    </Container>
  );
};

export default Aprendices;
