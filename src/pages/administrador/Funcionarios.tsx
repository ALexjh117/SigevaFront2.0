import React, { useEffect, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaSearch, FaToggleOn, FaToggleOff } from "react-icons/fa";

import DataTable from 'react-data-table-component';
import type { TableColumn } from 'react-data-table-component';
import { EditarFuncionarioModal } from "./modals/EditarFuncionarioModal";
import { CrearFuncionarioModal } from "./modals/CrearFuncionarioModal";
import { FuncionarioDetalleModal } from "./modals/FuncionarioDetalleModal";
import { api } from "../../api";
import { ADMIN_PALETTE } from "../../theme/tokens";
import { adminTableStyles } from "../../theme/adminTableStyles";
import { LupaDetalle, SemaforoEstado, etiquetaEstado, textoCorto } from "../../components/tabla/detalleTabla";
import { MiniGraficas, contarPor, topN } from "../../components/graficas/MiniGraficas";
import { useAuth } from "../../context/auth/auth.context";
import { esAdministradorRed, esAdminSistema } from "../../utils/roles";
import { estadoCanonico, mensajeApi } from "../../utils/centro";

// ----------------- Interfaces -----------------
interface Regional {
  idregional: number;
  regional: string;
  telefono: string;
  direccion: string;
}

interface CentroFormacion {
  idcentroFormacion: number;
  centroFormacioncol: string;
  direccion: string;
  telefono: string;
  correo: string;
  subdirector: string;
  correosubdirector: string;
  regional: Regional;
}

interface Funcionario {
  id: number;
  nombres?: string;
  apellidos?: string;
  celular?: string;
  numero_documento?: string;
  numeroDocumento?: string; // Agregado para manejar ambos formatos de la API
  email: string;
  estado: string;
  centroFormacion?: CentroFormacion;
}

interface FormData {
  nombres: string;
  apellidos: string;
  celular: string;
  numero_documento: string;
  email: string;
  estado: string;
  idcentro_formacion: number;
  idregional?: number;
  idperfil?: number;
  password: string;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

interface FuncionarioDetalle extends Funcionario {
  idregional?: number;
  idperfil?: number;
  numeroDocumento?: string; // Asegurar compatibilidad con ambos formatos
}

// ----------------- Componente -----------------
const Funcionarios: React.FC = () => {
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);
  const esSede = esAdminSistema(user?.perfil);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    apellidos: "",
    celular: "",
    numero_documento: "",
    email: "",
    estado: "activo",
    idcentro_formacion: 1,
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [detalleFuncionario, setDetalleFuncionario] = useState<Funcionario | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // --------- FILTRO ---------
  const funcionariosFiltrados = funcionarios.filter((func: Funcionario) => {
    const searchTerm = busqueda.toLowerCase();
    return (
      func.email.toLowerCase().includes(searchTerm) ||
      (func.nombres?.toLowerCase().includes(searchTerm) ?? false) ||
      (func.apellidos?.toLowerCase().includes(searchTerm) ?? false) ||
      (func.centroFormacion?.centroFormacioncol?.toLowerCase().includes(searchTerm) ?? false) ||
      (func.centroFormacion?.regional?.regional?.toLowerCase().includes(searchTerm) ?? false)
    );
  });

  // --------- CARGA DE DATOS ---------
  const cargarFuncionarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Funcionario[]>("api/usuarios/funcionarios");
      setFuncionarios(response.data);
    } catch (err: unknown) {
      const message = mensajeApi(err);
      setError(message);
      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
    } finally {
      setLoading(false);
    }
  };

  // --------- CREAR / EDITAR ---------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const isEditing = Boolean(editingId);
      const url = isEditing ? `api/usuarios/funcionarios/${editingId}` : "api/usuarios/funcionarios";
      const requestData: Record<string, string | number> = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        celular: formData.celular,
        numero_documento: formData.numero_documento,
        email: formData.email,
        estado: estadoCanonico(formData.estado),
      };
      if (esRed) {
        requestData.idcentro_formacion = formData.idcentro_formacion;
      }

      // Solo incluir contraseña si se proporciona una nueva (crear) o si hay contenido (editar)
      if (!isEditing || (isEditing && formData.password.trim() !== "")) {
        requestData.password = formData.password;
      }

      isEditing 
        ? await api.put<ApiResponse<Funcionario>>(url, requestData) 
        : await api.post<ApiResponse<Funcionario>>(url, requestData);
      await Swal.fire({
        title: "¡Éxito!",
        text: `Funcionario ${isEditing ? "actualizado" : "creado"} correctamente`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
      await cargarFuncionarios();
      resetForm();
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
      text: `¿Deseas ${estadoCanonico(nuevoEstado) === "Activo" ? "activar" : "desactivar"} este funcionario?`,
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
      await api.put<ApiResponse<Funcionario>>(`api/usuarios/funcionarios/${id}`, { estado });
      setFuncionarios(
        funcionarios.map((func: Funcionario) =>
          func.id === id ? { ...func, estado } : func
        )
      );
      await Swal.fire({
        title: "¡Éxito!",
        text: "Estado del funcionario actualizado correctamente",
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditar = async (funcionario: Funcionario) => {
    if (funcionario.nombres && funcionario.apellidos) {
      setFormData({
        nombres: funcionario.nombres || "",
        apellidos: funcionario.apellidos || "",
        celular: funcionario.celular || "",
        numero_documento: funcionario.numero_documento || funcionario.numeroDocumento || "",
        email: funcionario.email,
        estado: funcionario.estado,
        idcentro_formacion: funcionario.centroFormacion?.idcentroFormacion || 1,
        password: "",
      });
      setEditingId(funcionario.id);
      setShowModal(true);
    } else {
      try {
        const response = await api.get<FuncionarioDetalle>(`api/usuarios/${funcionario.id}`);
        const detalles = response.data;
        
        setFormData({
          nombres: detalles.nombres || "",
          apellidos: detalles.apellidos || "",
          celular: detalles.celular || "",
          numero_documento: detalles.numero_documento || detalles.numeroDocumento || "",
          email: detalles.email || funcionario.email,
          estado: detalles.estado || funcionario.estado,
          idcentro_formacion: detalles.centroFormacion?.idcentroFormacion || funcionario.centroFormacion?.idcentroFormacion || 1,
          idregional: detalles.idregional,
          idperfil: detalles.idperfil,
          password: "",
        });
        setEditingId(funcionario.id);
        setShowModal(true);
      } catch (error: unknown) {
        // Error al cargar detalles del funcionario, usar datos básicos
        setFormData({
          nombres: "",
          apellidos: "",
          celular: "",
          numero_documento: "",
          email: funcionario.email,
          estado: funcionario.estado,
          idcentro_formacion: funcionario.centroFormacion?.idcentroFormacion || 1,
          idregional: undefined,
          idperfil: 2,
          password: "",
        });
        setEditingId(funcionario.id);
        setShowModal(true);
      }
    }
  };

  const handleVerDetalle = (funcionario: Funcionario) => {
    setDetalleFuncionario(funcionario);
    setShowDetalle(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setFormError(null);
    setFormData({
      nombres: "",
      apellidos: "",
      celular: "",
      numero_documento: "",
      email: "",
      estado: "activo",
      idcentro_formacion: 1,
      idregional: undefined,
      idperfil: 2,
      password: "",
    });
    setEditingId(null);
  };

  useEffect(() => {
    cargarFuncionarios();
  }, []);

  // --------- COLUMNAS PARA DATATABLE ---------
  const columns: TableColumn<Funcionario>[] = [
    {
      name: "Nombre",
      selector: (row: Funcionario): string =>
        row.nombres && row.apellidos
          ? `${row.nombres} ${row.apellidos}`
          : row.email,
      sortable: true,
      grow: 2,
      cell: (row: Funcionario) =>
        textoCorto(
          row.nombres && row.apellidos
            ? `${row.nombres} ${row.apellidos}`
            : row.email,
          24
        ),
    },
    {
      name: "Estado",
      selector: (row: Funcionario) => row.estado,
      width: "110px",
      center: true,
      cell: (row: Funcionario) => <SemaforoEstado estado={row.estado} />,
    },
    {
      name: "",
      width: "56px",
      center: true,
      cell: (row: Funcionario) => (
        <LupaDetalle onClick={() => handleVerDetalle(row)} />
      ),
      ignoreRowClick: true,
    },
    {
      name: "",
      width: "110px",
      cell: (row: Funcionario) => (
        <div className="d-flex gap-1">
          <Button
            variant="link"
            className="tabla-accion-icono"
            onClick={() => handleEditar(row)}
            title="Editar funcionario"
          >
            <FaEdit />
          </Button>
          <Button
            variant={row.estado === "activo" ? "outline-danger" : "outline-success"}
            size="sm"
            onClick={() => handleToggleStatus(row.id, estadoCanonico(row.estado) === "Activo" ? "Inactivo" : "Activo")}
            title={estadoCanonico(row.estado) === "Activo" ? "Desactivar" : "Activar"}
          >
            {estadoCanonico(row.estado) === "Activo" ? <FaToggleOff /> : <FaToggleOn />}
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <div className="container mt-4 admin-page">
      <div className="mb-4">
        <h2 className="fw-bold">
          {esSede ? "Funcionarios de tu centro" : "Gestión de Funcionarios de Bienestar"}
        </h2>
        <p className="text-muted">
          {esSede
            ? "Creas el funcionario de tu mesa. El centro ya es el tuyo; no eliges otra sede."
            : "Crea un funcionario y elige a qué centro de formación queda asignado."}
        </p>
      </div>
      <MiniGraficas
        barras={{
          titulo: "Funcionarios por regional",
          datos: topN(
            contarPor(
              funcionarios,
              (f) => f.centroFormacion?.regional?.regional || "Sin regional"
            ),
            8
          ),
          horizontal: true,
          unidad: "funcionarios",
        }}
        dona={{
          titulo: "Por estado",
          datos: contarPor(funcionarios, (f) => etiquetaEstado(f.estado)),
        }}
      />
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
          <FaPlus className="me-2" /> Nuevo Funcionario
        </Button>
      </div>
      {/* Tabla con DataTable */}
      <div className="admin-table-shell">
        <DataTable
          columns={columns}
          data={funcionariosFiltrados}
          progressPending={loading}
          progressComponent={<div className="text-center">Cargando...</div>}
          noDataComponent={<div className="text-center text-danger">{error || "No hay funcionarios registrados"}</div>}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 15]}
          paginationComponentOptions={{ noRowsPerPage: false }}
          highlightOnHover
          customStyles={adminTableStyles}
        />
      </div>
      {/* Modales */}
      <CrearFuncionarioModal
        show={showModal && !editingId}
        onHide={resetForm}
        error={formError || undefined}
        loading={formLoading}
        onSuccess={cargarFuncionarios}
      />
      <EditarFuncionarioModal
        show={showModal && !!editingId}
        onHide={resetForm}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        error={formError || undefined}
        loading={formLoading}
      />
      <FuncionarioDetalleModal
        showModal={showDetalle}
        handleClose={() => setShowDetalle(false)}
        funcionario={detalleFuncionario}
      />
    </div>
  );
};

export default Funcionarios;
