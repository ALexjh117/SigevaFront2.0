import Modal from "react-bootstrap/Modal";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import { useAuth } from "../../context/auth/auth.context";
import Swal from "sweetalert2";
import { FaTimes, FaEnvelope } from "react-icons/fa";
import { ADMIN_PALETTE } from "../../theme/tokens";
import { comoLista } from "../../utils/comoLista";
import { candidatosYaVotados, eleccionYaVotada } from "../../utils/votoAprendiz";

interface Props {
  show: boolean;
  onHide: () => void;
  yaVoto?: boolean;
  candidato: {
    nombre: string;
    programa: string;
    propuesta: string;
    foto: string;
    numeroTarjeton: string;
    idCandidato: string;
  } | null;
}

export default function SelecionarCandidato({
  show,
  onHide,
  candidato,
  yaVoto = false,
}: Props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shotModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { user } = useAuth();

  if (!candidato) return null;

  /**
   * generar OTP en servidor
   * devuelve true si se generó correctamente, false en caso contrario
   */
  const enviarOTP = async () => {
    
    try {
      const payload = {
        aprendiz_idaprendiz: user?.id,
        elecciones_ideleccion: id,
      };
     

      await api.post("/api/validaciones/generarOtp", payload);
  
      // si tu backend devuelve algo útil, lo verás en response.data
      

      // devuelve true para indicar éxito (ajusta según tu API)
      return true;
    } catch (error: any) {
      // intentamos extraer info útil del error
      console.error("[enviarOTP] error al generar OTP:", error);
      console.error("[enviarOTP] error.message:", error?.message);
      console.error(
        "[enviarOTP] error.response?.status:",
        error?.response?.status
      );
      console.error("[enviarOTP] error.response?.data:", error?.response?.data);

      // muestra Swal con más detalles si están disponibles
      const serverMsg =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message;
      Swal.fire({
        title: "No se pudo enviar el código",
        text: String(serverMsg),
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });

      return false;
    }
  };

  /**
   * manejador que espera a que enviarOTP termine antes de abrir modal
   */
  const cerrarOtp = () => {
    setShowModal(false);
    setOtp("");
  };

  const handleVoteClick = async () => {
    if (yaVoto) {
      Swal.fire({
        title: "Ya votaste",
        text: "En esta elección solo puedes votar una vez. Cambiar de jornada no abre otro voto.",
        icon: "info",
        confirmButtonText: "Entendido",
        confirmButtonColor: ADMIN_PALETTE.confirm,
      });
      return;
    }
    if (enviando) return;
    setEnviando(true);
    const ok = await enviarOTP();
    setEnviando(false);
    if (ok) {
      onHide();
      setShowModal(true);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (yaVoto) return;
   
    if (!/^[A-Za-z0-9_-]{6}$/.test(otp)) {
      return Swal.fire({
        title: "Tu código OTP debe tener 6 caracteres alfanuméricos",
        icon: "error",
        confirmButtonText: "Intentar de nuevo",
      });
    }

    try {
      
      const { data } = await api.post("api/validaciones/validarOtp", {
        codigo_otp: otp,
      });
      
      if (data.success === true) {
        try {
          const [votados, candRes] = await Promise.all([
            candidatosYaVotados(Number(user?.id)),
            api.get(`/api/candidatos/listar/${id}`),
          ]);
          if (eleccionYaVotada(comoLista(candRes.data), votados)) {
            Swal.fire({
              title: "Ya votaste",
              text: "En esta elección solo puedes votar una vez. Cambiar de jornada no abre otro voto.",
              icon: "info",
              confirmButtonText: "Entendido",
              confirmButtonColor: ADMIN_PALETTE.confirm,
            }).then(() => navigate("/votaciones"));
            return;
          }
          console.log(
            "[submit] registrando voto. candidatoId:",
            candidato.idCandidato,
            "aprendiz:",
            user?.id,
            "eleccionId:",
            id
          );
          const { data: votoResp } = await api.post(
            "/api/votoXCandidato/crear/",
            {
              idcandidatos: Number(candidato.idCandidato),
              idaprendiz: Number(user?.id),
              contador: 1,
              ideleccion: Number(id),
            }
          );

         
          if (votoResp.mensaje === "Éxito") {
            Swal.fire({
              title: "Tu voto fue registrado con éxito",
              icon: "success",
              confirmButtonText: "Volver",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/votaciones");
              }
            });
          } else {
            Swal.fire({
              title: "Error. Ya votaste, no puedes volver a votar.",
              icon: "error",
              confirmButtonText: "Intentar de nuevo",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/votaciones");
              }
            });
          }
        } catch (error: any) {
          console.error("[submit] error al crear voto:", error);
          console.error(
            "[submit] error.response?.data:",
            error?.response?.data
          );
          Swal.fire({
            title: "Tu Voto No Fue Registrado, Intenta nuevamente",
            text: String(error?.response?.data || error?.message),
            icon: "error",
            confirmButtonText: "Intentar de nuevo",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/votaciones");
            }
          });
        }
      } else {
        Swal.fire({
          title: "Código incorrecto",
          text: "Revisa el correo e inténtalo de nuevo. El modal se queda abierto.",
          icon: "error",
          confirmButtonText: "Seguir aquí",
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Código incorrecto",
        text: String(error?.response?.data || error?.message),
        icon: "error",
        confirmButtonText: "Seguir aquí",
      });
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={() => {
          if (!enviando) onHide();
        }}
        centered
        scrollable
        size="lg"
        dialogClassName="apz-modal apz-modal--ficha"
      >
        <Modal.Header className="apz-ficha-head">
          <button
            type="button"
            className="apz-modal-x"
            aria-label="Cerrar"
            onClick={onHide}
            disabled={enviando}
          >
            <FaTimes />
          </button>
          <img src={candidato.foto} alt="" className="apz-ficha-foto" />
          <div className="apz-ficha-id">
            <p className="admin-dash-eyebrow mb-1">Tarjetón {candidato.numeroTarjeton}</p>
            <h2>{candidato.nombre}</h2>
            <p>{candidato.programa}</p>
          </div>
        </Modal.Header>
        <Modal.Body className="apz-ficha-body">
          <p className="admin-dash-eyebrow mb-2">Propuesta</p>
          {candidato.propuesta?.trim() ? (
            <p className="apz-ficha-propuesta">{candidato.propuesta}</p>
          ) : (
            <p className="apz-ficha-propuesta is-empty">
              Este candidato aún no publicó propuesta.
            </p>
          )}
          {yaVoto ? (
            <p className="apz-ficha-propuesta" style={{ marginTop: "1rem" }}>
              Ya votaste en esta elección. Cambiar de jornada no te deja votar otra vez.
            </p>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="apz-modal-actions apz-modal-actions--footer">
          {yaVoto ? (
            <button type="button" className="apz-btn apz-btn--ghost" onClick={onHide}>
              Cerrar
            </button>
          ) : (
            <>
              <button type="button" className="apz-btn apz-btn--ghost" onClick={onHide} disabled={enviando}>
                Cancelar
              </button>
              <button type="button" className="apz-btn" onClick={handleVoteClick} disabled={enviando}>
                {enviando ? (
                  <>
                    <span className="spinner-border spinner-border-sm" aria-hidden />
                    Enviando código…
                  </>
                ) : (
                  "Votar por este candidato"
                )}
              </button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={shotModal} centered dialogClassName="apz-modal apz-modal--otp" onHide={cerrarOtp}>
        <Modal.Body className="apz-modal-body">
          <button type="button" className="apz-modal-x" aria-label="Cerrar" onClick={cerrarOtp}>
            <FaTimes />
          </button>
          <div className="apz-otp">
            <div className="apz-otp-icon" aria-hidden>
              <FaEnvelope />
            </div>
            <p className="admin-dash-eyebrow">Paso final</p>
            <h2>Confirma tu voto</h2>
            <p>
              Enviamos un código de 6 caracteres a tu correo. Escríbelo para
              registrar el voto. Nadie verá por quién votaste.
            </p>
            <Form onSubmit={submit}>
              <Form.Group className="mb-4">
                <Form.Control
                  type="text"
                  inputMode="text"
                  autoFocus
                  maxLength={6}
                  placeholder="------"
                  autoComplete="one-time-code"
                  className="apz-otp-input"
                  onChange={(e) => setOtp(e.target.value.trim())}
                  value={otp}
                />
              </Form.Group>
              <button type="submit" className="apz-btn" disabled={otp.length !== 6}>
                Confirmar voto
              </button>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
