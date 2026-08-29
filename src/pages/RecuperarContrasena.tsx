import { useState } from "react";
import toast from "react-hot-toast";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaUser } from "react-icons/fa";
import { api } from "../api";
import { SigevaWordmark } from "../components/landing/SigevaMark";
import "./Login.css";

export default function RecuperarContrasena() {
  const [params] = useSearchParams();
  const esFuncionario = params.get("desde") === "funcionario";
  const volverA = esFuncionario ? "/login" : "/login-aprendiz";
  const [documento, setDocumento] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const validar = (valor: string) => {
    if (!valor.trim()) return "El número de documento es obligatorio";
    if (!/^[0-9]{6,15}$/.test(valor.trim())) {
      return "Ingresa un número de documento válido (6 a 15 dígitos)";
    }
    return "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mensaje = validar(documento);
    if (mensaje) {
      setError(mensaje);
      return;
    }

    setError("");
    setEnviando(true);
    try {
      const endpoint = esFuncionario
        ? "/api/usuarios/recuperar-contrasena"
        : "/api/aprendiz/recuperar-contrasena";
      await api.post(endpoint, { numero_documento: documento.trim() });
    } catch {
      /* Si el back aún no tiene el endpoint, no revelamos si el documento existe. */
    } finally {
      setEnviando(false);
      toast.success(
        "Si el documento está registrado, te enviaremos las instrucciones para restablecer tu contraseña."
      );
    }
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
          <p className="login-panel-lead">
            Ingresa tu número de documento y te enviaremos instrucciones para restablecer tu
            contraseña.
          </p>

          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Número de documento</Form.Label>
              <div className="login-input-icon">
                <FaUser />
                <Form.Control
                  id="documento"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="Ingresa tu número de documento"
                  value={documento}
                  onChange={(ev) => {
                    setDocumento(ev.target.value.replace(/\D/g, ""));
                    if (error) setError("");
                  }}
                  className={error ? "is-invalid" : ""}
                />
              </div>
              {error ? <p className="login-error">{error}</p> : null}
            </Form.Group>

            <Button type="submit" className="login-submit login-submit-icon" disabled={enviando}>
              <FaEnvelope />
              <span>{enviando ? "Enviando..." : "Enviar instrucciones"}</span>
            </Button>
          </Form>

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
