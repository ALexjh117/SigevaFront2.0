import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaSearch, FaToggleOn, FaToggleOff, FaEye, FaEyeSlash } from "react-icons/fa";

import DataTable from 'react-data-table-component';
import type { TableColumn } from 'react-data-table-component';
import { api } from "../../api";
import { ADMIN_PALETTE } from "../../theme/tokens";
import { adminTableStyles } from "../../theme/adminTableStyles";
import { SemaforoEstado, etiquetaEstado, textoCorto, LupaDetalle, DetalleFilaModal } from "../../components/tabla/detalleTabla";
import { MiniGraficas, contarPor, topN } from "../../components/graficas/MiniGraficas";
import { useAuth } from "../../context/auth/auth.context";
import { esAdministradorRed } from "../../utils/roles";
import { estadoCanonico, mensajeApi } from "../../utils/centro";

// ----------------- Interfaces -----------------
interface Regional {
  idregional: number;
  regional: string;
  telefono: string;
  direccion: string;
}

interface RegionalSimple {
  idregional: number;
  regional: string;
}

interface CentroFormacion {
  idcentroFormacion?: number;
  idcentro_formacion?: number;
  centroFormacioncol?: string;
  centro_formacioncol?: string;
  centro_formacion?: string;
  nombre?: string;
  direccion: string;
  telefono: string;
  correo: string;
  subdirector: string;
  correosubdirector: string;
  regional?: Regional;
  idregional?: number;
}

interface Colaborador {
  id: number;
  nombres?: string;
  apellidos?: string;
  celular?: string;
  numero_documento?: string;
  numeroDocumento?: string;
  email: string;
  estado: string;
  centroFormacion?: {
    idcentroFormacion?: number;
    idcentro_formacion?: number;
    centroFormacioncol?: string;
    centro_formacioncol?: string;
    centro_formacion?: string;
    nombre?: string;
    direccion: string;
    telefono: string;
    correo: string;
    subdirector: string;
    correosubdirector: string;
    regional: Regional;
  };
}

interface FormData {
  nombres: string;
  apellidos: string;
  celular: string;
  numero_documento: string;
  email: string;
  estado: string;
  idcentro_formacion: number;
  idregional: number;
  password: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

// ----------------- Componente -----------------
const Colaboradores: React.FC = () => {
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    apellidos: "",
    celular: "",
    numero_documento: "",
    email: "",
    estado: "activo",
    idcentro_formacion: 0,
    idregional: 0,
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [regionales, setRegionales] = useState<RegionalSimple[]>([]);
  const [centros, setCentros] = useState<CentroFormacion[]>([]);
  const [loadingCentros, setLoadingCentros] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --------- FILTRO ---------
  const colaboradoresFiltrados = colaboradores.filter((col: Colaborador) => {
    const searchTerm = busqueda.toLowerCase();
    const centroNombre = col.centroFormacion?.centroFormacioncol || col.centroFormacion?.centro_formacioncol || col.centroFormacion?.nombre || "";
    return (
      col.email.toLowerCase().includes(searchTerm) ||
      (col.nombres?.toLowerCase().includes(searchTerm) ?? false) ||
      (col.apellidos?.toLowerCase().includes(searchTerm) ?? false) ||
      (centroNombre.toLowerCase().includes(searchTerm) ?? false) ||
      (col.centroFormacion?.regional?.regional?.toLowerCase().includes(searchTerm) ?? false)
    );
  });

  // --------- CARGA DE DATOS ---------
  const cargarColaboradores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Colaborador[]>("api/usuarios/colaboradores");
      setColaboradores(response.data || []);
    } catch (err: unknown) {
      const message = mensajeApi(err);
      setError(message);
      setColaboradores([]); // Evitar error de filtrado si no hay datos
    } finally {
      setLoading(false);
    }
  };

  const cargarRegionales = async () => {
    try {
      const response = await api.get("/api/regionales");
      const regionalesData = response.data?.data || response.data || [];
      const regionalesArray = Array.isArray(regionalesData) ? regionalesData : [];
      setRegionales(regionalesArray);
    } catch (err) {
      setRegionales([]);
    }
  };

  const cargarCentrosPorRegional = async (idRegional: number) => {
    setLoadingCentros(true);
    try {
      // Usar el endpoint general y filtrar por regional en el frontend
      const response = await api.get("/api/centrosFormacion/obtiene");
      
      // Extraer los datos según el patrón del proyecto
      const centrosData = response.data?.data || response.data || [];
      const centrosArray = Array.isArray(centrosData) ? centrosData : [];
      
      // Filtrar por regional
      const centrosFiltrados = centrosArray.filter((centro: CentroFormacion) => 
        centro.regional?.idregional === idRegional || centro.idregional === idRegional
      );
      
      // Mapear para normalizar los campos
      const centrosNormalizados = centrosFiltrados.map((centro: CentroFormacion) => ({
        ...centro,
        idcentro_formacion: centro.idcentroFormacion || centro.idcentro_formacion,
        centro_formacioncol: centro.centroFormacioncol || centro.centro_formacioncol || centro.nombre
      }));
      
      setCentros(centrosNormalizados);
    } catch (err) {
      setCentros([]);
    } finally {
      setLoadingCentros(false);
    }
  };

  // --------- CREAR/EDITAR COLABORADOR ---------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const requestData: Record<string, string | number> = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        celular: formData.celular,
        tipo_documento: "CC",
        numero_documento: formData.numero_documento,
        email: formData.email,
        estado: estadoCanonico(formData.estado),
        idcentro_formacion: formData.idcentro_formacion,
        idregional: formData.idregional,
      };

      // Incluir contraseña solo si se proporciona
      if (formData.password.trim() !== "") {
        requestData.password = formData.password;
      }

      if (editingId) {
        // Editar colaborador existente
        await api.put<ApiResponse<Colaborador>>(`/api/usuarios/${editingId}`, requestData);
        
        await Swal.fire({
          title: "¡Éxito!",
          text: "Colaborador actualizado correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: ADMIN_PALETTE.confirm,
        });
      } else {
        // Crear nuevo colaborador
        await api.post<ApiResponse<Colaborador>>("/api/usuarios/colaboradores", requestData);
        
        await Swal.fire({
          title: "¡Éxito!",
          text: "Colaborador creado correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: ADMIN_PALETTE.confirm,
        });
      }
      
      await cargarColaboradores();
      handleCloseModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setFormError(message);
      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
    } finally {
      setFormLoading(false);
    }
  };

  // --------- ACTIVAR/DESACTIVAR ---------
  const handleToggleStatus = async (id: number, nuevoEstado: string) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas ${estadoCanonico(nuevoEstado) === "Activo" ? "activar" : "desactivar"} este colaborador?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: ADMIN_PALETTE.confirm,
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    
    try {
      const estado = estadoCanonico(nuevoEstado);
      await api.put<ApiResponse<Colaborador>>(`/api/usuarios/${id}`, { estado });
      setColaboradores(
        colaboradores.map((col: Colaborador) =>
          col.id === id ? { ...col, estado } : col
        )
      );
      await Swal.fire({
        title: "¡Éxito!",
        text: "Estado del colaborador actualizado correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido al actualizar el estado";
      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
    }
  };

  // --------- HANDLERS ---------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convertir a número si es un campo de ID
    const processedValue = (name === "idregional" || name === "idcentro_formacion") 
      ? (value === "" ? 0 : Number(value)) 
      : value;
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    
    // Si se cambia la regional, cargar los centros correspondientes
    if (name === "idregional") {
      const idRegional = Number(value);
      if (idRegional > 0) {
        cargarCentrosPorRegional(idRegional);
      } else {
        setCentros([]);
      }
      // Resetear el centro seleccionado
      setFormData((prev) => ({ ...prev, idcentro_formacion: 0 }));
    }
  };

  const resetForm = () => {
    setFormError(null);
    setFormData({
      nombres: "",
      apellidos: "",
      celular: "",
      numero_documento: "",
      email: "",
      estado: "activo",
      idcentro_formacion: 0,
      idregional: 0,
      password: "",
    });
    setCentros([]);
    setEditingId(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleVerDetalle = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setShowDetalleModal(true);
  };

  const handleCloseDetalleModal = () => {
    setShowDetalleModal(false);
    setSelectedColaborador(null);
  };

  const handleEditar = (colaborador: Colaborador) => {
    setEditingId(colaborador.id);
    
    // Primero cargar los centros de la regional del colaborador
    if (colaborador.centroFormacion?.regional?.idregional) {
      cargarCentrosPorRegional(colaborador.centroFormacion.regional.idregional).then(() => {
        // Después de cargar los centros, establecer el formulario
        setFormData({
          nombres: colaborador.nombres || "",
          apellidos: colaborador.apellidos || "",
          celular: colaborador.celular || "",
          numero_documento: colaborador.numero_documento || colaborador.numeroDocumento || "",
          email: colaborador.email,
          estado: colaborador.estado,
          idcentro_formacion: colaborador.centroFormacion?.idcentroFormacion || colaborador.centroFormacion?.idcentro_formacion || 0,
          idregional: colaborador.centroFormacion?.regional?.idregional || 0,
          password: "",
        });
        setShowModal(true);
      });
    } else {
      // Si no hay regional, establecer formulario y mostrar modal directamente
      setFormData({
        nombres: colaborador.nombres || "",
        apellidos: colaborador.apellidos || "",
        celular: colaborador.celular || "",
        numero_documento: colaborador.numero_documento || colaborador.numeroDocumento || "",
        email: colaborador.email,
        estado: colaborador.estado,
        idcentro_formacion: colaborador.centroFormacion?.idcentroFormacion || colaborador.centroFormacion?.idcentro_formacion || 0,
        idregional: colaborador.centroFormacion?.regional?.idregional || 0,
        password: "",
      });
      setShowModal(true);
    }
  };

  useEffect(() => {
    cargarColaboradores();
    cargarRegionales();
  }, []);

  // --------- COLUMNAS PARA DATATABLE ---------
  const columns: TableColumn<Colaborador>[] = [
    {
      name: "Nombre",
      selector: (row: Colaborador): string =>
        row.nombres && row.apellidos
          ? `${row.nombres} ${row.apellidos}`
          : row.email,
      sortable: true,
      width: "250px",
      cell: (row: Colaborador) =>
        textoCorto(
          row.nombres && row.apellidos
            ? `${row.nombres} ${row.apellidos}`
            : row.email,
          24
        ),
    },
    {
      name: "Centro",
      selector: (row: Colaborador) => row.centroFormacion?.centroFormacioncol || row.centroFormacion?.centro_formacioncol || row.centroFormacion?.nombre || "Sin centro",
      sortable: true,
      width: "250px",
      cell: (row: Colaborador) => textoCorto(row.centroFormacion?.centroFormacioncol || row.centroFormacion?.centro_formacioncol || row.centroFormacion?.nombre || "Sin centro", 20),
    },
    {
      name: "Estado",
      selector: (row: Colaborador) => row.estado,
      width: "110px",
      cell: (row: Colaborador) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SemaforoEstado estado={row.estado} />
        </div>
      ),
    },
    {
      name: "",
      width: "56px",
      cell: (row: Colaborador) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LupaDetalle onClick={() => handleVerDetalle(row)} />
        </div>
      ),
      ignoreRowClick: true,
    },
    {
      name: "",
      width: "110px",
      cell: (row: Colaborador) => (
        <div className="d-flex gap-1 justify-content-center">
          <button
            className="tabla-accion-icono"
            onClick={() => handleEditar(row)}
            title="Editar colaborador"
          >
            <FaEdit />
          </button>
          <button
            className="tabla-accion-icono"
            onClick={() => handleToggleStatus(row.id, estadoCanonico(row.estado) === "Activo" ? "Inactivo" : "Activo")}
            title={estadoCanonico(row.estado) === "Activo" ? "Desactivar" : "Activar"}
          >
            {estadoCanonico(row.estado) === "Activo" ? <FaToggleOff /> : <FaToggleOn />}
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  if (!esRed) {
    return (
      <div className="container mt-4 admin-page">
        <div className="alert alert-warning">
          Solo el Administrador de red puede gestionar colaboradores.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 admin-page">
      <div className="mb-4">
        <h2 className="fw-bold">Gestión de Colaboradores</h2>
        <p className="text-muted">
          Los colaboradores solo pueden actualizar información de aprendices sin acceso a otras funciones administrativas.
        </p>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {!loading && colaboradores.length > 0 && (
        <MiniGraficas
          barras={{
            titulo: "Colaboradores por regional",
            datos: topN(
              contarPor(
                colaboradores,
                (c) => c.centroFormacion?.regional?.regional || "Sin regional"
              ),
              8
            ),
            horizontal: true,
            unidad: "colaboradores",
          }}
          dona={{
            titulo: "Por estado",
            datos: contarPor(colaboradores, (c) => etiquetaEstado(c.estado)),
          }}
        />
      )}

      {/* Buscador + Botón */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="w-50">
          <InputGroup>
            <InputGroup.Text className="bg-white">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Buscar por nombre, correo, centro o regional..."
              className="border-start-0"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="d-flex align-items-center"
        >
          <FaPlus className="me-2" /> Nuevo Colaborador
        </Button>
      </div>

      <div className="admin-table-shell">
        <DataTable
          columns={columns}
          data={colaboradoresFiltrados}
          progressPending={loading}
          progressComponent={<div className="text-center">Cargando...</div>}
          noDataComponent={<div className="text-center text-danger">{error || "No hay colaboradores registrados"}</div>}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 15]}
          paginationComponentOptions={{ noRowsPerPage: false }}
          highlightOnHover
          customStyles={adminTableStyles}
        />
      </div>

      {/* Modal para crear colaborador */}
      <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingId ? "Editar Colaborador" : "Crear Colaborador"}
              </h5>
              <button type="button" className="btn-close" onClick={handleCloseModal}></button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-danger">{formError}</div>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombres</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Apellidos</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Documento</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero_documento"
                    value={formData.numero_documento}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Celular</Form.Label>
                  <Form.Control
                    type="text"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Regional</Form.Label>
                  <Form.Select
                    name="idregional"
                    value={formData.idregional}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione una regional</option>
                    {Array.isArray(regionales) && regionales.map((regional) => (
                      <option key={regional.idregional} value={regional.idregional}>
                        {regional.regional}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Centro de Formación</Form.Label>
                  <Form.Select
                    name="idcentro_formacion"
                    value={formData.idcentro_formacion === 0 ? "" : formData.idcentro_formacion}
                    onChange={handleInputChange}
                    disabled={loadingCentros || formData.idregional === 0}
                    required
                  >
                    <option value="">Seleccione un centro</option>
                    {Array.isArray(centros) && centros.map((centro, index) => {
                      const centroId = centro.idcentro_formacion || centro.idcentroFormacion;
                      const centroNombre = centro.centro_formacioncol || centro.centro_formacion || centro.nombre || "Sin nombre";
                      return (
                        <option key={centroId || `centro-${index}`} value={centroId}>
                          {centroNombre}
                        </option>
                      );
                    })}
                  </Form.Select>
                  {formData.idregional === 0 && (
                    <Form.Text className="text-muted">
                      Primero seleccione una regional
                    </Form.Text>
                  )}
                  {formData.idregional !== 0 && centros.length === 0 && !loadingCentros && (
                    <Form.Text className="text-warning">
                      No hay centros disponibles para esta regional
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña (opcional, por defecto será el documento)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Dejar vacío para usar número de documento"
                    />
                    <InputGroup.Text 
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer" }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
                <div className="modal-footer px-0 pb-0">
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={formLoading}
                  >
                    {formLoading ? "Creando..." : "Crear Colaborador"}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show" onClick={handleCloseModal}></div>}

      {/* Modal de detalle de colaborador */}
      {selectedColaborador && (
        <DetalleFilaModal
          show={showDetalleModal}
          onHide={handleCloseDetalleModal}
          titulo="Detalle del Colaborador"
          campos={[
            { etiqueta: "Nombres", valor: selectedColaborador.nombres || "—" },
            { etiqueta: "Apellidos", valor: selectedColaborador.apellidos || "—" },
            { etiqueta: "Email", valor: selectedColaborador.email },
            { etiqueta: "Celular", valor: selectedColaborador.celular || "—" },
            { etiqueta: "Número de Documento", valor: selectedColaborador.numero_documento || selectedColaborador.numeroDocumento || "—" },
            { etiqueta: "Estado", valor: etiquetaEstado(selectedColaborador.estado) },
            { etiqueta: "Centro de Formación", valor: selectedColaborador.centroFormacion?.centroFormacioncol || selectedColaborador.centroFormacion?.centro_formacioncol || selectedColaborador.centroFormacion?.nombre || "Sin centro" },
            { etiqueta: "Regional", valor: selectedColaborador.centroFormacion?.regional?.regional || "Sin regional" },
          ]}
        />
      )}
    </div>
  );
};

export default Colaboradores;
