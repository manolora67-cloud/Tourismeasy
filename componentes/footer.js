(function() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;

    mount.innerHTML = `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-grid">
          <div class="footer-col">
            <h4>Plataforma</h4>
            <ul>
              <li><a href="#" data-modal="sobre-nosotros">Sobre Nosotros</a></li>
              <li><a href="#" data-modal="como-funciona">Cómo Funciona</a></li>
              <li><a href="#" data-modal="aliados">Únete como Aliado</a></li>
              <li><a href="#" data-modal="prensa">Prensa</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Soporte</h4>
            <ul>
              <li><a href="#" data-modal="contacto">Contacto</a></li>
              <li><a href="#" data-modal="faq">Preguntas Frecuentes</a></li>
              <li><a href="#" data-modal="ayuda">Centro de Ayuda</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#" data-modal="privacidad">Política de Privacidad</a></li>
              <li><a href="#" data-modal="terminos">Términos de Servicio</a></li>
              <li><a href="#" data-modal="accesibilidad">Declaración de Accesibilidad</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Síguenos</h4>
            <div class="social-icons">
              <a href="https://www.facebook.com/share/1RiJvhh1Gp/" class="social-icon"><i class="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/d4iv_id?igsh=cGhhOWZmOTN6Y2Rn" class="social-icon"><i class="fab fa-instagram"></i></a>
              <a href="https://www.tiktok.com/@d4ividd?_r=1&_t=ZS-95d2BgEYsez" class="social-icon"><i class="fab fa-tiktok"></i></a>
              <a href="https://wa.me/573174613395" class="social-icon"><i class="fab fa-whatsapp"></i></a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Javier Sanchez, Sergio Vasquez y David Ramirez. Código y logo originales.</p>
          <p class="footer-authors">Autores: Javier Sanchez, Sergio Vasquez y David Ramirez.</p>
        </div>
      </div>
    </footer>

    <div class="modal-overlay" id="modalOverlay" aria-hidden="true" inert>
      <section class="modal-box" id="modalBox" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabindex="-1">
        <button class="modal-close" id="modalClose" type="button" aria-label="Cerrar ventana">&times;</button>
        <h2 id="modalTitle"></h2>
        <div id="modalContent"></div>
      </section>
    </div>
  `;

    // ---- Contenido de cada modal del footer ----
    const modalData = {
        "sobre-nosotros": {
            title: "Sobre Nosotros",
            content: `<p>Tourismeasy es una plataforma digital nacida en Bucaramanga, Santander, con el propósito de conectar a las empresas del sector turístico con viajeros que buscan vivir experiencias únicas en el departamento.</p>
        <p>No somos una agencia de viajes. Somos el puente tecnológico entre los operadores, agencias, hoteles y transportadoras de Santander, y las personas que quieren conocerlo.</p>
        <p>Creemos que Santander, con toda su riqueza natural y cultural, tiene todo para posicionarse como uno de los grandes destinos turísticos de Colombia.</p>`,
        },
        "como-funciona": {
            title: "Cómo Funciona",
            content: `<p>Tourismeasy funciona como una plataforma de conexión entre empresas turísticas de Santander y viajeros interesados en sus servicios.</p>
        <h3>Para las empresas aliadas</h3>
        <ul>
          <li>Registras tu empresa y tus servicios</li>
          <li>Apareces en nuestra plataforma ante miles de viajeros</li>
          <li>Recibes contactos directos por WhatsApp de viajeros interesados</li>
          <li>Gestionas tu perfil y disponibilidad desde tu panel</li>
        </ul>
        <h3>Para los viajeros</h3>
        <ul>
          <li>Buscan destinos y servicios turísticos en Santander</li>
          <li>Filtran por el tipo de servicio que necesitan</li>
          <li>Se conectan con empresas verificadas</li>
          <li>Coordinan directamente por WhatsApp con confianza y seguridad</li>
        </ul>`,
        },
        aliados: {
            title: "Únete como Aliado",
            content: `<p>¿Tienes una empresa turística en Santander? ¡TourismEasy es tu plataforma!</p>
        <h3>¿Quiénes pueden unirse?</h3>
        <ul>
          <li>🏨 Hoteles y hospedajes</li>
          <li>✈️ Agencias de viaje</li>
          <li>🎒 Operadores turísticos con guías especializados</li>
        </ul>
        <h3>Beneficios de ser aliado</h3>
        <ul>
          <li>👀 Visibilidad ante un mercado en crecimiento</li>
          <li>✅ Verificación y sello TourismEasy</li>
          <li>📊 Panel de gestión de tu perfil y clientes</li>
        </ul>
        <p>Escríbenos a <strong>tourismeasyadso@gmail.com</strong> o llámanos al <strong>+57 317 461 3395</strong></p>`,
        },
        prensa: {
            title: "Prensa",
            content: `<p>Tourismeasy está posicionándose como el referente del turismo en Santander, conectando el sector empresarial con miles de viajeros interesados en el departamento.</p>
        <h3>Contacto de prensa</h3>
        <p>Para entrevistas, notas de prensa o información sobre nuestra plataforma:</p>
        <p><strong>tourismeasyadso@gmail.com</strong><br>+57 317 461 3395</p>`,
        },
        contacto: {
            title: "Contacto",
            content: `<p>Estamos aquí para ayudarte. Puedes contactarnos por cualquiera de estos medios:</p>
        <ul>
          <li>📧 <strong>Email:</strong> tourismeasyadso@gmail.com</li>
          <li>📞 <strong>Teléfono:</strong> +57 317 461 3395</li>
          <li>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/573174613395" target="_blank" rel="noopener noreferrer">+57 317 461 3395</a></li>
          <li>📍 <strong>Ubicación:</strong> Bucaramanga, Santander, Colombia</li>
        </ul>
        <p>Horario de atención: Lunes a Viernes 8:00am – 8:00pm</p>`,
        },
        faq: {
            title: "Preguntas Frecuentes",
            content: `<details><summary>¿Tourismeasy es una agencia de viajes?</summary><p>No. Somos una plataforma que conecta empresas turísticas de Santander con viajeros interesados en el departamento. No vendemos paquetes directamente.</p></details>
        <details><summary>¿Solo trabajamos en Santander?</summary><p>Sí, por ahora nos enfocamos en Santander. Queremos ser el mejor directorio de turismo del departamento antes de expandirnos.</p></details>
        <details><summary>¿Qué tipo de empresas pueden unirse?</summary><p>Agencias de viaje, hoteles, operadores turísticos y transportadoras de Santander.</p></details>
        <details><summary>¿Cómo sé que una empresa es confiable?</summary><p>Todas las empresas aliadas pasan por un proceso de verificación y reciben nuestro sello TourismEasy.</p></details>`,
        },
        ayuda: {
            title: "Centro de Ayuda",
            content: `<p>Encuentra recursos para sacar el máximo provecho de Tourismeasy:</p>
        <ul>
          <li>📖 <a href="#">Guía para empresas aliadas</a></li>
          <li>🎥 <a href="#">Videos: cómo registrar tu empresa</a></li>
          <li>📋 <a href="#">Guía de verificación de aliados</a></li>
          <li>💳 <a href="#">Modelos de suscripción para empresas</a></li>
        </ul>
        <p>¿No encuentras lo que buscas? <a href="#" data-modal="contacto">Contáctanos.</a></p>`,
        },
        privacidad: {
            title: "Política de Privacidad",
            content: `<p><strong>Última actualización:</strong> Enero 2026</p>
        <h3>1. Información que recopilamos</h3>
        <p>Recopilamos datos que nos proporcionas directamente, como nombre, correo electrónico, información de tu empresa y datos de uso de la plataforma.</p>
        <h3>2. Uso de la información</h3>
        <p>Usamos tu información para conectarte con empresas aliadas, mejorar nuestra plataforma y enviarte comunicaciones relevantes sobre turismo en Santander.</p>
        <h3>3. Compartir información</h3>
        <p>No vendemos tu información personal a terceros. Solo compartimos datos con empresas aliadas cuando realizas una solicitud de servicio.</p>
        <h3>4. Tus derechos</h3>
        <p>Tienes derecho a acceder, corregir o eliminar tus datos personales contactándonos a tourismeasyadso@gmail.com</p>`,
        },
        terminos: {
            title: "Términos de Servicio",
            content: `<h3>1. Aceptación de términos</h3>
        <p>Al usar Tourismeasy, aceptas estos términos. Si no estás de acuerdo, por favor no uses nuestra plataforma.</p>
        <h3>2. Naturaleza de la plataforma</h3>
        <p>Tourismeasy es una plataforma de conexión. No somos responsables por los servicios prestados directamente por las empresas aliadas.</p>
        <h3>3. Empresas aliadas</h3>
        <p>Las empresas deben cumplir con los estándares verificados por Tourismeasy para mantenerse activas en la plataforma.</p>
        <h3>4. Responsabilidad</h3>
        <p>Actuamos como intermediario tecnológico. Las condiciones específicas de cada servicio son responsabilidad de cada empresa aliada.</p>`,
        },
        accesibilidad: {
            title: "Declaración de Accesibilidad",
            content: `<p>En TourismEasy trabajamos para que más personas puedan consultar y utilizar la plataforma, con independencia de sus capacidades o de la tecnología que utilicen. Seguimos mejorando la accesibilidad; esta declaración no constituye una certificación de conformidad ni garantiza que todas las secciones cumplan completamente con una norma.</p>
        <h3>Herramientas de accesibilidad</h3>
        <p>El menú flotante de accesibilidad permite cambiar el idioma de la interfaz, aumentar o disminuir el tamaño del texto y restablecerlo al 100 %, activar alto contraste y usar lectura en voz alta cuando el navegador lo admite. El panel se abre desde el botón con el símbolo de accesibilidad.</p>
        <h3>Teclado y tecnologías de asistencia</h3>
        <p>Los controles interactivos se están adaptando para su uso con teclado y tecnologías de asistencia. La navegación y la compatibilidad pueden variar según la sección, el navegador y el dispositivo. La disponibilidad de la lectura en voz alta también depende de las voces instaladas.</p>
        <h3>Marco de referencia</h3>
        <p>Tomamos como referencia la <a href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=52081" target="_blank" rel="noopener noreferrer">Ley 1618 de 2013</a>, los lineamientos de accesibilidad web de la Resolución 1519 de 2020 y las pautas WCAG 2.1 nivel AA del W3C, en cuanto resulten aplicables. Esta referencia no significa que TourismEasy haya sido auditado o certificado bajo esas normas.</p>
        <h3>¿Encontraste una barrera?</h3>
        <p>Cuéntanos qué página y qué función te dieron dificultad para que podamos revisarlo. Escríbenos a <a href="mailto:tourismeasyadso@gmail.com">tourismeasyadso@gmail.com</a> o al <a href="https://wa.me/573174613395" target="_blank" rel="noopener noreferrer">+57 317 461 3395</a>.</p>`,
        },
    };

    const overlay = document.getElementById("modalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    const modalClose = document.getElementById("modalClose");
    const modalBox = document.getElementById("modalBox");
    let modalTrigger = null;

    function openModal(key) {
        const data = modalData[key];
        if (!data) return;
        modalTrigger = document.activeElement;
        modalTitle.textContent = data.title;
        modalContent.innerHTML = data.content;
        overlay.inert = false;
        overlay.setAttribute("aria-hidden", "false");
        overlay.classList.add("active");
        modalClose.focus();
    }

    function closeModal() {
        overlay.classList.remove("active");
        overlay.inert = true;
        overlay.setAttribute("aria-hidden", "true");
        if (modalTrigger instanceof HTMLElement) modalTrigger.focus();
    }

    // Delegación de eventos: funciona con cualquier link [data-modal] presente
    // en la página, esté donde esté (footer, contenido de otro modal, etc.)
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest("[data-modal]");
        if (!trigger) return;
        e.preventDefault();
        openModal(trigger.getAttribute("data-modal"));
    });

    modalClose.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (!overlay.classList.contains("active")) return;
        if (e.key === "Escape") {
            closeModal();
            return;
        }
        if (e.key !== "Tab") return;

        const focusable = modalBox.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
})();