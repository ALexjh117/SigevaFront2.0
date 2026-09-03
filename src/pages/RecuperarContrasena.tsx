import { useState } from "react";
import toast from "react-hot-toast";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheck,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaLock,
} from "react-icons/fa";
import {
  confirmarRecuperacion,
  errorRecuperacion,
  rutaLoginSegunPerfil,
  solicitarRecuperacion,
} from "../api/recuperarPassword";
import { SigevaWordmark } from "../components/landing/SigevaMark";
import "./Login.css";

type Paso = "email" | "codigo" | "exito";

function correoValido(valor: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

export default function RecuperarContrasena() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const esFuncionario = params.get("desde") === "funcionario";
  const volverA = esFuncionario ? "/login" : "/login-aprendiz";

  const [paso, setPaso] = useState<Paso>("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [repetirPassword, setRepetirPassword] = useState("");
  const [expiraEnMinutos, setExpiraEnMinutos] = useState(5);
  const [perfil, setPerfil] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [verRepetir, setVerRepetir] = useState(false);

  const limpiarClaves = () => {
    setCodigo("");
    setNuevaPassword("");
    setRepetirPassword("");
    setError("");
  };

  const pedirCodigo = async (correo: string) => {
    const res = await solicitarRecuperacion(correo);
    setEmail(correo);
    setExpiraEnMinutos(res.data.expira_en_minutos);
    setPaso("codigo");
    toast.success(
      `Revisa tu correo. El código caduca en ${res.data.expira_en_minutos} minutos.`
    );
  };

  const onSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    const correo = email.trim();
    if (!correo) {
      setError("El correo es obligatorio");
      return;
    }
    if (!correoValido(correo)) {
      setError("Ingresa un correo válido");
      return;
    }

    setError("");
    setEnviando(true);
    try {
      await pedirCodigo(correo);
    } catch (err) {
      const { message } = errorRecuperacion(err);
      setError(message);
      toast.error(message);
    } finally {
      setEnviando(false);
    }
  };

  const onReenviar = async () => {
    setError("");
    setEnviando(true);
    try {
      await pedirCodigo(email.trim());
      setCodigo("");
    } catch (err) {
      const { message } = errorRecuperacion(err);
      setError(message);
      toast.error(message);
    } finally {
      setEnviando(false);
    }
  };

  const onConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = codigo.trim();
    if (otp.length !== 6) {
      setError("El código debe tener 6 caracteres");
      return;
    }
    if (nuevaPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (nuevaPassword.length > 72) {
      setError("La contraseña no puede superar 72 caracteres");
      return;
    }
    if (nuevaPassword !== repetirPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    setEnviando(true);
    try {
      const res = await confirmarRecuperacion({
        email: email.trim(),
        codigo: otp,
        nueva_password: nuevaPassword,
      });
      setPerfil(res.data.perfil);
      setPaso("exito");
      toast.success(res.message);
    } catch (err) {
      const { message, codigo_error } = errorRecuperacion(err);
      if (codigo_error === "CUENTA_NO_ENCONTRADA") {
        limpiarClaves();
        setPaso("email");
      }
      setError(message);
      toast.error(message);
    } finally {
      setEnviando(false);
    }
  };

  const irAOtroCorreo = () => {
    limpiarClaves();
    setPaso("email");
  };

  return (
    <div className="login-page">
      <section className="login-card" aria-label="Recuperar contraseña">
        <aside className="login-visual login-visual--recover">
          <picture>
            <source srcSet="/landing/recuperar-acceso.webp" type="image/webp" />
            <img
              className="login-visual-photo"
              src="/landing/recuperar-acceso.jpg"
              alt="Aprendices consultando SIGEVA en un computador"
            />
          </picture>
          <div className="login-visual-copy">
            <p className="login-visual-kicker">Recupera tu acceso,</p>
            <h2 className="login-visual-headline">Sigue participando</h2>
            <p>Restablece tu contraseña y continúa haciendo parte de SIGEVA.</p>
          </div>
        </aside>

        <div className="login-panel">
          <div className="login-panel-brands">
            <div className="login-brand-sigeva">
              <SigevaWordmark />
              <small>Sistema Electoral SENA</small>
            </div>
            <span className="login-brand-sep" aria-hidden />
            <img
              src="/logo_fabrica.png"
              alt="Fábrica de Software SENA"
              className="login-brand-fab"
            />
          </div>

          <h1 className="login-panel-title">
            Recuperar <span>contraseña</span>
          </h1>

          {paso === "email" ? (
            <>
              <p className="login-panel-lead">
                Escribe el correo de tu cuenta. Te enviaremos un código de 6 caracteres.
              </p>

              <Form onSubmit={onSolicitar}>
                <Form.Group className="mb-4">
                  <Form.Label>Correo electrónico</Form.Label>
                  <div className="login-input-icon">
                    <FaEnvelope />
                    <Form.Control
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nombreusuario@email.com"
                      value={email}
                      onChange={(ev) => {
                        setEmail(ev.target.value);
                        if (error) setError("");
                      }}
                      className={error ? "is-invalid" : ""}
                    />
                  </div>
                  {error ? <p className="login-error">{error}</p> : null}
                </Form.Group>

                <Button
                  type="submit"
                  className="login-submit login-submit-icon"
                  disabled={enviando}
                >
                  <FaEnvelope />
                  <span>{enviando ? "Enviando..." : "Enviar código"}</span>
                </Button>
              </Form>
            </>
          ) : null}

          {paso === "codigo" ? (
            <>
              <p className="login-panel-lead">
                Enviamos el código a {email}. Caduca en {expiraEnMinutos} minutos.
              </p>

              <Form onSubmit={onConfirmar}>
                <Form.Group className="mb-3">
                  <Form.Label>Código</Form.Label>
                  <div className="login-input-icon login-otp">
                    <FaKey />
                    <Form.Control
                      id="codigo"
                      type="text"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="ABC123"
                      value={codigo}
                      onChange={(ev) => {
                        setCodigo(ev.target.value.toUpperCase());
                        if (error) setError("");
                      }}
                      className={error ? "is-invalid" : ""}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nueva contraseña</Form.Label>
                  <div className="password-input-wrapper" style={{ position: "relative" }}>
                    <div className="login-input-icon">
                      <FaLock />
                      <Form.Control
                        id="nueva_password"
                        type={verClave ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        value={nuevaPassword}
                        onChange={(ev) => {
                          setNuevaPassword(ev.target.value);
                          if (error) setError("");
                        }}
                        className={error ? "is-invalid" : ""}
                      />
                    </div>
                    <button
                      type="button"
                      className="login-eye"
                      onClick={() => setVerClave((v) => !v)}
                      aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {verClave ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Repetir contraseña</Form.Label>
                  <div className="password-input-wrapper" style={{ position: "relative" }}>
                    <div className="login-input-icon">
                      <FaLock />
                      <Form.Control
                        id="repetir_password"
                        type={verRepetir ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Confirma tu contraseña"
                        value={repetirPassword}
                        onChange={(ev) => {
                          setRepetirPassword(ev.target.value);
                          if (error) setError("");
                        }}
                        className={error ? "is-invalid" : ""}
                      />
                    </div>
                    <button
                      type="button"
                      className="login-eye"
                      onClick={() => setVerRepetir((v) => !v)}
                      aria-label={
                        verRepetir ? "Ocultar contraseña" : "Mostrar contraseña"
                      }
                    >
                      {verRepetir ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {error ? <p className="login-error">{error}</p> : null}
                </Form.Group>

                <Button
                  type="submit"
                  className="login-submit login-submit-icon"
                  disabled={enviando}
                >
                  <FaLock />
                  <span>{enviando ? "Guardando..." : "Cambiar contraseña"}</span>
                </Button>
              </Form>

              <div className="login-alt-actions">
                <button
                  type="button"
                  className="login-recover"
                  onClick={onReenviar}
                  disabled={enviando}
                >
                  Reenviar código
                </button>
                <button type="button" className="login-recover" onClick={irAOtroCorreo}>
                  Usar otro correo
                </button>
              </div>
            </>
          ) : null}

          {paso === "exito" ? (
            <>
              <p className="login-panel-lead">Contraseña actualizada.</p>
              <p className="login-success-copy">
                Ya puedes entrar con tu nueva clave
                {perfil ? ` como ${perfil}` : ""}.
              </p>
              <Button
                type="button"
                className="login-submit login-submit-icon"
                onClick={() => navigate(rutaLoginSegunPerfil(perfil))}
              >
                <FaCheck />
                <span>Iniciar sesión</span>
              </Button>
            </>
          ) : null}

          <div className="login-rule" aria-hidden>
            <i />
          </div>

          <Link to={volverA} className="login-devolver login-submit-icon">
            <FaArrowLeft />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
