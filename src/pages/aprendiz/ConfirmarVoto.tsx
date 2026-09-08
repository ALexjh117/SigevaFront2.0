import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ConfirmarVoto() {
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    Swal.fire({
      title: "Usa la ficha del candidato",
      text: "El código se pide al votar desde la lista de candidatos.",
      icon: "info",
      confirmButtonText: "Ir a mis elecciones",
    }).then(() => navigate("/votaciones"));
  };

  return (
    <div className="admin-dash">
      <header className="admin-dash-hero">
        <p className="admin-dash-eyebrow">Paso final</p>
        <h1>Confirmar voto</h1>
        <p className="admin-dash-lead">
          El código de 6 caracteres llega a tu correo cuando eliges un candidato.
        </p>
      </header>
      <form onSubmit={submit} className="apz-otp" style={{ marginTop: "1.5rem" }}>
        <input className="form-control mb-3" type="text" maxLength={6} placeholder="------" />
        <button type="submit" className="admin-vote-cta admin-vote-cta--go">
          Volver a elecciones
        </button>
      </form>
    </div>
  );
}
