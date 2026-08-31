import { useState } from "react";
import toast from "react-hot-toast";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaLock, FaUserGraduate, FaUserTie, FaEye, FaEyeSlash } from "react-icons/fa";
import { api } from "../api";
import { useAuth } from "../context/auth/auth.context";
import type { ResponseType, User } from "../context/auth/types/authTypes";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type FormValues,
} from "../components/LoginForm/models/login.schema";
import { getJornadaGuardada, idDelAprendiz } from "../utils/jornadaAprendiz";
import { esJornada } from "../constants/jornada";
import { SigevaWordmark, SigevaName } from "../components/landing/SigevaMark";
import "./Login.css";

interface Props {
  perfil?: "gestor" | "aprendiz";
}

export default function Login(_props: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const esAprendiz = pathname.includes("login-aprendiz");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const endpoint = esAprendiz
        ? "/api/aprendiz/login"
        : "/api/usuarios/login";
      const res = await api.post<ResponseType<User>>(endpoint, data);

      login(res.data);

      if (res.data.success && res.data.data) {
        switch (res.data.data.perfil) {
          case "Aprendiz": {
            const id = idDelAprendiz(res.data.data);
            const yaEligio =
              esJornada(res.data.data.jornada) ||
              (id ? Boolean(getJornadaGuardada(id)) : false);
            navigate(yaEligio ? "/votaciones" : "/elegir-jornada");
            break;
          }
          case "Funcionario":
            navigate("/dashboard");
            break;
          case "admin_sistema":
            navigate("/dashboard");
            break;
          case "Administrador":
            navigate("/dashboard-admin");
            break;
        }
      }
    } catch {
      toast.error("Credenciales inválidas. Verifica tu correo y contraseña.");
    }
  };

  return (
    <div className="login-page">
      <section className="login-card" aria-label="Inicio de sesión">
        <aside className="login-visual">
          <img
            className="login-visual-photo"
            src="/landing/login-voto.png"
            alt="Aprendices depositando su voto en urna"
          />
          <div className="login-visual-copy">
            <p className="login-visual-kicker">Una voz, un voto</p>
            <h2>
              <SigevaName />
            </h2>
            <p>Sistema de Gestión de Votos para Aprendices. Ético y fácil de usar.</p>
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

          <h1>Iniciar sesión</h1>
          <p className="login-panel-lead">
            Accede para garantizar tu voto de forma confiable y segura.
          </p>

          <div className="login-switch" role="tablist" aria-label="Tipo de usuario">
            <Link
              to="/login-aprendiz"
              className={esAprendiz ? "is-on" : undefined}
              role="tab"
              aria-selected={esAprendiz}
            >
              <FaUserGraduate />
              Aprendiz
            </Link>
            <Link
              to="/login"
              className={!esAprendiz ? "is-on" : undefined}
              role="tab"
              aria-selected={!esAprendiz}
            >
              <FaUserTie />
              Funcionario
            </Link>
          </div>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    id="email"
                    type="email"
                    placeholder="nombreusuario@email.com"
                    {...field}
                    className={errors.email ? "is-invalid" : ""}
                  />
                )}
              />
              {errors.email && <p className="login-error">{errors.email.message}</p>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <div className="password-input-wrapper" style={{ position: "relative" }}>
                    <Form.Control
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      {...field}
                      className={errors.password ? "is-invalid" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#6c757d",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                        zIndex: 5
                      }}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                )}
              />
              {errors.password && (
                <p className="login-error">{errors.password.message}</p>
              )}
            </Form.Group>

            <Button type="submit" className="login-submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Ingresando..." : "Ingresar"}</span>
              <FaArrowRight />
            </Button>
          </Form>

          <Link
            to={`/recuperar-contrasena?desde=${esAprendiz ? "aprendiz" : "funcionario"}`}
            className="login-recover"
          >
            <FaLock /> Recuperar contraseña
          </Link>

          <div className="login-steps" aria-hidden>
            <i />
            <span />
          </div>

          <Link to="/" className="login-devolver">
            <FaArrowLeft />
            <span>Devolver</span>
          </Link>
        </div>
      </section>
    </div>
  );
}