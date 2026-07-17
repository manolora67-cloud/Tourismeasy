(function() {

    // Clave para guardar el consentimiento del usuario en localStorage
    var STORAGE_KEY = 'tourismeasy_cookie_consent';
    // Clave para recordar si ya se mostró el banner en esta sesión
    var SESSION_KEY = 'tourismeasy_cookie_shown';
    // Guarda el overflow original del body para restaurarlo al cerrar
    var savedBodyOverflow = '';

    /* ── Crea e inyecta el HTML del modal directamente en el <body> ──
       El modal no está escrito en el HTML, este JS lo construye y lo inserta */
    function injectModalHTML() {
        var html = `
        <!-- Fondo semitransparente que bloquea el resto de la página mientras el modal está abierto -->
        <div id="cookie-overlay" class="ck-overlay" aria-hidden="true"></div>

        <!-- Wrapper que centra el modal en la pantalla -->
        <div id="cookie-modal-wrap" class="ck-modal-wrap" aria-hidden="true">
            <div id="cookie-banner" class="ck-modal" role="dialog" aria-modal="true" aria-label="Aviso de cookies">
                <div class="ck-topbar"></div>
                <div class="ck-inner">

                    <!-- ══════════ PASO 1: Bienvenida ══════════ -->
                    <div class="ck-step active" id="ck-step-1">
                        <div class="ck-header">
                            <div class="ck-icon-big">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#a855f7" stroke-width="1.5"/>
                                    <circle cx="8.5" cy="9" r="1.5" fill="#a855f7"/>
                                    <circle cx="15.5" cy="10" r="1.5" fill="#a855f7"/>
                                    <circle cx="9" cy="15" r="1.2" fill="#7c3aed"/>
                                    <circle cx="15" cy="15" r="1" fill="#7c3aed"/>
                                    <circle cx="12" cy="6.5" r="1" fill="#c4b5fd"/>
                                </svg>
                            </div>
                            <div class="ck-text-block">
                                <p class="ck-step-label">Tu privacidad importa</p>
                                <p class="ck-title">Usamos cookies en TourismEasy</p>
                            </div>
                        </div>
                        <p class="ck-desc">Antes de continuar, queremos ser transparentes sobre cómo usamos tus datos para darte la mejor experiencia explorando Santander.</p>
                        <div class="ck-actions">
                            <!-- Acepta todo: acción principal, más destacada -->
                            <button class="ck-btn ck-btn-main" onclick="ckAcceptAll()">Aceptar todo</button>
                            <!-- Solo esenciales: acción secundaria -->
                            <button class="ck-btn ck-btn-outline" onclick="ckRejectAll()">Rechazar todo</button>
                            <!-- Personalizar: acción terciaria, va al paso 2 -->
                            <button class="ck-btn ck-btn-text" onclick="ckGoStep(2)">Personalizar preferencias</button>
                        </div>
                    </div>

                    <!-- ══════════ PASO 2: Configurar preferencias ══════════ -->
                    <div class="ck-step" id="ck-step-2">
                        <p class="ck-step-label">Configurar</p>
                        <p class="ck-title">¿Qué nos permites usar?</p>
                        <p class="ck-desc">Elige qué cookies activar. Las esenciales siempre están activas para que el sitio funcione.</p>

                        <!-- Cookies esenciales: siempre activas, no se pueden desactivar -->
                        <div class="ck-toggle-row">
                            <div class="ck-toggle-info">
                                <p class="ck-toggle-name">Esenciales</p>
                                <p class="ck-toggle-desc">Login, sesión activa y pagos seguros</p>
                            </div>
                            <span class="ck-badge">Siempre activas</span>
                        </div>

                        <!-- Cookies de análisis: toggle ON/OFF (por defecto activadas) -->
                        <div class="ck-toggle-row">
                            <div class="ck-toggle-info">
                                <p class="ck-toggle-name">Análisis</p>
                                <p class="ck-toggle-desc">Cómo usas el sitio y qué mejoramos</p>
                            </div>
                            <label class="ck-switch" aria-label="Activar cookies de análisis">
                                <input type="checkbox" id="ck-analytics" checked>
                                <span class="ck-track"></span>
                                <span class="ck-knob"></span>
                            </label>
                        </div>

                        <!-- Cookies de marketing: toggle ON/OFF (por defecto desactivadas) -->
                        <div class="ck-toggle-row">
                            <div class="ck-toggle-info">
                                <p class="ck-toggle-name">Marketing</p>
                                <p class="ck-toggle-desc">Destinos y planes turísticos personalizados</p>
                            </div>
                            <label class="ck-switch" aria-label="Activar cookies de marketing">
                                <input type="checkbox" id="ck-marketing">
                                <span class="ck-track"></span>
                                <span class="ck-knob"></span>
                            </label>
                        </div>

                        <div class="ck-actions-row">
                            <button class="ck-btn ck-btn-outline" onclick="ckGoStep(1)">← Volver</button>
                            <button class="ck-btn ck-btn-main" onclick="ckSaveCustom()">Guardar</button>
                        </div>
                    </div>

                    <!-- Pie legal con enlaces a las políticas -->
                    <p class="ck-legal">
                        <a href="#" onclick="ckOpenInfo('privacidad'); return false;">Política de Privacidad</a> ·
                        <a href="#" onclick="ckOpenInfo('cookies'); return false;">Política de Cookies</a> ·
                        Ley 1581 de 2012
                    </p>

                </div>
            </div>
        </div>

        <!-- Modal secundario que muestra el texto completo de las políticas -->
        <div id="ck-info-modal" class="ck-info-modal" aria-hidden="true">
            <div class="ck-info-box">
                <div class="ck-info-topbar"></div>
                <div class="ck-info-header">
                    <h2 class="ck-info-title" id="ck-info-title">Política</h2>
                    <button class="ck-info-close" onclick="ckCloseInfo()" aria-label="Cerrar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="ck-info-body" id="ck-info-body"></div>
                <div class="ck-info-footer">
                    <button class="ck-btn ck-btn-outline" onclick="ckCloseInfo()">← Volver</button>
                </div>
            </div>
        </div>
        `;
        // Inserta todo ese HTML justo antes del </body>
        document.body.insertAdjacentHTML('beforeend', html);
    }

    /* ── Cuando el DOM carga: inyecta el HTML y decide si mostrar el modal ── */
    document.addEventListener('DOMContentLoaded', function() {
        injectModalHTML();

        var alreadyShown = localStorage.getItem(SESSION_KEY);
        var saved = localStorage.getItem(STORAGE_KEY);

        if (!alreadyShown) {
            showBanner();
        } else if (saved) {
            try { applyConsent(JSON.parse(saved)); } catch (e) {}
        }
    });

    /* ── Bloquea el scroll de la página de fondo mientras el modal está abierto ── */
    function lockBodyScroll() {
        savedBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    }

    /* ── Restaura el scroll de la página ── */
    function unlockBodyScroll() {
        document.body.style.overflow = savedBodyOverflow;
    }

    /* ── Hace visible el modal y el overlay ── */
    function showBanner() {
        var wrap = document.getElementById('cookie-modal-wrap');
        var overlay = document.getElementById('cookie-overlay');
        if (!wrap) return;
        localStorage.setItem(SESSION_KEY, '1');
        wrap.classList.add('visible');
        if (overlay) overlay.classList.add('visible');
        wrap.removeAttribute('aria-hidden');
        lockBodyScroll();
        ckGoStep(1);
    }

    /* ── Oculta el modal, el overlay, y restaura el scroll ── */
    function hideBanner() {
        var wrap = document.getElementById('cookie-modal-wrap');
        var overlay = document.getElementById('cookie-overlay');
        if (!wrap) return;
        wrap.classList.remove('visible');
        if (overlay) overlay.classList.remove('visible');
        wrap.setAttribute('aria-hidden', 'true');
        unlockBodyScroll();
    }

    /* ── Navega entre los 2 pasos del modal ──
       n = número del paso al que queremos ir (1 o 2) */
    window.ckGoStep = function(n) {
        [1, 2].forEach(function(i) {
            var step = document.getElementById('ck-step-' + i);
            if (step) step.classList.remove('active');
        });
        var activeStep = document.getElementById('ck-step-' + n);
        if (activeStep) activeStep.classList.add('active');
    };

    /* ── El usuario hace clic en "Aceptar todo" ── */
    window.ckAcceptAll = function() {
        saveConsent({ essential: true, analytics: true, marketing: true });
        hideBanner();
    };

    /* ── El usuario elige solo lo esencial (rechaza análisis y marketing) ── */
    window.ckRejectAll = function() {
        saveConsent({ essential: true, analytics: false, marketing: false });
        hideBanner();
    };

    /* ── Guarda exactamente lo que el usuario seleccionó en los toggles ── */
    window.ckSaveCustom = function() {
        var analytics = document.getElementById('ck-analytics');
        var marketing = document.getElementById('ck-marketing');
        saveConsent({
            essential: true,
            analytics: analytics ? analytics.checked : false,
            marketing: marketing ? marketing.checked : false
        });
        hideBanner();
    };

    /* ── Guarda el consentimiento en localStorage y lo aplica ── */
    function saveConsent(consent) {
        consent.date = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        localStorage.setItem(SESSION_KEY, '1');
        applyConsent(consent);
    }

    /* ── Aplica el consentimiento: lo pone disponible globalmente ──
       Otros scripts del sitio pueden leer window.cookieConsent para saber qué está permitido */
    function applyConsent(consent) {
        window.cookieConsent = consent;
        document.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consent }));
    }

    /* ── Textos de las políticas de privacidad y cookies ──
       Se muestran en el modal cuando el usuario hace clic en los enlaces del pie legal */
    var ckInfoContent = {
        privacidad: {
            title: 'Política de Privacidad',
            html: '<p class="ck-info-fecha">Vigente desde abril de 2026 · Ley 1581 de 2012</p>' +
                '<h3>1. Responsable del tratamiento</h3>' +
                '<p>TourismEasy, plataforma digital con sede en Bucaramanga, Santander, Colombia, es responsable del tratamiento de los datos personales recopilados a través de este sitio.</p>' +
                '<h3>2. Datos que recopilamos</h3>' +
                '<p>Recopilamos datos que tú nos proporcionas directamente: nombre, correo electrónico, tipo de usuario y preferencias de accesibilidad. También recopilamos datos de uso de forma automática mediante cookies.</p>' +
                '<h3>3. Finalidad del tratamiento</h3>' +
                '<p>Usamos tus datos para gestionar tu cuenta, procesar reservas, mostrarte contenido personalizado y mejorar la plataforma. No vendemos tus datos a terceros.</p>' +
                '<h3>4. Derechos del titular</h3>' +
                '<p>Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos, así como a revocar la autorización otorgada, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.</p>' +
                '<h3>5. Contacto</h3>' +
                '<p>Para ejercer tus derechos escríbenos a <strong>privacidad@tourismeasy.com</strong>.</p>'
        },
        cookies: {
            title: 'Política de Cookies',
            html: '<p class="ck-info-fecha">Vigente desde abril de 2026 · Ley 1581 de 2012</p>' +
                '<h3>1. ¿Qué son las cookies?</h3>' +
                '<p>Las cookies son pequeños archivos que se almacenan en tu dispositivo cuando visitas un sitio web. Nos permiten recordar tus preferencias y mejorar tu experiencia.</p>' +
                '<h3>2. Tipos de cookies que usamos</h3>' +
                '<p><strong>Esenciales:</strong> necesarias para el funcionamiento del sitio (inicio de sesión, carrito de reservas, seguridad). No pueden desactivarse.</p>' +
                '<p><strong>Análisis:</strong> nos ayudan a entender cómo usas la plataforma para mejorarla. Puedes desactivarlas desde el modal de preferencias.</p>' +
                '<p><strong>Marketing:</strong> permiten mostrarte planes y destinos personalizados según tus intereses. Puedes desactivarlas en cualquier momento.</p>' +
                '<h3>3. Control de cookies</h3>' +
                '<p>Puedes cambiar tus preferencias de cookies en cualquier momento desde el pie de página. También puedes configurarlas desde tu navegador, aunque esto puede afectar el funcionamiento del sitio.</p>' +
                '<h3>4. Contacto</h3>' +
                '<p>Para más información escríbenos a <strong>privacidad@tourismeasy.com</strong>.</p>'
        }
    };

    /* ── Abre el modal con el texto de una política ──
       tipo puede ser 'privacidad' o 'cookies' */
    window.ckOpenInfo = function(tipo) {
        var modal = document.getElementById('ck-info-modal');
        var title = document.getElementById('ck-info-title');
        var body = document.getElementById('ck-info-body');
        if (!modal) return;
        var content = ckInfoContent[tipo];
        if (!content) return;
        title.textContent = content.title;
        body.innerHTML = content.html;
        modal.classList.add('visible');
        modal.removeAttribute('aria-hidden');
    };

    /* ── Cierra el modal de políticas ── */
    window.ckCloseInfo = function() {
        var modal = document.getElementById('ck-info-modal');
        if (!modal) return;
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
    };

})(); // Fin del IIFE — se ejecuta automáticamente al cargar el archivo
