import { useEffect, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { CrearFuncionarioModal } from "./modals/CrearFuncionarioModal";
import { api } from "../../api";
import { ADMIN_PALETTE } from "../../theme/tokens";
import { adminTableStyles } from "../../theme/adminTableStyles";
import { SemaforoEstado, textoCorto } from "../../components/tabla/detalleTabla";
import { listaDe, mensajeApi, nombreDeCentro } from "../../utils/centro";

type AdminCentro = {
  id: number;
  nombres?: string;
  apellidos?: string;
  email: string;
  estado: string;
  idcentro_formacion?: number;
  centroFormacion?: Record<string, unknown>;
};

export default function AdminsCentro() {
  const [admins, setAdmins] = useState<AdminCentro[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const response = await api.get("api/usuarios/admin-sistema");
      setAdmins(listaDe<AdminCentro>(response.data));
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
  };

  useEffect(() => {
    void cargar();
  }, []);

  const filtrados = admins.filter((row) => {
    const q = busqueda.toLowerCase();
    const nombre = `${row.nombres || ""} ${row.apellidos || ""}`.toLowerCase();
    const centro = nombreDeCentro(row.centroFormacion).toLowerCase();
    return (
      row.email.toLowerCase().includes(q) ||
      nombre.includes(q) ||
      centro.includes(q)
    );
  });

  const columns: TableColumn<AdminCentro>[] = [
    {
      name: "Nombre",
      selector: (row) =>
        row.nombres && row.apellidos ? `${row.nombres} ${row.apellidos}` : row.email,
      sortable: true,
      grow: 2,
      cell: (row) =>
        textoCorto(
          row.nombres && row.apellidos ? `${row.nombres} ${row.apellidos}` : row.email,
          24
        ),
    },
    {
      name: "Centro",
      selector: (row) => nombreDeCentro(row.centroFormacion) || String(row.idcentro_formacion || ""),
      sortable: true,
      grow: 2,
      cell: (row) =>
        textoCorto(nombreDeCentro(row.centroFormacion) || `Centro ${row.idcentro_formacion || ""}`, 28),
    },
    {
      name: "Estado",
      selector: (row) => row.estado,
      width: "110px",
      center: true,
      cell: (row) => <SemaforoEstado estado={row.estado} />,
    },
  ];

  return (
    <div className="container mt-4 admin-page">
      <div className="mb-4">
        <h2 className="fw-bold">Admin de centro</h2>
        <p className="text-muted">
          Un administrador por sede. Eliges el centro al crearlo. Ese usuario opera solo su centro
          y puede crear los funcionarios de esa mesa.
        </p>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="w-50">
          <InputGroup>
            <InputGroup.Text className="bg-white">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Buscar por nombre, correo o centro..."
              className="border-start-0"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center"
        >
          <FaPlus className="me-2" /> Nuevo admin de centro
        </Button>
      </div>
      <div className="admin-table-shell">
        <DataTable
          columns={columns}
          data={filtrados}
          progressPending={loading}
          progressComponent={<div className="text-center">Cargando...</div>}
          noDataComponent={<div className="text-center">No hay admin de centro registrados</div>}
          pagination
          paginationPerPage={5}
          highlightOnHover
          customStyles={adminTableStyles}
        />
      </div>
      <CrearFuncionarioModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={cargar}
        tipo="admin_sistema"
      />
    </div>
  );
}
