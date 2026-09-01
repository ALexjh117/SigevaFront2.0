import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { SigevaWordmark, SigevaName } from "./SigevaMark";

const redes = [
  { href: "https://www.facebook.com/SENA/?locale=es_LA", label: "Facebook", icon: <FaFacebookF /> },
  { href: "https://x.com/SENAComunica", label: "X", icon: <FaTwitter /> },
  { href: "https://www.instagram.com/senacomunica/", label: "Instagram", icon: <FaInstagram /> },
  { href: "https://www.youtube.com/@SENAComunica", label: "YouTube", icon: <FaYoutube /> },
];

export default function LandingFooter() {
  return (
    <footer className="lp-foot">
      <div className="lp-foot-inner">
        <div className="lp-foot-brand-col">
          <SigevaWordmark inverted />
          <p>
            Plataforma oficial del SENA para la gestión y participación en los procesos electorales.
          </p>
          <div className="lp-foot-partners">
            <div className="lp-partner">
              <img src="/sena.png" alt="SENA" />
            </div>
            <div className="lp-partner lp-partner-fab">
              <img src="/logo_fabrica.png" alt="Fábrica de Software SENA" />
            </div>
          </div>
        </div>

        <div>
          <h4>Enlaces rápidos</h4>
          <Link to="/">Inicio</Link>
          <Link to="/#elecciones">Elecciones</Link>
          <Link to="/#informacion">Información</Link>
          <Link to="/#sobre">
            Sobre <SigevaName />
          </Link>
        </div>

        <div>
          <h4>Información legal</h4>
          <a href="https://www.sena.edu.co" target="_blank" rel="noopener noreferrer">
            Política de privacidad
          </a>
          <a href="https://www.sena.edu.co" target="_blank" rel="noopener noreferrer">
            Términos de uso
          </a>
          <Link to="/#informacion">Mapa del sitio</Link>
          <Link to="/#informacion">Accesibilidad</Link>
        </div>

        <div>
          <h4>Ayuda y soporte</h4>
          <a href="https://www.sena.edu.co" target="_blank" rel="noopener noreferrer">
            Canales de atención
          </a>
          <Link to="/#informacion">Preguntas frecuentes</Link>
          <a href="mailto:contacto@misena.edu.co">Soporte técnico</a>
          <a href="mailto:contacto@misena.edu.co">Contáctenos</a>
        </div>

        <div className="lp-foot-follow">
          <h4>Contáctanos</h4>

          <div className="lp-social">
            {redes.map((r) => (
              <a
                key={r.label}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={r.label}
              >
                {r.icon}
              </a>
            ))}
          </div>

          <div className="lp-foot-contact">
            <a href="mailto:fabricaswctpicauca@gmail.com">
              fabricaswctpicauca@gmail.com
            </a>

            <a
              href="https://fabricasw.cloudsenactpi.net/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://fabricasw.cloudsenactpi.net/
            </a>
          </div>
        </div>
      </div>

      <div className="lp-foot-bar">
        <span className="lp-foot-spacer" aria-hidden />
        <span className="lp-foot-copy">
          © {new Date().getFullYear()} SENA - Servicio Nacional de Aprendizaje. Todos los derechos reservados.
        </span>
        <img src="/sena.svg" alt="SENA" className="lp-foot-sena" />
      </div>
    </footer>
  );
}
