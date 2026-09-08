import { useEffect } from "react";
import { Link } from "react-router-dom";
import LandingHeader from "../components/landing/LandingHeader";
import LandingFooter from "../components/landing/LandingFooter";
import { SigevaName } from "../components/landing/SigevaMark";
import "./Inicio.css";
import "./PoliticaPrivacidad.css";

const secciones = [
  {
    id: "objeto",
    titulo: "1. Objeto",
    contenido: (
      <>
        <p>
          La presente Política de Privacidad y Protección de Datos Personales
          establece los lineamientos aplicables al tratamiento de la información
          personal que se recopila, almacena, consulta, actualiza y utiliza a
          través de <SigevaName />.
        </p>
        <p>
          <SigevaName /> es un sistema de información destinado a apoyar la
          gestión de usuarios, aprendices, procesos electorales y demás
          funcionalidades administrativas definidas por la organización
          responsable del sistema. La presente política busca informar a los
          titulares sobre qué información puede ser tratada, para qué se
          utiliza, cómo se protege y cuáles son sus derechos.
        </p>
      </>
    ),
  },
  {
    id: "alcance",
    titulo: "2. Alcance",
    contenido: (
      <>
        <p>
          Esta política aplica a las personas cuyos datos personales sean
          registrados o tratados mediante <SigevaName />, incluyendo, según
          corresponda, aprendices, usuarios, administradores y demás personas
          autorizadas para utilizar el sistema.
        </p>
        <p>
          El tratamiento se realizará de conformidad con la normativa colombiana
          vigente sobre protección de datos personales, especialmente la Ley 1581 de
          2012, el Decreto 1074 de 2015 y las demás disposiciones que resulten
          aplicables.
        </p>
      </>
    ),
  },
  {
    id: "responsable",
    titulo: "3. Responsable del tratamiento",
    contenido: (
      <>
        <p>
          El responsable del tratamiento será la entidad o institución que
          administre oficialmente <SigevaName />.
        </p>
        <ul className="pp-datos">
          <li>
            <strong>Nombre de la entidad:</strong> Fábrica de Software
          </li>
          <li>
            <strong>Dirección:</strong> Carrera 9 # 71 Norte (Alto Cauca), Popayán
          </li>
          <li>
            <strong>Ciudad:</strong> Popayán, Cauca
          </li>
          <li>
            <strong>Correo de contacto:</strong>{" "}
            <a href="mailto:fabricaswctpicauca@gmail.com">
              fabricaswctpicauca@gmail.com
            </a>
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "informacion",
    titulo: "4. Información que puede recopilar SIGEVA",
    contenido: (
      <>
        <p>
          De acuerdo con las funcionalidades habilitadas en <SigevaName />, el
          sistema puede tratar información como:
        </p>
        <ul>
          <li>Nombres y apellidos.</li>
          <li>Tipo y número de documento de identificación, cuando sea necesario.</li>
          <li>Correo electrónico.</li>
          <li>Información de contacto, cuando sea requerida.</li>
          <li>Información relacionada con el perfil del usuario.</li>
          <li>Rol o tipo de usuario dentro del sistema.</li>
          <li>Credenciales y datos necesarios para la autenticación.</li>
          <li>
            Información relacionada con aprendices y su participación en los
            procesos administrados por <SigevaName />.
          </li>
          <li>Información relacionada con procesos electorales, cuando corresponda.</li>
          <li>
            Registros de actividad, acceso y operaciones realizadas dentro del
            sistema.
          </li>
          <li>
            Información técnica necesaria para seguridad, auditoría y
            funcionamiento de la plataforma.
          </li>
        </ul>
        <p>
          <SigevaName /> procurará recopilar únicamente los datos adecuados,
          pertinentes y necesarios para las finalidades informadas.
        </p>
      </>
    ),
  },
  {
    id: "finalidades",
    titulo: "5. Finalidades del tratamiento",
    contenido: (
      <>
        <p>
          Los datos personales tratados mediante <SigevaName /> podrán utilizarse
          para:
        </p>
        <ol>
          <li>Crear, administrar, actualizar y mantener cuentas de usuario.</li>
          <li>Permitir el inicio de sesión y la autenticación de los usuarios.</li>
          <li>Gestionar roles, permisos y niveles de acceso.</li>
          <li>
            Administrar la información asociada a aprendices y demás usuarios
            autorizados.
          </li>
          <li>
            Gestionar procesos electorales y la información necesaria para su
            operación.
          </li>
          <li>
            Registrar y consultar información relacionada con las actividades
            realizadas en el sistema.
          </li>
          <li>
            Facilitar la administración y seguimiento de los procesos
            institucionales implementados en <SigevaName />.
          </li>
          <li>
            Generar reportes, consultas y estadísticas necesarias para la gestión del
            sistema.
          </li>
          <li>Mantener controles de seguridad, auditoría y trazabilidad.</li>
          <li>
            Detectar y prevenir accesos no autorizados, usos indebidos o
            incidentes de seguridad.
          </li>
          <li>
            Brindar soporte técnico y realizar mantenimiento y mejoras de{" "}
            <SigevaName />.
          </li>
          <li>
            Enviar comunicaciones relacionadas con la cuenta, funcionamiento,
            seguridad, mantenimiento o cambios importantes del sistema.
          </li>
          <li>Atender peticiones, consultas, quejas y reclamos de los titulares.</li>
          <li>
            Cumplir obligaciones legales y requerimientos de autoridades
            competentes.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: "elecciones",
    titulo: "6. Tratamiento de información relacionada con elecciones",
    contenido: (
      <>
        <p>
          Cuando <SigevaName /> gestione procesos electorales, podrá tratar
          información necesaria para administrar dichos procesos, tales como
          datos de identificación, información del usuario, condición o rol
          dentro del proceso, participación y demás información estrictamente
          necesaria para el funcionamiento de las elecciones.
        </p>
        <p>
          La información electoral será utilizada únicamente para las finalidades
          propias de la gestión del proceso correspondiente y se aplicarán
          medidas de seguridad destinadas a evitar accesos, modificaciones o
          divulgaciones no autorizadas.
        </p>
        <p>
          Cuando la naturaleza del proceso requiera proteger la confidencialidad
          del voto, <SigevaName /> deberá implementar mecanismos técnicos y
          administrativos adecuados para evitar que la información permita asociar
          indebidamente una decisión de voto con la identidad del elector, de
          acuerdo con las reglas específicas del proceso.
        </p>
      </>
    ),
  },
  {
    id: "roles",
    titulo: "7. Usuarios, aprendices y administradores",
    contenido: (
      <>
        <p>
          <SigevaName /> puede manejar diferentes roles de acceso. Los permisos
          estarán definidos de acuerdo con las funciones asignadas a cada usuario.
        </p>
        <p>
          Los administradores podrán acceder a la información necesaria para
          ejecutar las funciones autorizadas, pero deberán utilizarla únicamente
          para fines institucionales y conforme a sus responsabilidades.
        </p>
        <p>
          Los usuarios deberán mantener la confidencialidad de sus credenciales y
          no deberán compartir contraseñas ni permitir que terceros utilicen sus
          cuentas.
        </p>
      </>
    ),
  },
  {
    id: "autorizacion",
    titulo: "8. Autorización para el tratamiento",
    contenido: (
      <>
        <p>
          Cuando la legislación lo exija, <SigevaName /> solicitará al titular
          una autorización previa, expresa e informada para el tratamiento de sus
          datos personales.
        </p>
        <p>
          La autorización podrá obtenerse mediante mecanismos físicos o
          electrónicos que permitan demostrar el consentimiento otorgado.
        </p>
        <p>
          El titular podrá solicitar la revocatoria de la autorización cuando ello
          sea legalmente procedente, sin perjuicio de los tratamientos que deban
          conservarse por obligación legal o contractual.
        </p>
      </>
    ),
  },
  {
    id: "seguridad",
    titulo: "9. Seguridad de la información",
    contenido: (
      <>
        <p>
          <SigevaName /> implementará medidas técnicas, administrativas y
          organizativas razonables para proteger los datos personales contra
          pérdida, acceso no autorizado, alteración, divulgación, uso indebido o
          destrucción.
        </p>
        <p>
          Entre las medidas de seguridad podrán incluirse controles de acceso por
          roles, autenticación, protección de credenciales, registros de
          actividad, restricciones de permisos, copias de seguridad y mecanismos
          de protección de la infraestructura tecnológica.
        </p>
        <p>
          Ningún sistema conectado a Internet puede garantizar seguridad absoluta; por
          ello, <SigevaName /> mantendrá medidas razonables de prevención,
          monitoreo y mejora continua.
        </p>
      </>
    ),
  },
  {
    id: "credenciales",
    titulo: "10. Contraseñas y credenciales",
    contenido: (
      <>
        <p>
          Las contraseñas deberán almacenarse mediante mecanismos criptográficos
          adecuados y no deberán conservarse en texto plano.
        </p>
        <p>
          Cada usuario será responsable de proteger sus credenciales. Si un
          usuario sospecha que su cuenta ha sido comprometida, deberá informar al
          responsable o administrador correspondiente para que se adopten las
          medidas necesarias.
        </p>
      </>
    ),
  },
  {
    id: "comparticion",
    titulo: "11. Compartición y acceso a la información",
    contenido: (
      <>
        <p>
          <SigevaName /> no venderá ni comercializará los datos personales de sus
          usuarios.
        </p>
        <p>
          El acceso o suministro de información podrá realizarse cuando sea
          necesario para cumplir las finalidades autorizadas, prestar servicios
          tecnológicos indispensables para el funcionamiento del sistema,
          atender obligaciones legales o responder requerimientos de autoridades
          competentes.
        </p>
        <p>
          Cuando terceros participen en la operación tecnológica de <SigevaName /> y
          tengan acceso a datos personales, deberán cumplir las obligaciones de
          seguridad, confidencialidad y protección de datos que correspondan.
        </p>
      </>
    ),
  },
  {
    id: "derechos",
    titulo: "12. Derechos de los titulares",
    contenido: (
      <>
        <p>Los titulares de los datos personales tienen derecho a:</p>
        <ul>
          <li>Conocer, actualizar y rectificar sus datos.</li>
          <li>Solicitar información sobre el tratamiento realizado.</li>
          <li>Solicitar prueba de la autorización, cuando corresponda.</li>
          <li>Presentar consultas y reclamos.</li>
          <li>Solicitar la eliminación de datos cuando sea legalmente procedente.</li>
          <li>Revocar la autorización cuando sea procedente.</li>
          <li>Acceder gratuitamente a sus datos en los casos previstos por la ley.</li>
          <li>
            Presentar quejas ante la Superintendencia de Industria y Comercio
            cuando considere vulnerados sus derechos.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "consultas",
    titulo: "13. Consultas y reclamos",
    contenido: (
      <>
        <p>
          Las consultas o reclamos relacionados con los datos personales podrán
          presentarse a través de los canales oficiales definidos por la entidad
          responsable de <SigevaName />.
        </p>
        <p>
          La solicitud deberá incluir, en lo posible, nombre del titular,
          identificación, descripción de la solicitud, datos de contacto y los
          documentos que sean necesarios para respaldarla.
        </p>
        <p>
          Las solicitudes serán atendidas dentro de los términos establecidos por
          la legislación colombiana vigente.
        </p>
      </>
    ),
  },
  {
    id: "conservacion",
    titulo: "14. Conservación de la información",
    contenido: (
      <>
        <p>
          Los datos serán conservados durante el tiempo necesario para cumplir las
          finalidades para las cuales fueron recopilados, atender obligaciones
          legales, administrativas o contractuales y garantizar los derechos de
          los titulares.
        </p>
        <p>
          Cuando la información ya no sea necesaria y no exista una obligación de
          conservarla, podrá ser eliminada, anonimizada o sometida a las medidas
          correspondientes.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    titulo: "15. Cookies y registros técnicos",
    contenido: (
      <>
        <p>
          <SigevaName /> podrá utilizar cookies, almacenamiento de sesión y
          tecnologías similares para mantener sesiones autenticadas, mejorar la
          seguridad, recordar determinadas configuraciones y garantizar el
          funcionamiento de la plataforma.
        </p>
        <p>
          También podrá generar registros técnicos relacionados con accesos y
          operaciones del sistema para fines de seguridad, auditoría,
          diagnóstico y mantenimiento.
        </p>
      </>
    ),
  },
  {
    id: "menores",
    titulo: "16. Menores de edad",
    contenido: (
      <p>
        Cuando <SigevaName /> trate datos personales de niños, niñas o
        adolescentes, se aplicarán las disposiciones especiales previstas por la
        legislación colombiana. El tratamiento deberá respetar el interés
        superior del menor y sus derechos fundamentales.
      </p>
    ),
  },
  {
    id: "cambios",
    titulo: "17. Cambios en la política",
    contenido: (
      <>
        <p>
          Esta política podrá actualizarse cuando existan cambios en la
          legislación, en la arquitectura o funcionalidades de <SigevaName />, en
          los procedimientos institucionales o en las prácticas de tratamiento
          de información.
        </p>
        <p>
          Las modificaciones relevantes podrán comunicarse mediante los canales
          disponibles dentro del sistema. La versión vigente será la publicada
          oficialmente por la entidad responsable.
        </p>
      </>
    ),
  },
  {
    id: "vigencia",
    titulo: "18. Vigencia",
    contenido: (
      <>
        <p>
          La presente Política de Privacidad y Protección de Datos Personales entra
          en vigencia el 8 de septiembre de 2026.
        </p>
        <p>Última actualización: 8 de septiembre de 2026.</p>
      </>
    ),
  },
  {
    id: "contacto",
    titulo: "19. Datos de contacto",
    contenido: (
      <>
        <p>
          Para consultas, solicitudes o reclamos relacionados con la protección de
          datos personales:
        </p>
        <ul className="pp-datos">
          <li>
            <strong>Responsable:</strong> Fábrica de Software
          </li>
          <li>
            <strong>Correo de privacidad:</strong>{" "}
            <a href="mailto:fabricaswctpicauca@gmail.com">
              fabricaswctpicauca@gmail.com
            </a>
          </li>
          <li>
            <strong>Dirección:</strong> Carrera 9 # 71 Norte (Alto Cauca), Popayán
          </li>
          <li>
            <strong>Ciudad:</strong> Popayán, Cauca
          </li>
        </ul>
      </>
    ),
  },
];

export default function PoliticaPrivacidad() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="landing">
      <LandingHeader />

      <main className="pp-page">
        <header className="pp-intro">
          <p className="pp-kicker">Sistema SIGEVA</p>
          <h1>Política de Privacidad y Protección de Datos Personales</h1>
          <p>
            Lineamientos aplicables al tratamiento de datos personales en{" "}
            <SigevaName />. Fecha de actualización: 8 de septiembre de 2026.
          </p>
        </header>

        <nav className="pp-indice" aria-label="Índice de la política">
          {secciones.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.titulo}
            </a>
          ))}
        </nav>

        {secciones.map((s) => (
          <section key={s.id} id={s.id} className="pp-seccion">
            <h2>{s.titulo}</h2>
            {s.contenido}
          </section>
        ))}

        <p className="pp-volver">
          <Link to="/">Volver al inicio</Link>
        </p>
      </main>

      <LandingFooter />
    </div>
  );
}
