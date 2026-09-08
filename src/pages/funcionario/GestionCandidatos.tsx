import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/auth/auth.context";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import AgregarCandidatoModal from "../../components/candidatos/AgregarCandidatoModal";
import ModificarCandidatoModal from '../../components/candidatos/ModificarCandidatoModal';
import { api } from "../../api";
import { useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { JORNADAS, type Jornada } from "../../constants/jornada";
import {
  DetalleFilaModal,
  LupaDetalle,
  textoCorto,
} from "../../components/tabla/detalleTabla";
import { MiniGraficas, contarPor } from "../../components/graficas/MiniGraficas";

interface Eleccion {
  ideleccion: number;
  nombre: string;
}
interface Programa {
  idprogramaFormacion: number;
  idnivelFormacion: number;
  idareaTematica: number;
  programa: string;
  codigoPrograma: string;
  version: string;
  duracion: number;
}
interface Aprendiz {
  idaprendiz: number;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  programa: Programa;
  email: string;
}
interface Candidato {
  idcandidatos: number;
  ideleccion: number;
  idaprendiz: number;
  nombres: string;
  numeroTarjeton: string;
  propuesta: string;
  foto: string;
  jornada: string;
}

const GestionCandidatos = () => {
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalModificar, setShowModalModificar] = useState(false);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<any | null>(null);
  const [ficha, setFicha] = useState<Candidato | null>(null);
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const { idEleccion } = useParams<{ idEleccion: string }>();
  const [nombreEleccion, setNombreEleccion] = useState("");
  const idCentro = user?.centroFormacion ?? user?.CentroFormacion;

  const fetchCandidatos = useCallback(async () => {
    if (!isAuthenticated || !user || !idEleccion) return;

    try {
      setLoading(true);
      const res = await api.get(`/api/candidatos/listar/${idEleccion}`);
      setCandidatos(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, idEleccion]);

  useEffect(() => {
    const fetchAprendices = async () => {
      if (!idCentro) return;
      try {
        const res = await api.get(`/api/aprendiz/inscritos/centro/${idCentro}`);
        setAprendices(res.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchElecciones = async () => {
      if (!idCentro) return;
      try {
        const res = await api.get(`/api/eleccion/centrof/${idCentro}`);
        setNombreEleccion(
          res.data.data.find((e: Eleccion) => e.ideleccion === Number(idEleccion))?.nombre || ""
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchElecciones();
    fetchCandidatos();
    fetchAprendices();
  }, [isAuthenticated, idCentro, idEleccion, fetchCandidatos]);

  if (!isAuthenticated) {
    return <p>Debes iniciar sesión para gestionar candidatos</p>;
  }

  const onEditar = async (id: number) => {
    try {
      const response = await api.put(`/api/candidatos/actualizar/${id}`);
      const candidato = response.data.data;
      setCandidatoSeleccionado(candidato);
      setShowModalModificar(true);
    } catch (error: any) {
      console.error("Error al obtener candidato:", error.response?.data || error.message);
      alert("No se pudo cargar el candidato");
    }
  };

  const onEliminar = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este candidato?")) {
      try {
        setLoading(true);
        const response = await api.delete(`/api/candidatos/eliminar/${id}`);

        if (response.status === 200) {
          setCandidatos((prev) => prev.filter((c) => c.idcandidatos !== id));
          alert("Candidato eliminado correctamente");
        } else {
          throw new Error("Error al eliminar el candidato");
        }
      } catch (error) {
        console.error("Error al eliminar el candidato:", error);
        alert("Ocurrió un error al eliminar el candidato");
      } finally {
        setLoading(false);
      }
    }
  };

  const renderFila = (c: Candidato) => (
    <tr key={c.idcandidatos}>
      <td className="ps-4">
        <img
          src={
            c.foto && c.foto.trim() !== ""
              ? c.foto
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  c.nombres
                )}&background=random&size=128&rounded=true&bold=true&format=png`
          }
          alt={`${c.nombres}`}
          className="rounded-circle"
          style={{
            width: 48,
            height: 48,
            objectFit: "cover",
          }}
        />
      </td>
      <td className="fw-semibold">{textoCorto(c.nombres, 22)}</td>
      <td className="text-muted">{c.numeroTarjeton || "Sin tarjetón"}</td>
      <td className="text-muted">{textoCorto(c.propuesta, 28)}</td>
      <td>
        <div className="d-flex justify-content-center gap-2">
          <LupaDetalle onClick={() => setFicha(c)} />
          <button
            className="btn btn-sm p-0 border-0 text-primary"
            title="Editar"
            onClick={() => onEditar(c.idcandidatos)}
          >
            <FiEdit2 size={18} />
          </button>
          <button
            className="btn btn-sm p-0 border-0 text-danger"
            title="Eliminar"
            onClick={() => onEliminar(c.idcandidatos)}
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h2 className="fw-bold m-0">{nombreEleccion}</h2>
        <button
          className="btn btn-gradient d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FiPlus size={18} />
          Agregar Candidato
        </button>
      </div>

      {loading && candidatos.length === 0 ? (
        <p className="text-muted">Cargando candidatos...</p>
      ) : null}

      <MiniGraficas
        barras={{
          titulo: "Candidatos por jornada",
          datos: contarPor(candidatos, (c) => c.jornada || "Sin jornada"),
          unidad: "candidatos",
        }}
        dona={{
          titulo: "Distribución por jornada",
          datos: contarPor(candidatos, (c) => c.jornada || "Sin jornada"),
        }}
      />

      {JORNADAS.map((jornada: Jornada) => {
        const lista = candidatos.filter((c) => c.jornada === jornada);
        return (
          <div className="card border-0 shadow-sm mb-4" key={jornada}>
            <div className="card-body p-0">
              <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
                <h4 className="fw-bold m-0">Jornada {jornada}</h4>
                <span className="text-muted">{lista.length} candidato(s)</span>
              </div>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4" style={{ width: 90 }}>Foto</th>
                      <th>Nombre Completo</th>
                      <th>Numero voto</th>
                      <th>Propuesta</th>
                      <th className="text-center" style={{ width: 120 }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-muted text-center py-4">
                          No hay candidatos de jornada {jornada}.
                        </td>
                      </tr>
                    ) : (
                      lista.map(renderFila)
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      <div className="d-flex justify-content-end p-3">
        <button className="btn btn-secondary" onClick={() => window.history.back()}>
          Regresar
        </button>
      </div>

      <Toaster />

      {candidatoSeleccionado && (
        <ModificarCandidatoModal
          show={showModalModificar}
          onHide={() => setShowModalModificar(false)}
          candidato={candidatoSeleccionado}
          onSave={() => {
            fetchCandidatos();
            setShowModalModificar(false);
          }}
          aprendices={aprendices || []}
        />
      )}

      <AgregarCandidatoModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={() => {
          setShowModal(false);
          fetchCandidatos();
        }}
        aprendices={aprendices || []}
        idEleccion={idEleccion ? parseInt(idEleccion) : undefined}
      />

      <DetalleFilaModal
        show={!!ficha}
        onHide={() => setFicha(null)}
        titulo="Información del candidato"
        campos={
          ficha
            ? [
                { etiqueta: "Nombre", valor: ficha.nombres },
                { etiqueta: "Tarjetón", valor: ficha.numeroTarjeton || "Sin tarjetón" },
                { etiqueta: "Jornada", valor: ficha.jornada },
                { etiqueta: "Propuesta", valor: ficha.propuesta },
              ]
            : []
        }
      />

      <style>{`
        .card { border-radius: 14px; }
        thead tr th { border-top: none; }
        tbody tr td { vertical-align: middle; }
        @media (max-width: 768px) {
          td:nth-child(4) { display:none; }
          th:nth-child(4) { display:none; }
        }
      `}</style>
    </div>
  );
};

export default GestionCandidatos;
