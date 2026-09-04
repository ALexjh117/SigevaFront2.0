import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { api } from "../../api";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth/auth.context";
import { esAdministradorRed } from "../../utils/roles";
import { adminTableStyles } from "../../theme/adminTableStyles";
import {
  DetalleFilaModal,
  LupaDetalle,
  SemaforoEstado,
  etiquetaEstado,
  textoCorto,
} from "../../components/tabla/detalleTabla";
import { MiniGraficas, contarPor, topN } from "../../components/graficas/MiniGraficas";
import { etiquetaAnidada } from "../../utils/comoLista";

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
  centro_formacion: any;
  grupo: any;
  programa: any;
}

const Aprendices: React.FC = () => {
  const navigate = useNavigate();
  const [buscar, setBuscar] = useState("");
  const [aprendices, setAprendices] = useState<AprendizResponse[]>([]);
  const [detalle, setDetalle] = useState<AprendizResponse | null>(null);
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);

  useEffect(() => {
    const loadData = async () => {
      if (!esAdministradorRed(user?.perfil) && !user?.centroFormacion) {
        return;
      }
      try {
        const path = esRed
          ? "api/aprendiz/listar"
          : `api/aprendiz/inscritos/centro/${user?.centroFormacion}`;
        const res = await api.get(path);
        esRed ? setAprendices(res.data) : setAprendices(res.data.data);
      } catch (error) {
        console.error("Error al cargar las votaciones:", error);
      }
    };
    loadData();
  }, [user?.centroFormacion, user?.perfil, esRed]);

  const filteredData = aprendices.filter((a) =>
    [a.nombres, a.apellidos, a.numeroDocumento, a.email]
      .join(" ")
      .toLowerCase()
      .includes(buscar.toLowerCase())
  );

  const columns: TableColumn<AprendizResponse>[] = [
    {
      name: "Nombre",
      selector: (row) => `${row.nombres} ${row.apellidos}`,
      sortable: true,
      grow: 2,
      cell: (row) => textoCorto(`${row.nombres} ${row.apellidos}`, 22),
    },
    {
      name: "Estado",
      selector: (row) => row.estado,
      sortable: true,
      width: "130px",
      cell: (row) => <SemaforoEstado estado={row.estado} />,
    },
    {
      name: "",
      width: "56px",
      center: true,
      cell: (row) => (
        <LupaDetalle onClick={() => setDetalle(row)} />
      ),
      ignoreRowClick: true,
    },
    {
      name: "",
      width: "56px",
      center: true,
      cell: (row) => (
        <Button
          variant="link"
          className="tabla-accion-icono"
          title="Editar aprendiz"
          onClick={() => navigate("/aprendiz-form", { state: { aprendiz: row } })}
        >
          <FaEdit />
        </Button>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <Container fluid className="p-4 admin-page">
      <Row className="mb-3 align-items-center">
        <Col>
          <h3 className="fw-bold">
            Gestión de <span className="app-accent">Aprendices</span>
          </h3>
          <p className="text-muted mb-0">
            {esRed
              ? "Aprendices de la red habilitados para votar."
              : "Aprendices de tu centro de formación habilitados para votar."}
          </p>
        </Col>
      </Row>

      <MiniGraficas
        barras={{
          titulo: esRed ? "Aprendices por centro" : "Aprendices por programa",
          datos: topN(
            contarPor(
              aprendices,
              (a) =>
                (esRed
                  ? etiquetaAnidada(a.centro_formacion)
                  : etiquetaAnidada(a.programa, ["programa"])) || "Sin dato"
            ),
            8
          ),
          horizontal: true,
          unidad: "aprendices",
        }}
        dona={{
          titulo: "Por estado",
          datos: contarPor(aprendices, (a) => etiquetaEstado(a.estado)),
        }}
      />

      <Row className="mb-3 d-flex justify-content-between">
        <Col sm={6}>
          <Form.Control
            type="text"
            placeholder="Buscar..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={() => navigate("/aprendiz-form")}
          >
            <AiOutlinePlusCircle className="me-2 fs-3" />
            Nuevo Aprendiz
          </Button>
        </Col>
      </Row>

      <div className="admin-table-shell">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          striped
          customStyles={adminTableStyles}
        />
      </div>

      <DetalleFilaModal
        show={!!detalle}
        onHide={() => setDetalle(null)}
        titulo="Información del aprendiz"
        campos={
          detalle
            ? [
                { etiqueta: "Nombre", valor: `${detalle.nombres} ${detalle.apellidos}` },
                { etiqueta: "Documento", valor: `${detalle.tipoDocumento} ${detalle.numeroDocumento}` },
                { etiqueta: "Correo", valor: detalle.email },
                { etiqueta: "Celular", valor: detalle.celular },
                { etiqueta: "Centro de formación", valor: detalle.centro_formacion?.centroFormacioncol },
                { etiqueta: "Programa", valor: detalle.programa?.programa },
                { etiqueta: "Grupo", valor: detalle.grupo?.grupo },
                { etiqueta: "Estado", valor: <SemaforoEstado estado={detalle.estado} conTexto /> },
              ]
            : []
        }
      />

      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">
          Mostrando {filteredData.length} de {aprendices.length} resultados
        </small>
      </div>
    </Container>
  );
};

export default Aprendices;
