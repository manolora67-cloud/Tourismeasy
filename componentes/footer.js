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
          <p>&copy; 2026 TOURISMEASY. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>

    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-box" id="modalBox">
        <button class="modal-close" id="modalClose">&times;</button>
        <h2 id="modalTitle"></h2>
        <div id="modalContent"></div>
      </div>
    </div>
  `;

    // ---- Contenido de cada modal del footer ----
    const modalData = {
        "como-funciona": {
            title: "Cómo Funciona",
            content: `<p>Tourismeasy funciona como una plataforma de conexión entre empresas turísticas de Santander y viajeros con necesidades de accesibilidad.</p>
        <h3>Para las empresas aliadas</h3>
        <ul>
          <li>Registras tu empresa y tus servicios accesibles</li>
          <li>Apareces en nuestra plataforma ante miles de viajeros</li>
          <li>Recibes solicitudes de reserva directamente</li>
          <li>Gestionas tu perfil y disponibilidad desde tu panel</li>
        </ul>
        <h3>Para los viajeros</h3>
        <ul>
          <li>Buscan destinos y servicios accesibles en Santander</li>
          <li>Filtran por tipo de accesibilidad que necesitan</li>
          <li>Se conectan con empresas verificadas</li>
          <li>Reservan con confianza y seguridad</li>
        </ul>`,
        },
        aliados: {
            title: "Únete como Aliado",
            content: `<p>¿Tienes una empresa turística en Santander con servicios accesibles o quieres adaptarlos? ¡TourismEasy es tu plataforma!</p>
        <h3>¿Quiénes pueden unirse?</h3>
        <ul>
          <li>🏨 Hoteles y hospedajes con infraestructura accesible</li>
          <li>✈️ Agencias de viaje con planes inclusivos</li>
          <li>🎒 Operadores turísticos con guías especializados</li>
        </ul>
        <h3>Beneficios de ser aliado</h3>
        <ul>
          <li>👀 Visibilidad ante un mercado en crecimiento</li>
          <li>✅ Verificación y sello de accesibilidad TourismEasy</li>
          <li>📊 Panel de gestión de reservas y clientes</li>
          <li>👍 Apoyo en la certificación de accesibilidad</li>
        </ul>
        <p>Escríbenos a <strong>aliados@tourismeasy.com</strong> o llámanos al <strong>+57 317 461 3395</strong></p>`,
        },
        prensa: {
            title: "Prensa",
            content: `<p>Tourismeasy está posicionándose como el referente del turismo inclusivo en Santander, conectando el sector empresarial con un mercado desatendido y en crecimiento.</p>
        <h3>Contacto de prensa</h3>
        <p>Para entrevistas, notas de prensa o información sobre nuestra plataforma:</p>
        <p><strong>prensa@tourismeasy.com</strong><br>+57 317 461 3395</p>`,
        },
        contacto: {
            title: "Contacto",
            content: `<p>Estamos aquí para ayudarte. Puedes contactarnos por cualquiera de estos medios:</p>
        <ul>
          <li>📧 <strong>Email:</strong> hola@tourismeasy.com</li>
          <li>📞 <strong>Teléfono:</strong> +57 317 461 3395</li>
          <li>💬 <strong>WhatsApp:</strong> <a href="https://wa.me/573174613395" target="_blank" rel="noopener noreferrer">+57 317 461 3395</a></li>
          <li>📍 <strong>Ubicación:</strong> Bucaramanga, Santander, Colombia</li>
        </ul>
        <p>Horario de atención: Lunes a Viernes 8:00am – 8:00pm</p>`,
        },
        faq: {
            title: "Preguntas Frecuentes",
            content: `<details><summary>¿Tourismeasy es una agencia de viajes?</summary><p>No. Somos una plataforma que conecta empresas turísticas de Santander con viajeros que necesitan servicios accesibles. No vendemos paquetes directamente.</p></details>
        <details><summary>¿Solo trabajamos en Santander?</summary><p>Sí, por ahora nos enfocamos en Santander. Queremos ser el mejor directorio de turismo inclusivo del departamento antes de expandirnos.</p></details>
        <details><summary>¿Qué tipo de empresas pueden unirse?</summary><p>Agencias de viaje, hoteles, operadores turísticos y transportadoras que ofrezcan o quieran ofrecer servicios accesibles en Santander.</p></details>
        <details><summary>¿Cómo sé que un servicio es realmente accesible?</summary><p>Todas las empresas aliadas pasan por un proceso de verificación y reciben nuestro sello de accesibilidad según el tipo de servicio que ofrecen.</p></details>`,
        },
        ayuda: {
            title: "Centro de Ayuda",
            content: `<p>Encuentra recursos para sacar el máximo provecho de Tourismeasy:</p>
        <ul>
          <li>📖 <a href="#">Guía para empresas aliadas</a></li>
          <li>🎥 <a href="#">Videos: cómo registrar tu empresa</a></li>
          <li>📋 <a href="#">Cómo obtener el sello de accesibilidad</a></li>
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
        <p>Usamos tu información para conectarte con empresas aliadas, mejorar nuestra plataforma y enviarte comunicaciones relevantes sobre turismo inclusivo en Santander.</p>
        <h3>3. Compartir información</h3>
        <p>No vendemos tu información personal a terceros. Solo compartimos datos con empresas aliadas cuando realizas una solicitud de servicio.</p>
        <h3>4. Tus derechos</h3>
        <p>Tienes derecho a acceder, corregir o eliminar tus datos personales contactándonos a privacidad@tourismeasy.com</p>`,
        },
        terminos: {
            title: "Términos de Servicio",
            content: `<h3>1. Aceptación de términos</h3>
        <p>Al usar Tourismeasy, aceptas estos términos. Si no estás de acuerdo, por favor no uses nuestra plataforma.</p>
        <h3>2. Naturaleza de la plataforma</h3>
        <p>Tourismeasy es una plataforma de conexión. No somos responsables por los servicios prestados directamente por las empresas aliadas.</p>
        <h3>3. Empresas aliadas</h3>
        <p>Las empresas deben cumplir con los estándares de accesibilidad verificados por Tourismeasy para mantenerse activas en la plataforma.</p>
        <h3>4. Responsabilidad</h3>
        <p>Actuamos como intermediario tecnológico. Las condiciones específicas de cada servicio son responsabilidad de cada empresa aliada.</p>`,
        },
    };

    const overlay = document.getElementById("modalOverlay");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    const modalClose = document.getElementById("modalClose");

    function openModal(key) {
        const data = modalData[key];
        if (!data) return;
        modalTitle.textContent = data.title;
        modalContent.innerHTML = data.content;
        overlay.classList.add("active");
    }

    // Delegación de eventos: funciona con cualquier link [data-modal] presente
    // en la página, esté donde esté (footer, contenido de otro modal, etc.)
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest("[data-modal]");
        if (!trigger) return;
        e.preventDefault();
        openModal(trigger.getAttribute("data-modal"));
    });

    modalClose.addEventListener("click", () => overlay.classList.remove("active"));
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.classList.remove("active");
    });
})();