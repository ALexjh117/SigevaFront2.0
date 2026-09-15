import { useEffect, useState } from "react";
import { Modal, Form, Button, Alert, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { api } from "../../../api";
import { useAuth } from "../../../context/auth/auth.context";
import { esAdministradorRed } from "../../../utils/roles";
import { mensajeApi } from "../../../utils/centro";

export type RolCreacion = "admin_sistema" | "colaborador";

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
  rolesPermitidos: RolCreacion[];
  rolInicial?: RolCreacion;
  /** Centro ya elegido en la vista (obligatorio al crear). */
  idCentroFijo?: number;
  nombreCentroFijo?: string;
}

export function CrearUsuarioCentroModal({
  show,
  onHide,
  onSuccess,
  rolesPermitidos,
  rolInicial,
  idCentroFijo = 0,
  nombreCentroFijo = "",
}: Props) {
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);
  const [rol, setRol] = useState<RolCreacion>(
    rolInicial || rolesPermitidos[0] || "colaborador"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>();

  useEffect(() => {
    if (!show) return;
    setRol(rolInicial || rolesPermitidos[0] || "colaborador");
    setError(null);
    reset({});
  }, [show, rolInicial, rolesPermitidos, reset]);

  const titulo =
    rol === "admin_sistema" ? "Nuevo admin de centro" : "Nuevo colaborador";

  const onSubmit = async (data: FieldValues) => {
    setError(null);

    const idCentro =
      idCentroFijo ||
      (esRed ? 0 : Number(user?.centroFormacion || user?.CentroFormacion || 0));

    if (!idCentro) {
      setError("No hay centro de formación seleccionado");
      return;
    }

    const body: Record<string, string | number> = {
      nombres: data.nombres,
      apellidos: data.apellidos,
      celular: data.celular,
      tipo_documento: data.tipo_documento || "CC",
      numero_documento: data.numero_documento,
      email: data.email,
      password: data.password,
      idcentro_formacion: idCentro,
    };

    const url =
      rol === "admin_sistema"
        ? "api/usuarios/admin-sistema"
        : "api/usuarios/colaboradores";

    setLoading(true);
    try {
      await api.post(url, body);
      reset();
      onHide();
      onSuccess?.();
    } catch (err: unknown) {
      setError(mensajeApi(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          {rolesPermitidos.length > 1 && (
            <Form.Group className="mb-3">
              <Form.Label>
                Rol a crear <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={rol}
                onChange={(e) => setRol(e.target.value as RolCreacion)}
              >
                {rolesPermitidos.includes("admin_sistema") && (
                  <option value="admin_sistema">Admin de centro</option>
                )}
                {rolesPermitidos.includes("colaborador") && (
                  <option value="colaborador">Colaborador</option>
                )}
              </Form.Select>
              <Form.Text className="text-muted">
                {rol === "colaborador"
                  ? "Solo podrá editar aprendices del centro asignado."
                  : "Administra todo el centro: elecciones, aprendices y colaboradores."}
              </Form.Text>
            </Form.Group>
          )}

          <Alert variant="info" className="py-2">
            Quedará ligado a:{" "}
            <strong>{nombreCentroFijo || `Centro ${idCentroFijo}`}</strong>
          </Alert>

          <div className="row g-3">
            <Form.Group className="col-md-6">
              <Form.Label>
                Nombres <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                {...register("nombres", { required: "Requerido" })}
                isInvalid={!!errors.nombres}
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>
                Apellidos <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                {...register("apellidos", { required: "Requerido" })}
                isInvalid={!!errors.apellidos}
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>
                Correo <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                {...register("email", { required: "Requerido" })}
                isInvalid={!!errors.email}
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>
                Celular <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                {...register("celular", { required: "Requerido" })}
                isInvalid={!!errors.celular}
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>Tipo documento</Form.Label>
              <Form.Select {...register("tipo_documento")} defaultValue="CC">
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="TI">TI</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label>
                Número documento <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                {...register("numero_documento", { required: "Requerido" })}
                isInvalid={!!errors.numero_documento}
              />
            </Form.Group>
            <Form.Group className="col-md-12">
              <Form.Label>
                Contraseña <span className="text-danger">*</span>
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Requerido",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                  })}
                  isInvalid={!!errors.password}
                />
                <InputGroup.Text
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onHide} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Creando…" : "Crear usuario"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
