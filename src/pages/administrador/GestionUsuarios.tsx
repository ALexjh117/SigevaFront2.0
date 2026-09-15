import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Alert, Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaSearch, FaToggleOff, FaToggleOn } from "react-icons/fa";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { api } from "../../api";
import { useAuth } from "../../context/auth/auth.context";
import { ADMIN_PALETTE } from "../../theme/tokens";
import { adminTableStyles } from "../../theme/adminTableStyles";
import {
  DetalleFilaModal,
  LupaDetalle,
  SemaforoEstado,
  etiquetaEstado,
  textoCorto,
} from "../../components/tabla/detalleTabla";
import { FiltroCentroRed } from "../../components/dashboard/FiltroCentroRed";
import { useFiltroCentroRed } from "../../hooks/useCatalogoCentros";
import { esAdministradorRed, esAdminSistema } from "../../utils/roles";
import { etiquetaPerfil } from "../../utils/usuario";
import {
  estadoCanonico,
  idDeCentro,
  listaDe,
  mensajeApi,
  nombreDeCentro,
} from "../../utils/centro";
import {
  CrearUsuarioCentroModal,
  type RolCreacion,
} from "./modals/CrearUsuarioCentroModal";

type UsuarioGestion = {
  id: number;
  nombres?: string;
  apellidos?: string;
  celular?: string;
  numeroDocumento?: string;
  numero_documento?: string;
  email: string;
  estado: string;
  perfil: string;
  idcentro_formacion?: number;
  centroFormacion?: Record<string, unknown>;
};

type FiltroRol = "todos" | RolCreacion;

function nombreCompleto(u: UsuarioGestion) {
  if (u.nombres && u.apellidos) return `${u.nombres} ${u.apellidos}`;
  return u.email;
}

function documentoDe(u: UsuarioGestion) {
  return u.numeroDocumento || u.numero_documento || "—";
}

function centroIdDeUsuario(u: UsuarioGestion): number {
  return (
    Number(u.idcentro_formacion) ||
    idDeCentro(u.centroFormacion as Record<string, unknown> | null) ||
    0
  );
}

function perfilCanonico(perfil?: string) {
  return String(perfil || "").trim().toLowerCase();
}

export default function GestionUsuarios() {
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);
  const esSede = esAdminSistema(user?.perfil);

  const {
    regionales,
    centrosFiltrados,
    idRegional,
    idCentro,
    centroElegido,
    elegirRegional,
    elegirCentro,
  } = useFiltroCentroRed(esRed);

  const idCentroActivo = esRed
    ? idCentro
    : Number(user?.centroFormacion || user?.CentroFormacion || 0);

  const hayCentro = idCentroActivo > 0;

  const [usuarios, setUsuarios] = useState<UsuarioGestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<FiltroRol>("todos");
  const [showCrear, setShowCrear] = useState(false);
  const [detalle, setDetalle] = useState<UsuarioGestion | null>(null);
  const [editando, setEditando] = useState<UsuarioGestion | null>(null);
  const [formEdit, setFormEdit] = useState({
    nombres: "",
    apellidos: "",
    celular: "",
    email: "",
    password: "",
  });
  const [guardando, setGuardando] = useState(false);

  const rolesPermitidos: RolCreacion[] = esRed
    ? ["admin_sistema", "colaborador"]
    : ["colaborador"];

  const endpoints = useMemo(() => {
    if (esRed) {
      return [
        { perfil: "admin_sistema", url: "api/usuarios/admin-sistema" },
        { perfil: "colaborador", url: "api/usuarios/colaboradores" },
      ];
    }
    return [{ perfil: "colaborador", url: "api/usuarios/colaboradores" }];
  }, [esRed]);

  const cargar = useCallback(async () => {
    if (!hayCentro) {
      setUsuarios([]);
      return;
    }
    setLoading(true);
    try {
      const lotes = await Promise.all(
        endpoints.map(async ({ perfil, url }) => {
          const res = await api.get(url);
          return listaDe<UsuarioGestion>(res.data)
            .filter((u) => centroIdDeUsuario(u) === idCentroActivo)
            .map((u) => ({ ...u, perfil: u.perfil || perfil }));
        })
      );
      const mapa = new Map<number, UsuarioGestion>();
      for (const u of lotes.flat()) {
        mapa.set(u.id, u);
      }
      setUsuarios([...mapa.values()]);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: mensajeApi(err),
        icon: "error",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
    } finally {
      setLoading(false);
    }
  }, [endpoints, hayCentro, idCentroActivo]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return usuarios.filter((row) => {
      if (filtroRol !== "todos" && perfilCanonico(row.perfil) !== filtroRol) {
        return false;
      }
      if (!q) return true;
      const nombre = nombreCompleto(row).toLowerCase();
      const rol = etiquetaPerfil(row.perfil).toLowerCase();
      return (
        nombre.includes(q) ||
        row.email.toLowerCase().includes(q) ||
        rol.includes(q)
      );
    });
  }, [usuarios, busqueda, filtroRol]);

  const abrirCrear = () => {
    if (!hayCentro) {
      Swal.fire({
        title: "Selecciona un centro",
        text: "Primero elige la regional y el centro de formación para ver y crear usuarios.",
        icon: "info",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
      return;
    }
    setShowCrear(true);
  };

  const handleToggle = async (row: UsuarioGestion) => {
    const nuevo =
      estadoCanonico(row.estado) === "Activo" ? "Inactivo" : "Activo";
    const result = await Swal.fire({
      title: "¿Continuar?",
      text: `¿Deseas ${nuevo === "Activo" ? "activar" : "desactivar"} a ${nombreCompleto(row)}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: ADMIN_PALETTE.confirm,
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    try {
      await api.put(`api/usuarios/${row.id}`, { estado: nuevo });
      await cargar();
      await Swal.fire({
        title: "Listo",
        text: "Estado actualizado",
        icon: "success",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: mensajeApi(err),
        icon: "error",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
    }
  };

  const abrirEditar = (row: UsuarioGestion) => {
    setEditando(row);
    setFormEdit({
      nombres: row.nombres || "",
      apellidos: row.apellidos || "",
      celular: row.celular || "",
      email: row.email || "",
      password: "",
    });
  };

  const guardarEdicion = async (e: FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setGuardando(true);
    try {
      const body: Record<string, string> = {
        nombres: formEdit.nombres,
        apellidos: formEdit.apellidos,
        celular: formEdit.celular,
        email: formEdit.email,
      };
      if (formEdit.password.trim()) body.password = formEdit.password;
      await api.put(`api/usuarios/${editando.id}`, body);
      setEditando(null);
      await cargar();
      await Swal.fire({
        title: "Listo",
        text: "Usuario actualizado",
        icon: "success",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: mensajeApi(err),
        icon: "error",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
    } finally {
      setGuardando(false);
    }
  };

  const columns: TableColumn<UsuarioGestion>[] = [
    {
      name: "Nombre",
      selector: (row) => nombreCompleto(row),
      sortable: true,
      grow: 2,
      cell: (row) => textoCorto(nombreCompleto(row), 28),
    },
    {
      name: "Correo",
      selector: (row) => row.email,
      sortable: true,
      grow: 2,
      cell: (row) => textoCorto(row.email, 28),
    },
    {
      name: "Rol",
      selector: (row) => etiquetaPerfil(row.perfil),
      sortable: true,
      width: "160px",
      cell: (row) => etiquetaPerfil(row.perfil),
    },
    {
      name: "Estado",
      selector: (row) => row.estado,
      width: "110px",
      center: true,
      cell: (row) => <SemaforoEstado estado={row.estado} />,
    },
    {
      name: "",
      width: "56px",
      center: true,
      cell: (row) => <LupaDetalle onClick={() => setDetalle(row)} />,
      ignoreRowClick: true,
    },
    {
      name: "",
      width: "110px",
      cell: (row) => (
        <div className="d-flex gap-1">
          <button
            type="button"
            className="tabla-accion-icono"
            onClick={() => abrirEditar(row)}
            title="Editar"
          >
            <FaEdit />
          </button>
          <button
            type="button"
            className="tabla-accion-icono"
            onClick={() => void handleToggle(row)}
            title={
              estadoCanonico(row.estado) === "Activo" ? "Desactivar" : "Activar"
            }
          >
            {estadoCanonico(row.estado) === "Activo" ? (
              <FaToggleOff />
            ) : (
              <FaToggleOn />
            )}
          </button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  if (!esRed && !esSede) {
    return (
      <div className="container mt-4 admin-page">
        <div className="alert alert-warning">
          No tienes permiso para gestionar usuarios del centro.
        </div>
      </div>
    );
  }

  const nombreCentroVista = esRed
    ? centroElegido?.nombre || ""
    : user?.nombreCentro || "tu centro";

  return (
    <div className="container mt-4 admin-page">
      <div className="mb-4 d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h2 className="fw-bold mb-1">Gestión de usuarios</h2>
          <p className="text-muted mb-0">
            {esRed
              ? "Elige un centro de formación para ver sus usuarios y crear solo en esa sede."
              : "Usuarios de tu centro. Al crear, eliges el rol en el formulario."}
          </p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center"
          onClick={abrirCrear}
          disabled={esRed && !hayCentro}
        >
          <FaPlus className="me-2" /> Nuevo usuario
        </Button>
      </div>

      {esRed ? (
        <FiltroCentroRed
          regionales={regionales}
          centros={centrosFiltrados}
          idRegional={idRegional}
          idCentro={idCentro}
          onRegional={(id) => {
            elegirRegional(id);
            setBusqueda("");
            setFiltroRol("todos");
            setUsuarios([]);
          }}
          onCentro={(id) => {
            elegirCentro(id);
            setBusqueda("");
            setFiltroRol("todos");
          }}
        />
      ) : null}

      {!hayCentro && esRed ? (
        <Alert variant="light" className="border text-muted">
          Selecciona la regional y el centro de formación para ver los usuarios
          de esa sede.
        </Alert>
      ) : (
        <>
          {nombreCentroVista ? (
            <p className="text-muted small mb-3">
              Mostrando usuarios de: <strong>{nombreCentroVista}</strong>
            </p>
          ) : null}

          <Row className="mb-4 g-3 align-items-end">
            <Col md={6} lg={5}>
              <Form.Label className="small text-muted mb-1">Buscar</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="Nombre, correo o rol…"
                  className="border-start-0"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4} lg={3}>
              <Form.Label className="small text-muted mb-1">Filtrar por rol</Form.Label>
              <Form.Select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value as FiltroRol)}
              >
                <option value="todos">Todos los roles</option>
                {esRed && (
                  <option value="admin_sistema">Admin de centro</option>
                )}
                <option value="colaborador">Colaborador</option>
              </Form.Select>
            </Col>
          </Row>

          <div className="admin-table-shell">
            <DataTable
              columns={columns}
              data={filas}
              progressPending={loading}
              progressComponent={
                <div className="text-center py-3">Cargando…</div>
              }
              noDataComponent={
                <div className="text-center py-3 text-muted">
                  No hay usuarios para este centro con el filtro actual
                </div>
              }
              pagination
              paginationPerPage={8}
              highlightOnHover
              customStyles={adminTableStyles}
            />
          </div>
        </>
      )}

      <CrearUsuarioCentroModal
        show={showCrear}
        onHide={() => setShowCrear(false)}
        onSuccess={() => void cargar()}
        rolesPermitidos={rolesPermitidos}
        idCentroFijo={idCentroActivo}
        nombreCentroFijo={nombreCentroVista}
      />

      {detalle && (
        <DetalleFilaModal
          show={!!detalle}
          onHide={() => setDetalle(null)}
          titulo="Detalle del usuario"
          campos={[
            { etiqueta: "Nombres", valor: detalle.nombres || "—" },
            { etiqueta: "Apellidos", valor: detalle.apellidos || "—" },
            { etiqueta: "Email", valor: detalle.email },
            { etiqueta: "Celular", valor: detalle.celular || "—" },
            { etiqueta: "Documento", valor: documentoDe(detalle) },
            { etiqueta: "Rol", valor: etiquetaPerfil(detalle.perfil) },
            { etiqueta: "Estado", valor: etiquetaEstado(detalle.estado) },
            {
              etiqueta: "Centro",
              valor:
                nombreDeCentro(detalle.centroFormacion) ||
                (detalle.idcentro_formacion
                  ? `Centro ${detalle.idcentro_formacion}`
                  : "—"),
            },
          ]}
        />
      )}

      <div
        className={`modal fade ${editando ? "show" : ""}`}
        style={{ display: editando ? "block" : "none" }}
        tabIndex={-1}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar usuario</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setEditando(null)}
              />
            </div>
            <form onSubmit={guardarEdicion}>
              <div className="modal-body">
                <Form.Group className="mb-3">
                  <Form.Label>Nombres</Form.Label>
                  <Form.Control
                    value={formEdit.nombres}
                    onChange={(e) =>
                      setFormEdit((f) => ({ ...f, nombres: e.target.value }))
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control
                    value={formEdit.apellidos}
                    onChange={(e) =>
                      setFormEdit((f) => ({ ...f, apellidos: e.target.value }))
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formEdit.email}
                    onChange={(e) =>
                      setFormEdit((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Celular</Form.Label>
                  <Form.Control
                    value={formEdit.celular}
                    onChange={(e) =>
                      setFormEdit((f) => ({ ...f, celular: e.target.value }))
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-0">
                  <Form.Label>Nueva contraseña (opcional)</Form.Label>
                  <Form.Control
                    type="password"
                    value={formEdit.password}
                    onChange={(e) =>
                      setFormEdit((f) => ({ ...f, password: e.target.value }))
                    }
                    placeholder="Dejar vacío para no cambiar"
                  />
                </Form.Group>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setEditando(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={guardando}>
                  {guardando ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {editando && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setEditando(null)}
        />
      )}
    </div>
  );
}
