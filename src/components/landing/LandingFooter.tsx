import { Link } from "react-router-dom";

import { SigevaWordmark, SigevaName } from "./SigevaMark";
import { SiGmail } from "react-icons/si";
import { FaQuestionCircle } from "react-icons/fa";

const redes = [
  { href: " https://fabricaswctpicauca@gmail.com", label: "Facebook", icon: <SiGmail /> },
 
  { href: "https://soporte.cloudsenactpi.net", label: "Instagram", icon: <FaQuestionCircle /> },

];

export default function LandingFooter() {
  const anio = new Date().getFullYear();

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
          <Link to="/politica-privacidad">Política de privacidad</Link>
          <a href="https://www.sena.edu.co" target="_blank" rel="noopener noreferrer">
            Términos de uso
          </a>
          <Link to="/#mision">Misión</Link>
          <Link to="/#vision">Visión</Link>
        </div>

        <div>
          <h4>Ayuda y soporte</h4>
          <Link to="/#faq">Cómo votar</Link>
          <Link to="/#faq">Preguntas frecuentes</Link>
          <a
            href="https://soporte.cloudsenactpi.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            Soporte técnico
          </a>
          <a href="https://soporte.cloudsenactpi.net">Contáctenos</a>
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
            
            
          </div>
        </div>
      </div>

      <div className="lp-foot-bar">
        <span className="lp-foot-spacer" aria-hidden />
        <span className="lp-foot-copy">
          © {anio} Servicio Nacional de Aprendizaje Sena | Centro de Teleinformática 
          y produccion industrial CTPI- Regional Cauca 
          fabricasoftwarectpi@misena.edu.co

          <br />
          
           <span className="lp-foot-spacer"> 


        Copyrigth©2026
           </span>
          
   
          
          
        </span>
        <img src="/sena.svg" alt="SENA" className="lp-foot-sena" />
      </div>
    </footer>
  );
}
