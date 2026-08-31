import toast from "react-hot-toast";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/auth/auth.context";
import type { ResponseType, User } from "../context/auth/types/authTypes";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  type FormValues,
} from "../components/LoginForm/models/login.schema";
import { getJornadaGuardada } from "../utils/jornadaAprendiz";
import "./Login.css";

interface Props {
  perfil?: "gestor" | "aprendiz";
}

export default function Login(_props: Props) {
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
          case "Aprendiz":
            navigate(
              getJornadaGuardada(res.data.data.id) ? "/votaciones" : "/elegir-jornada"
            );
            break;
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
    } catch (error) {
      toast.error("Credenciales inválidas. Verifica tu correo y contraseña.");
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="login-back">
        ← Volver al inicio
      </Link>

      <section className="login-card" aria-label="Inicio de sesión">
        <aside className="login-visual">
          <img
            src="/landing/login-voto.png"
            alt="Aprendices depositando su voto en urna"
          />
          <div className="login-visual-copy">
            <div className="login-brands">
              <div className="login-brands-chip">
                <img src="/logo_fabrica.png" alt="Fábrica de Software SENA" />
                <span className="login-brands-sep" aria-hidden />
                <img src="/sena.png" alt="SENA" />
              </div>
            </div>
            <p className="login-visual-kicker">Una voz, un voto</p>
            <h2>SIGEVA</h2>
            <p>Sistema de Gestión de Votos para Aprendices. Entre y elija con claridad.</p>
          </div>
        </aside>

        <div className="login-panel">
          <h1>Iniciar sesión</h1>
          <p className="login-panel-lead">
            {esAprendiz
              ? "Acceso para aprendices. Use su correo institucional para votar."
              : "Acceso para funcionarios y administradores de la red."}
          </p>

          <div className="login-switch" role="tablist" aria-label="Tipo de usuario">
            <Link
              to="/login-aprendiz"
              className={esAprendiz ? "is-on" : undefined}
              role="tab"
              aria-selected={esAprendiz}
            >
              Aprendiz
            </Link>
            <Link
              to="/login"
              className={!esAprendiz ? "is-on" : undefined}
              role="tab"
              aria-selected={!esAprendiz}
            >
              Funcionario
            </Link>
          </div>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Correo electrónico</strong>
              </Form.Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    id="email"
                    type="email"
                    placeholder="Ingrese su correo electrónico"
                    {...field}
                    className={errors.email ? "is-invalid" : ""}
                  />
                )}
              />
              {errors.email && (
                <p className="login-error">{errors.email.message}</p>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>
                <strong>Contraseña</strong>
              </Form.Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    id="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    {...field}
                    className={errors.password ? "is-invalid" : ""}
                  />
                )}
              />
              {errors.password && (
                <p className="login-error">{errors.password.message}</p>
              )}
            </Form.Group>

            <Form.Group>
              <Button
                type="submit"
                className="login-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            </Form.Group>
          </Form>

          <p className="login-footnote">Fábrica de Software · Centro de formación</p>
        </div>
      </section>
    </div>
  );
}
