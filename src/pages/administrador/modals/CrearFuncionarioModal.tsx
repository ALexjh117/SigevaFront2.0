import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Alert, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash, FaCheck, FaTimes, FaCheckCircle } from "react-icons/fa";
import { api } from "../../../api";
import Select from "react-select";
import { useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { useAuth } from "../../../context/auth/auth.context";
import { esAdministradorRed } from "../../../utils/roles";
import {
  idDeCentro,
  listaDe,
  mensajeApi,
  nombreDeCentro,
} from "../../../utils/centro";

// Interfaces
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
interface SelectOption {
  value: number;
  label: string;
}
interface CrearFuncionarioModalProps {
  show: boolean;
  onHide: () => void;
  error?: string;
  loading?: boolean;
  onSuccess?: () => void;
  tipo?: "funcionario" | "admin_sistema";
}

export const CrearFuncionarioModal: React.FC<CrearFuncionarioModalProps> = ({
  show,
  onHide,
  error,
  loading = false,
  onSuccess,
  tipo = "funcionario",
}) => {
  const { user } = useAuth();
  const esRed = esAdministradorRed(user?.perfil);
  const esAdminCentro = tipo === "admin_sistema";
  const eligeCentro = esAdminCentro || esRed;
  const titulo = esAdminCentro ? "Nuevo admin de centro" : "Nuevo funcionario";

  const [regionales, setRegionales] = useState<Regional[]>([]);
  const [centros, setCentros] = useState<CentroFormacion[]>([]);
  const [idRegional, setIdRegional] = useState<number>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [idCentroFormacion, setIdCentroFormacion] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdFuncionario, setCreatedFuncionario] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<FieldValues>();

  // Validaciones personalizadas
  const validateEmail = (email: string) => {
    if (!email) return "El correo es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Formato de email inválido";
    if (!email.includes(".com") && !email.includes(".co") && !email.includes(".edu")) {
      return "El email debe tener un dominio válido (.com, .co, .edu)";
    }
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) return "La contraseña es requerida";
    if (password.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Debe contener al menos una mayúscula";
    if (!/[a-z]/.test(password)) return "Debe contener al menos una minúscula";
    if (!/\d/.test(password)) return "Debe contener al menos un número";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Debe contener al menos un carácter especial";
    return true;
  };

  // 🔹 Validación más estricta para nombres
  const validateNombres = (value: string) => {
    if (!value.trim()) return "Los nombres son requeridos";

    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(value)) {
      return "Solo se permiten letras y espacios";
    }

    const palabras = value.trim().split(/\s+/);
    for (let palabra of palabras) {
      if (palabra.length < 2) return "Cada nombre debe tener mínimo 2 caracteres";
      if (!/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+$/.test(palabra)) {
        return "Cada nombre debe empezar en mayúscula y continuar en minúscula";
      }
    }

    if (/^(.)\1{2,}$/.test(value)) {
      return "El nombre no puede tener tantas letras repetidas seguidas";
    }

    return true;
  };

  // 🔹 Validación más estricta para apellidos
  const validateApellidos = (value: string) => {
    if (!value.trim()) return "Los apellidos son requeridos";

    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(value)) {
      return "Solo se permiten letras y espacios";
    }

    const palabras = value.trim().split(/\s+/);
    for (let palabra of palabras) {
      if (palabra.length < 2) return "Cada apellido debe tener mínimo 2 caracteres";
      if (!/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+$/.test(palabra)) {
        return "Cada apellido debe empezar en mayúscula y continuar en minúscula";
      }
    }

    if (/^(.)\1{2,}$/.test(value)) {
      return "El apellido no puede tener tantas letras repetidas seguidas";
    }

    return true;
  };

  const validateCelular = (value: string) => {
    if (!value.trim()) return "El teléfono es requerido";
    if (!/^[0-9]{10}$/.test(value)) return "Debe ser un número de 10 dígitos (ej: 3001234567)";
    return true;
  };

  const validateDocumento = (value: string) => {
    if (!value.trim()) return "El número de documento es requerido";
    if (!/^[0-9]{6,10}$/.test(value)) return "Debe ser un número de 6 a 10 dígitos";
    return true;
  };

  // Observar valores para validaciones en tiempo real
  const watchedEmail = watch("email", "");
  const watchedPassword = watch("password", "");
  const watchedCelular = watch("celular", "");
  const watchedDocumento = watch("numero_documento", "");
  const watchedNombres = watch("nombres", "");
  const watchedApellidos = watch("apellidos", "");

  // Estados de validación
  const emailValid = validateEmail(watchedEmail) === true;
  const passwordValid = validatePassword(watchedPassword) === true;
  const celularValid = validateCelular(watchedCelular) === true;
  const documentoValid = validateDocumento(watchedDocumento) === true;
  const nombresValid = validateNombres(watchedNombres) === true;
  const apellidosValid = validateApellidos(watchedApellidos) === true;

  useEffect(() => {
    if (show) {
      api.get("api/regionales").then((res) => setRegionales(listaDe<Regional>(res.data)));
      reset({});
      setIdRegional(0);
      setIdCentroFormacion(0);
    }
  }, [show, reset]);

  useEffect(() => {
    if (!idRegional) {
      setCentros([]);
      return;
    }
    api
      .get(`api/centrosFormacion/obtiene/porRegional/${idRegional}`)
      .then((res) => setCentros(listaDe<CentroFormacion>(res.data)));
  }, [idRegional]);

  const optionsRegionales: SelectOption[] = regionales.map((r) => ({
    value: r.idregional,
    label: r.regional,
  }));

  const optionsCentros: SelectOption[] = centros.map((c) => ({
    value: idDeCentro(c as unknown as Record<string, unknown>),
    label: nombreDeCentro(c as unknown as Record<string, unknown>),
  }));

  const onSubmit = async (data: FieldValues) => {
    if (eligeCentro && !idCentroFormacion) {
      return alert("Selecciona un centro de formación");
    }

    const submissionData: Record<string, string | number> = {
      nombres: data.nombres,
      apellidos: data.apellidos,
      celular: data.celular,
      tipo_documento: data.tipo_documento || "CC",
      numero_documento: data.numero_documento,
      email: data.email,
      password: data.password,
    };
    if (eligeCentro) {
      submissionData.idcentro_formacion = idCentroFormacion;
    } else if (user?.centroFormacion) {
      submissionData.idcentro_formacion = Number(user.centroFormacion);
    }

    const url = esAdminCentro
      ? "api/usuarios/admin-sistema"
      : "api/usuarios/funcionarios";

    try {
      await api.post(url, submissionData);

      const nombreCompleto = `${data.nombres} ${data.apellidos}`;
      setCreatedFuncionario(nombreCompleto);

      setIdCentroFormacion(0);
      setIdRegional(0);
      reset();

      onHide();
      setShowSuccessModal(true);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      alert(`Error al crear: ${mensajeApi(err)}`);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setCreatedFuncionario("");
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{titulo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="row g-3">
              {/* Nombres */}
              <Form.Group className="col-md-6">
                <Form.Label>
                  Nombres <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register("nombres", {
                    required: "Los nombres son requeridos",
                    validate: validateNombres,
                  })}
                  isInvalid={!!errors.nombres}
                  isValid={nombresValid}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, "");
                    setValue("nombres", value);
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombres?.message as string}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Apellidos */}
              <Form.Group className="col-md-6">
                <Form.Label>
                  Apellidos <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register("apellidos", {
                    required: "Los apellidos son requeridos",
                    validate: validateApellidos,
                  })}
                  isInvalid={!!errors.apellidos}
                  isValid={apellidosValid}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, "");
                    setValue("apellidos", value);
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.apellidos?.message as string}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Teléfono */}
              <Form.Group className="col-md-6">
                <Form.Label>
                  Teléfono <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register("celular", {
                    required: "El teléfono es requerido",
                    validate: validateCelular,
                  })}
                  isInvalid={!!errors.celular}
                  isValid={celularValid}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setValue("celular", value);
                  }}
                  maxLength={10}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.celular?.message as string}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Tipo de documento */}
              <Form.Group className="col-md-6">
                <Form.Label>
                  Tipo de documento <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  {...register("tipo_documento", {
                    required: "Seleccione un tipo de documento",
                  })}
                  isInvalid={!!errors.tipo_documento}
                >
                  <option value="">Seleccione...</option>
                  <option value="CC">Cédula de ciudadanía</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.tipo_documento?.message as string}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Número de documento */}
              <Form.Group className="col-md-6">
                <Form.Label>
                  Número de documento <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register("numero_documento", {
                    required: "El número de documento es requerido",
                    validate: validateDocumento,
                  })}
                  isInvalid={!!errors.numero_documento}
                  isValid={documentoValid}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setValue("numero_documento", value);
                  }}
                  maxLength={10}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.numero_documento?.message as string}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Correo */}
              <Form.Group className="col-md-6">
                <Form.Label>
                  Correo <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="email"
                    {...register("email", {
                      required: "El correo es requerido",
                      validate: validateEmail,
                    })}
                    isInvalid={!!errors.email}
                    isValid={emailValid}
                  />
                  <InputGroup.Text className="bg-white border-start-0">
                    {emailValid && <FaCheck className="text-success" />}
                    {errors.email && <FaTimes className="text-danger" />}
                  </InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message as string}
                </Form.Control.Feedback>
                {emailValid && !errors.email && (
                  <div className="text-success small mt-1">
                    <FaCheck className="me-1" />
                    Email válido
                  </div>
                )}
              </Form.Group>

              {/* Contraseña */}
              <Form.Group className="col-md-12">
                <Form.Label>
                  Contraseña <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "La contraseña es requerida",
                      validate: validatePassword,
                    })}
                    isInvalid={!!errors.password}
                    isValid={passwordValid}
                    placeholder="Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                  <InputGroup.Text className="bg-white border-start-0">
                    {passwordValid && <FaCheck className="text-success" />}
                    {errors.password && <FaTimes className="text-danger" />}
                  </InputGroup.Text>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message as string}
                </Form.Control.Feedback>

                {/* Indicadores de validación de contraseña */}
                {watchedPassword && (
                  <div className="mt-2">
                    <div className="small">
                      <div className={watchedPassword.length >= 8 ? "text-success" : "text-danger"}>
                        {watchedPassword.length >= 8 ? <FaCheck /> : <FaTimes />} Mínimo 8 caracteres
                      </div>
                      <div className={/[A-Z]/.test(watchedPassword) ? "text-success" : "text-danger"}>
                        {/[A-Z]/.test(watchedPassword) ? <FaCheck /> : <FaTimes />} Una mayúscula
                      </div>
                      <div className={/[a-z]/.test(watchedPassword) ? "text-success" : "text-danger"}>
                        {/[a-z]/.test(watchedPassword) ? <FaCheck /> : <FaTimes />} Una minúscula
                      </div>
                      <div className={/\d/.test(watchedPassword) ? "text-success" : "text-danger"}>
                        {/\d/.test(watchedPassword) ? <FaCheck /> : <FaTimes />} Un número
                      </div>
                      <div
                        className={
                          /[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword)
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {/[!@#$%^&*(),.?":{}|<>]/.test(watchedPassword) ? (
                          <FaCheck />
                        ) : (
                          <FaTimes />
                        )}{" "}
                        Un carácter especial
                      </div>
                    </div>
                  </div>
                )}
              </Form.Group>

              {eligeCentro ? (
                <>
              {/* Regional */}
              <div className="col-md-6">
                <Form.Label>
                  Regional <span className="text-danger">*</span>
                </Form.Label>
                <Select
                  options={optionsRegionales}
                  value={optionsRegionales.find((o) => o.value === idRegional) || null}
                  onChange={(opt) => {
                    setIdRegional(opt ? opt.value : 0);
                    setIdCentroFormacion(0);
                    setValue("idregional", opt ? opt.value : 0);
                  }}
                  placeholder="Selecciona una regional..."
                  className={!idRegional ? "is-invalid" : ""}
                />
                {!idRegional && (
                  <div className="text-danger small mt-1">
                    <FaTimes className="me-1" />
                    Campo requerido
                  </div>
                )}
              </div>

              {/* Centro */}
              <div className="col-md-6">
                <Form.Label>
                  Centro <span className="text-danger">*</span>
                </Form.Label>
                <Select
                  options={optionsCentros}
                  value={optionsCentros.find((o) => o.value === idCentroFormacion) || null}
                  onChange={(opt) => setIdCentroFormacion(opt ? opt.value : 0)}
                  placeholder="Selecciona un centro..."
                  className={!idCentroFormacion ? "is-invalid" : ""}
                />
                {!idCentroFormacion && (
                  <div className="text-danger small mt-1">
                    <FaTimes className="me-1" />
                    Campo requerido
                  </div>
                )}
              </div>
                </>
              ) : (
                <div className="col-12">
                  <Alert variant="info" className="mb-0">
                    Este funcionario queda en <strong>tu centro de formación</strong>. No eliges otra sede.
                  </Alert>
                </div>
              )}
            </div>

            <div className="mt-4 d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={onHide}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de éxito */}
      <Modal show={showSuccessModal} onHide={handleSuccessModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{esAdminCentro ? "Admin de centro creado" : "Funcionario creado"}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <FaCheckCircle className="text-success mb-3" size={50} />
          <h5>{createdFuncionario}</h5>
          <p>Ha sido registrado exitosamente.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleSuccessModalClose}>
            Aceptar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
