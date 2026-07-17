(function() {
    "use strict";

    // ── Resuelve rutas según si estamos en la raíz o dentro de /html/ ──
    // login.js se carga tanto desde index.html (raíz) como desde html/*.html
    const _enHtml = window.location.pathname.includes("/html/");
    const _imgLogo = _enHtml ? "../img/TURISMEASY.png" : "img/TURISMEASY.png";

    //este modal se inyecta al cargar la pagina, ya que no esta en el html
    const modalHTML = `
<div class="auth-overlay" id="authOverlay" role="dialog" aria-modal="true" aria-labelledby="authDialogTitle">
  <div class="auth-box" id="authBox">

    <div class="auth-header">
      <button class="auth-close" id="authClose" aria-label="Cerrar">&times;</button>
      <div class="auth-logo">
        <img src="${_imgLogo}" alt="Logo" class="auth-logo-img" onerror="this.style.display='none'">
        <span class="auth-logo-text">TOURISMEASY</span>
      </div>
      <p id="authDialogTitle">Tu viaje accesible comienza aquí</p>
    </div>

    <!-- Pestañas: "Iniciar sesión" y "Registrarse" -->
    <div class="auth-tabs">
      <button class="auth-tab active" id="tabLogin">Iniciar sesión</button>
      <button class="auth-tab" id="tabRegister">Registrarse</button>
    </div>

    <div class="auth-body">

      <!-- ════════ FORMULARIO DE LOGIN ════════ -->
      <form class="auth-form active" id="formLogin" novalidate autocomplete="off">

        <!-- Selección del tipo de usuario: viajero o empresa (admin no se muestra, se detecta por credenciales) -->
        <div class="field-group">
          <label>¿Cómo deseas ingresar?</label>
          <div class="user-type-group">
            <button type="button" class="user-type-btn selected" id="loginAsViajero" data-login-type="viajero">
              <i class="fa-solid fa-person-walking-luggage"></i> Soy viajero
            </button>
            <button type="button" class="user-type-btn" id="loginAsEmpresa" data-login-type="empresa">
              <i class="fa-solid fa-building"></i> Soy empresa
            </button>
          </div>
        </div>

        <!-- Campo de correo electrónico -->
        <div class="field-group">
          <label for="loginEmail">Correo electrónico</label>
          <div class="field-wrap">
            <i class="fa-solid fa-envelope field-icon"></i>
            <input type="email" id="loginEmail" placeholder="tuemail@correo.com" autocomplete="email">
          </div>
          <span class="field-msg" id="loginEmailMsg"></span>
        </div>

        <!-- Campo de contraseña con botón para mostrar/ocultar -->
        <div class="field-group">
          <label for="loginPass">Contraseña</label>
          <div class="field-wrap has-toggle">
            <i class="fa-solid fa-lock field-icon"></i>
            <input type="password" id="loginPass" placeholder="Tu contraseña" autocomplete="current-password">
            <button type="button" class="toggle-pass" data-target="loginPass" aria-label="Mostrar contraseña">
              <i class="fa-solid fa-eye"></i>
            </button>
          </div>
          <span class="field-msg" id="loginPassMsg"></span>
        </div>

        <div class="forgot-link"><a href="#" id="forgotLink">¿Olvidaste tu contraseña?</a></div>

        <!-- Botón de envío del formulario de login -->
        <button type="submit" class="btn-auth" id="btnLogin">
          <span class="btn-text"><i class="fa-solid fa-right-to-bracket"></i> Iniciar sesión</span>
          <div class="btn-spinner"></div>
        </button>

        <!-- Botones de login social (Google, Facebook) — decorativos por ahora -->
        <div class="auth-divider"><span>o continúa con</span></div>
        <div class="social-auth">
          <button type="button" class="btn-social">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google"> Google
          </button>
          <button type="button" class="btn-social">
            <img src="https://www.svgrepo.com/show/448224/facebook.svg" alt="Facebook"> Facebook
          </button>
        </div>
        <p class="auth-switch">¿No tienes cuenta? <a id="goRegister">Regístrate gratis</a></p>
      </form>

      <!-- ════════ FORMULARIO DE REGISTRO ════════ -->
      <form class="auth-form" id="formRegister" novalidate autocomplete="off">

        <!-- Indicador de progreso (3 puntos = 3 pasos) -->
        <div class="reg-steps" id="regSteps">
          <div class="reg-step-dot active"></div>
          <div class="reg-step-dot"></div>
          <div class="reg-step-dot"></div>
        </div>

        <!-- PASO 0: Elegir tipo de cuenta (viajero o empresa) -->
        <div class="reg-step" id="regStep0">
          <div class="field-group">
            <label>¿Cómo usarás TourismEasy?</label>
            <div class="user-type-group">
              <button type="button" class="user-type-btn selected" data-type="viajero">
                <i class="fa-solid fa-person-walking-luggage"></i> Soy viajero
              </button>
              <button type="button" class="user-type-btn" data-type="empresa">
                <i class="fa-solid fa-building"></i> Soy empresa
              </button>
            </div>
          </div>
          <button type="button" class="btn-auth" id="btnStep0Next">
            <span class="btn-text">Continuar <i class="fa-solid fa-arrow-right"></i></span>
          </button>
          <p class="auth-switch">¿Ya tienes cuenta? <a id="goLogin">Inicia sesión</a></p>
        </div>

        <!-- REGISTRO VIAJERO — Paso 1: Datos personales -->
        <div class="reg-step" id="vStep1" style="display:none; flex-direction:column; gap:14px;">
          <div class="step-label"><i class="fa-solid fa-person-walking-luggage"></i> Datos personales</div>
          <div class="field-row">
            <div class="field-group">
              <label for="vNombre">Nombre</label>
              <div class="field-wrap"><i class="fa-solid fa-user field-icon"></i><input type="text" id="vNombre" placeholder="Nombre"></div>
              <span class="field-msg" id="vNombreMsg"></span>
            </div>
            <div class="field-group">
              <label for="vApellido">Apellido</label>
              <div class="field-wrap"><i class="fa-solid fa-user field-icon"></i><input type="text" id="vApellido" placeholder="Apellido"></div>
              <span class="field-msg" id="vApellidoMsg"></span>
            </div>
          </div>
          <div class="field-group">
            <label for="vEmail">Correo electrónico</label>
            <div class="field-wrap"><i class="fa-solid fa-envelope field-icon"></i><input type="email" id="vEmail" placeholder="tuemail@correo.com"></div>
            <span class="field-msg" id="vEmailMsg"></span>
          </div>
          <div class="field-group">
            <label for="vTipoDoc">Tipo de documento</label>
            <div class="field-wrap">
              <i class="fa-solid fa-id-card field-icon"></i>
              <select id="vTipoDoc">
                <option value="">Selecciona tipo de documento</option>
                <option value="1">Cédula de Ciudadanía</option>
                <option value="2">Cédula de Extranjería</option>
              </select>
            </div>
            <span class="field-msg" id="vTipoDocMsg"></span>
          </div>
          <div class="field-group">
            <label for="vCedula">Número de documento</label>
            <div class="field-wrap"><i class="fa-solid fa-hashtag field-icon"></i><input type="text" id="vCedula" placeholder="Número de documento" maxlength="10" inputmode="numeric"></div>
            <span class="field-msg" id="vCedulaMsg"></span>
          </div>
          <div class="field-group">
            <label for="vTel">Teléfono</label>
            <!-- Selector de código de país (+57 Colombia, +58 Venezuela) + campo numérico -->
            <div class="tel-wrap-simple">
              <select id="vTelCod" class="tel-cod">
                <option value="+57">🇨🇴 +57</option>
                <option value="+58">🇻🇪 +58</option>
              </select>
              <input type="tel" id="vTel" class="tel-num" placeholder="3001234567" maxlength="10">
            </div>
            <span class="field-msg" id="vTelMsg"></span>
          </div>
          <!-- Campo opcional de accesibilidad — inclusión desde el registro -->
          <div class="field-group">
            <label for="vDisc">¿Tienes alguna necesidad de accesibilidad? <span class="opt-label">(opcional)</span></label>
            <div class="field-wrap">
              <i class="fa-solid fa-wheelchair field-icon"></i>
              <select id="vDisc">
                <option value="ninguna">Ninguna / Prefiero no decirlo</option>
                <option value="motriz">Discapacidad motriz</option>
                <option value="visual">Discapacidad visual</option>
                <option value="auditiva">Discapacidad auditiva</option>
                <option value="cognitiva">Discapacidad cognitiva</option>
                <option value="multiple">Múltiple</option>
                <option value="otra">Otra</option>
              </select>
            </div>
          </div>
          <!-- Campo extra que aparece si elige "Otra" en el select anterior -->
          <div class="field-group" id="vDiscOtraGroup" style="display:none;">
            <label for="vDiscOtra">¿Cuál es tu necesidad de accesibilidad?</label>
            <div class="field-wrap"><i class="fa-solid fa-pen field-icon"></i><input type="text" id="vDiscOtra" placeholder="Describe tu necesidad"></div>
          </div>
          <div class="nav-btns">
            <button type="button" class="btn-back" id="vStep1Back"><i class="fa-solid fa-arrow-left"></i></button>
            <button type="button" class="btn-auth" id="vStep1Next" style="flex:1">
              <span class="btn-text">Continuar <i class="fa-solid fa-arrow-right"></i></span>
            </button>
          </div>
        </div>

        <!-- REGISTRO VIAJERO — Paso 2: Contraseña -->
        <div class="reg-step" id="vStep2" style="display:none; flex-direction:column; gap:14px;">
          <div class="step-label"><i class="fa-solid fa-lock"></i> Crea tu contraseña</div>
          <div class="field-group">
            <label for="vPass">Contraseña</label>
            <div class="field-wrap has-toggle">
              <i class="fa-solid fa-lock field-icon"></i>
              <!-- maxlength="10": la contraseña acepta entre 8 y 10 caracteres -->
              <input type="password" id="vPass" placeholder="8-30 caracteres" autocomplete="new-password" maxlength="30">
              <button type="button" class="toggle-pass" data-target="vPass"><i class="fa-solid fa-eye"></i></button>
            </div>
            <!-- Barras indicadoras de fortaleza de la contraseña (se colorean con JS) -->
            <div class="pass-strength">
              <div class="pass-strength-bar" id="vPsBar1"></div><div class="pass-strength-bar" id="vPsBar2"></div>
              <div class="pass-strength-bar" id="vPsBar3"></div><div class="pass-strength-bar" id="vPsBar4"></div>
            </div>
            <span class="pass-strength-label" id="vPassLabel"></span>
            <span class="field-msg" id="vPassMsg"></span>
          </div>
          <div class="field-group">
            <label for="vPassConf">Confirmar contraseña</label>
            <div class="field-wrap has-toggle">
              <i class="fa-solid fa-lock field-icon"></i>
              <input type="password" id="vPassConf" placeholder="Repite tu contraseña" autocomplete="new-password">
              <button type="button" class="toggle-pass" data-target="vPassConf"><i class="fa-solid fa-eye"></i></button>
            </div>
            <span class="field-msg" id="vPassConfMsg"></span>
          </div>
          <div class="check-row">
            <input type="checkbox" id="vTerms">
            <label for="vTerms">Acepto los <a href="#">Términos de Servicio</a> y la <a href="#">Política de Privacidad</a>.</label>
          </div>
          <span class="field-msg" id="vTermsMsg"></span>
          <div class="nav-btns">
            <button type="button" class="btn-back" id="vStep2Back"><i class="fa-solid fa-arrow-left"></i></button>
            <button type="submit" class="btn-auth" id="btnRegViajero" style="flex:1">
              <span class="btn-text"><i class="fa-solid fa-user-plus"></i> Crear cuenta</span>
              <div class="btn-spinner"></div>
            </button>
          </div>
        </div>

        <!-- REGISTRO EMPRESA — Paso 1: Datos de la empresa -->
        <div class="reg-step" id="eStep1" style="display:none; flex-direction:column; gap:14px;">
          <div class="step-label"><i class="fa-solid fa-building"></i> Datos de la empresa</div>
          <div class="field-group">
            <label for="eNombre">Nombre de la empresa</label>
            <div class="field-wrap"><i class="fa-solid fa-building field-icon"></i><input type="text" id="eNombre" placeholder="Ej: Viajes Santander S.A.S"></div>
            <span class="field-msg" id="eNombreMsg"></span>
          </div>
          <div class="field-group">
            <label for="eNit">NIT</label>
            <div class="field-wrap"><i class="fa-solid fa-id-card field-icon"></i><input type="text" id="eNit" placeholder="Ej: 900.123.456-7"></div>
            <span class="field-msg" id="eNitMsg"></span>
          </div>
          <!-- Tipo de servicio turístico que ofrece la empresa -->
          <div class="field-group">
            <label>Tipo de servicio que ofrece</label>
            <div class="service-type-group">
              <button type="button" class="service-type-btn" data-service="TRANSPORTE"><i class="fa-solid fa-bus"></i> Transporte</button>
              <button type="button" class="service-type-btn" data-service="HOSPEDAJE"><i class="fa-solid fa-hotel"></i> Hospedaje</button>
              <button type="button" class="service-type-btn" data-service="PLANES"><i class="fa-solid fa-map-location-dot"></i> Planes turísticos</button>
              <button type="button" class="service-type-btn" data-service="PERSONAL_AUXILIAR"><i class="fa-solid fa-person-cane"></i> Personal Auxiliar</button>
            </div>
            <span class="field-msg" id="eServiceMsg"></span>
          </div>
          <!-- Lista completa de municipios de Santander -->
          <div class="field-group">
            <label for="eUbicacion">Ciudad / Municipio</label>
            <div class="field-wrap">
              <i class="fa-solid fa-location-dot field-icon"></i>
              <select id="eUbicacion">
                <option value="">Selecciona una ciudad</option>
                <option value="68013">Aguada</option><option value="68020">Albania</option><option value="68051">Aratoca</option><option value="68077">Barbosa</option>
                <option value="68079">Barichara</option><option value="68081">Barrancabermeja</option><option value="68092">Betulia</option><option value="68101">Bolívar</option>
                <option value="68001">Bucaramanga</option><option value="68121">Cabrera</option><option value="68132">California</option><option value="68147">Capitanejo</option>
                <option value="68152">Carcasí</option><option value="68160">Cepitá</option><option value="68162">Cerrito</option><option value="68167">Charalá</option>
                <option value="68169">Charta</option><option value="68176">Chima</option><option value="68179">Chipatá</option><option value="68190">Cimitarra</option>
                <option value="68207">Concepción</option><option value="68209">Confines</option><option value="68211">Contratación</option><option value="68217">Coromoro</option>
                <option value="68229">Curití</option><option value="68235">El Carmen de Chucurí</option><option value="68245">El Guacamayo</option><option value="68250">El Peñón</option>
                <option value="68255">El Playón</option><option value="68264">Encino</option><option value="68266">Enciso</option><option value="68271">Florián</option>
                <option value="68276">Floridablanca</option><option value="68296">Galán</option><option value="68298">Gámbita</option><option value="68307">Girón</option>
                <option value="68318">Guaca</option><option value="68320">Guadalupe</option><option value="68322">Guapotá</option><option value="68324">Guavatá</option>
                <option value="68327">Güepsa</option><option value="68344">Hato</option><option value="68368">Jesús María</option><option value="68370">Jordán</option>
                <option value="68377">La Belleza</option><option value="68397">La Paz</option><option value="68385">Landázuri</option><option value="68406">Lebrija</option>
                <option value="68418">Los Santos</option><option value="68425">Macaravita</option><option value="68432">Málaga</option><option value="68444">Matanza</option>
                <option value="68464">Mogotes</option><option value="68468">Molagavita</option><option value="68498">Ocamonte</option><option value="68500">Oiba</option>
                <option value="68502">Onzaga</option><option value="68522">Palmar</option><option value="68524">Palmas del Socorro</option><option value="68533">Páramo</option>
                <option value="68547">Piedecuesta</option><option value="68549">Pinchote</option><option value="68572">Puente Nacional</option><option value="68573">Puerto Parra</option>
                <option value="68575">Puerto Wilches</option><option value="68615">Rionegro</option><option value="68655">Sabana de Torres</option><option value="68669">San Andrés</option>
                <option value="68673">San Benito</option><option value="68679">San Gil</option><option value="68682">San Joaquín</option><option value="68684">San José de Miranda</option>
                <option value="68686">San Miguel</option><option value="68689">San Vicente de Chucurí</option><option value="68705">Santa Bárbara</option>
                <option value="68720">Santa Helena del Opón</option><option value="68745">Simacota</option><option value="68755">Socorro</option><option value="68770">Suaita</option>
                <option value="68773">Sucre</option><option value="68780">Suratá</option><option value="68820">Tona</option><option value="68855">Valle de San José</option>
                <option value="68861">Vélez</option><option value="68867">Vetas</option><option value="68872">Villanueva</option><option value="68895">Zapatoca</option>
              </select>
            </div>
            <span class="field-msg" id="eUbicacionMsg"></span>
          </div>
          <div class="nav-btns">
            <button type="button" class="btn-back" id="eStep1Back"><i class="fa-solid fa-arrow-left"></i></button>
            <button type="button" class="btn-auth" id="eStep1Next" style="flex:1">
              <span class="btn-text">Continuar <i class="fa-solid fa-arrow-right"></i></span>
            </button>
          </div>
        </div>

        <!-- REGISTRO EMPRESA — Paso 2: Correo, teléfono y contraseña -->
        <div class="reg-step" id="eStep2" style="display:none; flex-direction:column; gap:14px;">
          <div class="step-label"><i class="fa-solid fa-envelope"></i> Contacto y acceso</div>
          <div class="field-group">
            <label for="eEmail">Correo institucional</label>
            <div class="field-wrap"><i class="fa-solid fa-envelope field-icon"></i><input type="email" id="eEmail" placeholder="contacto@miempresa.com"></div>
            <span class="field-msg" id="eEmailMsg"></span>
          </div>
          <div class="field-group">
            <label for="eTel">Teléfono de contacto</label>
            <div class="tel-wrap-simple">
              <select id="eTelCod" class="tel-cod">
                <option value="+57">🇨🇴 +57</option>
                <option value="+58">🇻🇪 +58</option>
              </select>
              <input type="tel" id="eTel" class="tel-num" placeholder="3001234567" maxlength="10">
            </div>
            <span class="field-msg" id="eTelMsg"></span>
          </div>
          <div class="field-group">
            <label for="ePass">Contraseña</label>
            <div class="field-wrap has-toggle">
              <i class="fa-solid fa-lock field-icon"></i>
              <input type="password" id="ePass" placeholder="8-30 caracteres" autocomplete="new-password" maxlength="30">
              <button type="button" class="toggle-pass" data-target="ePass"><i class="fa-solid fa-eye"></i></button>
            </div>
            <div class="pass-strength">
              <div class="pass-strength-bar" id="ePsBar1"></div><div class="pass-strength-bar" id="ePsBar2"></div>
              <div class="pass-strength-bar" id="ePsBar3"></div><div class="pass-strength-bar" id="ePsBar4"></div>
            </div>
            <span class="pass-strength-label" id="ePassLabel"></span>
            <span class="field-msg" id="ePassMsg"></span>
          </div>
          <div class="field-group">
            <label for="ePassConf">Confirmar contraseña</label>
            <div class="field-wrap has-toggle">
              <i class="fa-solid fa-lock field-icon"></i>
              <input type="password" id="ePassConf" placeholder="Repite tu contraseña" autocomplete="new-password">
              <button type="button" class="toggle-pass" data-target="ePassConf"><i class="fa-solid fa-eye"></i></button>
            </div>
            <span class="field-msg" id="ePassConfMsg"></span>
          </div>
          <div class="check-row">
            <input type="checkbox" id="eTerms">
            <label for="eTerms">Acepto los <a href="#">Términos de Servicio</a> para empresas aliadas y la <a href="#">Política de Privacidad</a>.</label>
          </div>
          <span class="field-msg" id="eTermsMsg"></span>
          <div class="nav-btns">
            <button type="button" class="btn-back" id="eStep2Back"><i class="fa-solid fa-arrow-left"></i></button>
            <button type="submit" class="btn-auth" id="btnRegEmpresa" style="flex:1">
              <span class="btn-text"><i class="fa-solid fa-building-circle-check"></i> Registrar empresa</span>
              <div class="btn-spinner"></div>
            </button>
          </div>
        </div>

      </form>

      <!-- Pantalla de éxito (registro completado o contraseña enviada) -->
      <div class="auth-success" id="authSuccess">
        <div class="success-icon" id="successIcon"><i class="fa-solid fa-check"></i></div>
        <h3 id="successTitle">¡Bienvenido!</h3>
        <p id="successMsg">Cuenta creada exitosamente.</p>
        <button class="btn-auth" id="btnSuccessClose" style="max-width:220px;">
          <span class="btn-text">Empezar a explorar</span>
        </button>
      </div>

    </div>
  </div>
</div>
`;

    // Insertamos el modal al final del <body>
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Atajo: $ es como document.getElementById pero más corto
    const $ = (id) => document.getElementById(id);

    /* ============================================================
       GESTIÓN DE SESIÓN
       Guarda y lee el usuario logueado en sessionStorage
    ============================================================ */
    function saveSession(user) {
        sessionStorage.setItem("te_session", JSON.stringify(user));
    }

    function getSession() {
        try {
            return JSON.parse(sessionStorage.getItem("te_session"));
        } catch (e) {
            return null;
        }
    }

    function clearSession() {
        sessionStorage.removeItem("te_session");
    }

    // (_enHtml ya se calculó al inicio del archivo, se reutiliza aquí)

    function _ruta(archivo) {
        return _enHtml ? archivo : "html/" + archivo;
    }

    function _raiz() {
        return _enHtml ? "../index.html" : "index.html";
    }

    // ── Si hay sesión de empresa activa, no puede navegar por el sitio público ──
    // Solo le está permitido estar en su panel, su perfil o su configuración.
    // Cualquier otra página pública (index, hospedaje, transporte, etc.) la
    // redirige de inmediato a su panel.
    function _guardEmpresa() {
        const sess = getSession();
        if (!sess || sess.tipo !== "empresa") return;

        const PAGINAS_EMPRESA = ["panel_transporte.html", "panel_hospedaje.html", "panel_planes.html", "panel_auxiliar.html", "perfil_empresa.html", "config_empresa.html"];
        const paginaActual = window.location.pathname.split("/").pop();

        if (!PAGINAS_EMPRESA.includes(paginaActual)) {
            const _srv = (getSession().tipoServicio || "").toLowerCase();
            const _panelMap = { transporte: "panel_transporte.html", hospedaje: "panel_hospedaje.html", planes: "panel_planes.html", auxiliar: "panel_auxiliar.html", personal_auxiliar: "panel_auxiliar.html" };
            window.location.replace(_ruta(_panelMap[_srv] || "panel_transporte.html"));
        }
    }
    _guardEmpresa();

    // ── Volver a revisar al restaurar desde la caché del navegador (bfcache) ──
    // Si el usuario usa la flecha "atrás"/"adelante", el navegador a veces
    // restaura una versión congelada de la página sin volver a ejecutar los
    // scripts. El evento "pageshow" con persisted=true nos avisa de eso, y ahí
    // repetimos la guardia (y refrescamos el widget de sesión del navbar) para
    // que no se quede mostrando una sesión vieja.
    window.addEventListener("pageshow", function(e) {
        if (e.persisted) {
            _guardEmpresa();
            applySession();
        }
    });

    // ── Aplica el estado de sesión en la UI de la página ──
    // Muestra u oculta el botón "Acceder" e inyecta el widget de usuario si hay sesión
    function applySession() {
        const user = getSession();

        // Ocultar/mostrar botones "Acceder" según si hay sesión
        document
            .querySelectorAll(".btn-acceder")
            .forEach((b) => (b.style.display = user ? "none" : ""));
        const btnMob = document.getElementById("btnAccederMobile");
        if (btnMob) btnMob.style.display = user ? "none" : "";

        // Limpiar widgets previos para no duplicar
        document.querySelectorAll(".session-widget").forEach((w) => w.remove());

        if (user) {
            // Links del menú desplegable, distintos según el tipo de usuario
            // Para empresas: calcular ícono según tipo de servicio
            const _srvIconos = { TRANSPORTE: "fa-bus", PLANES: "fa-map-location-dot", HOSPEDAJE: "fa-hotel", PERSONAL_AUXILIAR: "fa-person-cane" };
            const _srvNorm = { transporte: "TRANSPORTE", planes: "PLANES", hospedaje: "HOSPEDAJE", auxiliar: "PERSONAL_AUXILIAR", personal_auxiliar: "PERSONAL_AUXILIAR" };
            let _srvKey = "TRANSPORTE";
            if (user.tipo === "empresa") {
                _srvKey = _srvNorm[(user.tipoServicio || "").toLowerCase()] || "TRANSPORTE";
            }
            const _iconoEmp = _srvIconos[_srvKey] || "fa-bus";

            const menuItems =
                user.tipo === "admin" ?
                `<a class="session-menu-item session-menu-highlight" href="${_ruta('panel_admin.html')}"><i class="fa-solid fa-shield-halved"></i> Panel Admin</a>
             <a class="session-menu-item" href="${_ruta('perfil_admin.html')}"><i class="fa-solid fa-user"></i> Mi Perfil</a>
             <a class="session-menu-item" href="${_ruta('config_admin.html')}"><i class="fa-solid fa-gear"></i> Configuración</a>
             <a class="session-menu-item session-menu-danger" id="btnLogout" href="#"><i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</a>` :
                user.tipo === "empresa" ?
                `<a class="session-menu-item session-menu-highlight" href="${_ruta({ TRANSPORTE: 'panel_transporte.html', HOSPEDAJE: 'panel_hospedaje.html', PLANES: 'panel_planes.html', PERSONAL_AUXILIAR: 'panel_auxiliar.html' }[_srvKey] || 'panel_transporte.html')}"><i class="fa-solid ${_iconoEmp}"></i> Mi Panel</a>
               <a class="session-menu-item" href="${_ruta('perfil_empresa.html')}"><i class="fa-solid fa-user"></i> Mi Perfil</a>
               <a class="session-menu-item" href="${_ruta('config_empresa.html')}"><i class="fa-solid fa-gear"></i> Configuración</a>
               <a class="session-menu-item session-menu-danger logout-btn" href="#"><i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</a>` :
                `<a class="session-menu-item" href="${_ruta('perfil_viajero.html')}"><i class="fa-solid fa-user"></i> Mi Perfil</a>
               <a class="session-menu-item" href="${_ruta('reservas_viajero.html')}"><i class="fa-solid fa-calendar-check"></i> Mis Reservas</a>
               <a class="session-menu-item" href="${_ruta('config_viajero.html')}"><i class="fa-solid fa-gear"></i> Configuración</a>
               <a class="session-menu-item session-menu-danger logout-btn" href="#"><i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión</a>`;

            // HTML del widget de sesión: avatar + nombre + tipo + dropdown
            // Avatar: iniciales del nombre (empresa o viajero), no del campo avatar guardado
            const _avatarDisplay = (user.nombre || user.avatar || "?")
                .trim().split(/\s+/).map(w => w[0] || "").join("").toUpperCase().slice(0, 2) || "??";
            const widgetHTML = `
        <div class="session-widget">
          <button class="session-trigger">
            <div class="session-avatar">${_avatarDisplay}</div>
            <div class="session-info">
              <span class="session-name">${user.nombre}</span>
              <span class="session-tipo">${user.tipo === "admin" ? "Administrador" : user.tipo === "empresa" ? "Empresa" : "Viajero"}</span>
            </div>
            <i class="fa-solid fa-chevron-down session-chevron"></i>
          </button>
          <div class="session-dropdown">${menuItems}</div>
        </div>`;

            // ── Monta el widget en un contenedor ──
            function mountWidget(container, before) {
                const temp = document.createElement("div");
                temp.innerHTML = widgetHTML;
                const widget = temp.firstElementChild;
                if (before) container.insertBefore(widget, before);
                else container.appendChild(widget);

                // Abre/cierra el dropdown al hacer clic en el trigger
                widget
                    .querySelector(".session-trigger")
                    .addEventListener("click", (e) => {
                        e.stopPropagation();
                        const dd = widget.querySelector(".session-dropdown");
                        const ch = widget.querySelector(".session-chevron");
                        const open = dd.classList.toggle("open");
                        ch.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
                    });

                // Todos los botones de logout cierran sesión y recargan la página
                widget.querySelectorAll(".logout-btn, #btnLogout").forEach((btn) => {
                    btn.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearSession();
                        window.location.href = _raiz();
                    });
                });
            }

            // Insertamos el widget antes del CONTENEDOR de modo oscuro en la navbar
            // (no del botón interno #darkModeToggle: ese vive anidado dentro de
            // #dark-mode-toggle, así que usar su parentElement metía el widget
            // dentro del contenedor chiquito en vez de en .nav-container. Mismo
            // criterio que ya usa carrito.js para insertar el botón del carrito.)
            const darkMount = document.getElementById("dark-mode-toggle");
            if (darkMount) mountWidget(darkMount.parentElement, darkMount);

            // Al hacer clic en cualquier parte de la página: cerrar todos los dropdowns
            document.addEventListener("click", () => {
                document
                    .querySelectorAll(".session-dropdown")
                    .forEach((dd) => dd.classList.remove("open"));
                document
                    .querySelectorAll(".session-chevron")
                    .forEach((ch) => (ch.style.transform = "rotate(0deg)"));
            });
        }
    }

    // ── Muestra una notificación de bienvenida cuando el usuario inicia sesión ──
    function showWelcomeToast(user) {
        let toast = document.getElementById("welcomeToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "welcomeToast";
            toast.className = "welcome-toast";
            document.body.appendChild(toast);
        }
        const _toastIconos = { TRANSPORTE: "🚌", PLANES: "🗺️", HOSPEDAJE: "🏨", PERSONAL_AUXILIAR: "🦯" };
        const _toastNorm = { transporte: "TRANSPORTE", planes: "PLANES", hospedaje: "HOSPEDAJE", auxiliar: "PERSONAL_AUXILIAR", personal_auxiliar: "PERSONAL_AUXILIAR" };
        let _toastSrv = "TRANSPORTE";
        if (user.tipo === "empresa") {
            _toastSrv = _toastNorm[(user.tipoServicio || "").toLowerCase()] || "TRANSPORTE";
        }
        const emoji =
            user.tipo === "admin" ? "🛡️" : user.tipo === "empresa" ? (_toastIconos[_toastSrv] || "🏢") : "👋";
        toast.innerHTML = `<div class="welcome-toast-icon">${emoji}</div>
      <div class="welcome-toast-text">
        <strong>¡Bienvenido, ${user.nombre}!</strong>
        <span>Has iniciado sesión como ${user.tipo === "admin" ? "administrador" : user.tipo}.</span>
      </div>`;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 4000); // Desaparece tras 4 segundos
    }

    // Aplicar la sesión actual al cargar la página
    // (no aplicar en login.html: login-page.js redirige si hay sesión activa)
    var _isLoginPage = window.location.pathname.indexOf("login") !== -1;
    if (!_isLoginPage) applySession();

    /* ============================================================
       UTILIDADES DE VALIDACIÓN UI
    ============================================================ */
    // Muestra un mensaje de ✓ o ✗ debajo de un campo
    function setMsg(el, text, type) {
        if (!el) return;
        el.textContent = text ? (type === "ok" ? "\u2713 " : "\u2717 ") + text : ""; // ✓ o ✗
        el.className = "field-msg " + (type && text ? type : "");
    }
    // Marca un campo como válido (borde verde) o inválido (borde rojo)
    function setValid(input, ok) {
        if (!input) return;
        input.classList.toggle("valid", ok);
        input.classList.toggle("invalid", !ok && input.value.length > 0);
    }

    /* ============================================================
       ABRIR / CERRAR EL MODAL
    ============================================================ */
    const overlay = $("authOverlay");

    function openAuth(tab) {
        if (getSession()) return; // Si ya está logueado, no abrimos el modal
        overlay.classList.add("active");
        document.body.style.overflow = "hidden"; // Bloqueamos el scroll del fondo
        switchTab(tab || "login");
    }

    function closeAuth() {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    // Cerrar al hacer clic en el fondo oscuro
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeAuth();
    });
    // Cerrar con el botón X
    $("authClose").addEventListener("click", closeAuth);
    // Cerrar con la tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAuth();
    });

    // Todos los botones "Acceder" / "Iniciar Sesión" del sitio abren el modal
    // Si el elemento es un <a> (link), lo dejamos navegar sin interceptar
    document.querySelectorAll(".btn-acceder").forEach((btn) => {
        if (btn.tagName === "A") return;
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            openAuth("login");
        });
    });
    const btnMobile = document.getElementById("btnAccederMobile");
    if (btnMobile && btnMobile.tagName !== "A")
        btnMobile.addEventListener("click", (e) => {
            e.preventDefault();
            openAuth("login");
        });

    /* ============================================================
       TABS: cambiar entre Login y Registro
    ============================================================ */
    function switchTab(tab) {
        const isLogin = tab === "login";
        $("tabLogin").classList.toggle("active", isLogin);
        $("tabRegister").classList.toggle("active", !isLogin);
        $("formLogin").classList.toggle("active", isLogin);
        $("formRegister").classList.toggle("active", !isLogin);
        $("authSuccess").classList.remove("show");
        if (!isLogin) showStep("regStep0"); // Al abrir registro, empezamos en el paso 0
    }
    $("tabLogin").addEventListener("click", () => switchTab("login"));
    $("tabRegister").addEventListener("click", () => switchTab("register"));
    $("goRegister").addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("register");
    });
    $("goLogin").addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("login");
    });

    /* ============================================================
       TOGGLE PARA MOSTRAR/OCULTAR CONTRASEÑA
    ============================================================ */
    document.querySelectorAll(".toggle-pass").forEach((btn) =>
        btn.addEventListener("click", () => {
            const inp = $(btn.dataset.target);
            if (!inp) return;
            const isPass = inp.type === "password";
            inp.type = isPass ? "text" : "password"; // Alternamos el tipo
            btn.querySelector("i").className = isPass ?
                "fa-solid fa-eye-slash" :
                "fa-solid fa-eye";
        }),
    );

    /* ============================================================
       TIPO DE LOGIN (viajero / admin / empresa)
    ============================================================ */
    let loginType = "viajero"; // Por defecto es viajero
    document.querySelectorAll("[data-login-type]").forEach((btn) =>
        btn.addEventListener("click", () => {
            document
                .querySelectorAll("[data-login-type]")
                .forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            loginType = btn.dataset.loginType;
        }),
    );

    /* ============================================================
       TIPO DE REGISTRO (viajero / empresa)
    ============================================================ */
    let selectedType = "viajero";
    document
        .querySelectorAll(".user-type-btn:not([data-login-type])")
        .forEach((btn) =>
            btn.addEventListener("click", () => {
                document
                    .querySelectorAll(".user-type-btn:not([data-login-type])")
                    .forEach((b) => b.classList.remove("selected"));
                btn.classList.add("selected");
                selectedType = btn.dataset.type;
            }),
        );

    // Tipo de servicio que ofrece la empresa (transporte, hospedaje, etc.)
    let selectedService = null;
    document.querySelectorAll(".service-type-btn").forEach((btn) =>
        btn.addEventListener("click", () => {
            document
                .querySelectorAll(".service-type-btn")
                .forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedService = btn.dataset.service;
            setMsg($("eServiceMsg"), "", "");
        }),
    );

    // Si elige "Otra" en accesibilidad, mostramos el campo de texto libre
    $("vDisc").addEventListener("change", () => {
        const show = $("vDisc").value === "otra";
        $("vDiscOtraGroup").style.display = show ? "block" : "none";
        if (!show) $("vDiscOtra").value = "";
        else $("vDiscOtra").focus();
    });

    /* ============================================================
       NAVEGACIÓN ENTRE PASOS DEL REGISTRO
    ============================================================ */
    const allSteps = ["regStep0", "vStep1", "vStep2", "eStep1", "eStep2"];

    // Muestra un paso y oculta todos los demás
    function showStep(id) {
        allSteps.forEach((s) => {
            const el = $(s);
            if (el) el.style.display = "none";
        });
        const target = $(id);
        if (target) {
            target.style.display = "flex";
            target.style.flexDirection = "column";
            target.style.gap = "14px";
        }
        // Actualizamos los puntos indicadores de progreso
        const map = { regStep0: 0, vStep1: 1, vStep2: 2, eStep1: 1, eStep2: 2 };
        const active = map[id] !== undefined ? map[id] : 0;
        document
            .querySelectorAll(".reg-step-dot")
            .forEach((d, i) => d.classList.toggle("active", i <= active));
    }

    // Botón "Continuar" del paso 0: va a viajero paso 1 o empresa paso 1
    $("btnStep0Next").addEventListener("click", () =>
        showStep(selectedType === "viajero" ? "vStep1" : "eStep1"),
    );
    $("vStep1Back").addEventListener("click", () => showStep("regStep0"));

    // Botón siguiente del paso 1 de viajero: valida todos los campos antes de avanzar
    $("vStep1Next").addEventListener("click", () => {
        const ok0 = $("vTipoDoc").value !== "";
        if (!ok0) setMsg($("vTipoDocMsg"), "Selecciona el tipo de documento", "error");
        else setMsg($("vTipoDocMsg"), "", "");
        const ok1 = validateRequired($("vNombre"), $("vNombreMsg"), "Nombre");
        const ok2 = validateRequired($("vApellido"), $("vApellidoMsg"), "Apellido");
        const ok3 = validateEmail($("vEmail"), $("vEmailMsg"));
        const ok4 = validateCedula($("vCedula"), $("vCedulaMsg"));
        const ok5 = validateTel($("vTel"), $("vTelMsg"), $("vTelCod").value);
        if (ok0 && ok1 && ok2 && ok3 && ok4 && ok5) showStep("vStep2"); // Solo avanza si todo es válido
    });

    $("vStep2Back").addEventListener("click", () => showStep("vStep1"));
    $("eStep1Back").addEventListener("click", () => showStep("regStep0"));

    // Botón siguiente del paso 1 de empresa
    $("eStep1Next").addEventListener("click", () => {
        const ok1 = validateRequired(
            $("eNombre"),
            $("eNombreMsg"),
            "Nombre de empresa",
        );
        const ok2 = validateNit($("eNit"), $("eNitMsg"));
        const ok3 = selectedService !== null;
        const ok4 = $("eUbicacion").value !== "";
        if (!ok3)
            setMsg($("eServiceMsg"), "Selecciona el tipo de servicio", "error");
        if (!ok4) setMsg($("eUbicacionMsg"), "Selecciona una ciudad", "error");
        else setMsg($("eUbicacionMsg"), "", "");
        if (ok1 && ok2 && ok3 && ok4) showStep("eStep2");
    });

    $("eStep2Back").addEventListener("click", () => showStep("eStep1"));

    /* ============================================================
       VALIDACIONES DE CAMPOS
       Expresiones regulares para cada tipo de dato
    ============================================================ */
    const RE_EMAIL = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const RE_TEL_CO = /^3[0-9]{9}$/; // Teléfono colombiano: empieza en 3, 10 dígitos
    const RE_TEL_INT = /^[0-9]{7,15}$/; // Internacional: 7-15 dígitos
    const RE_NIT = /^[0-9]{6,15}-?[0-9]?$/; // NIT colombiano con dígito de verificación
    // Contraseña: 8-10 chars, al menos una mayúscula, minúscula, número y + o -
    const RE_PASS =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[+\-])[A-Za-z\d+\-]{8,30}$/;
    const RE_PASS_CHARS = /^[A-Za-z\d+\-]$/; // Caracteres permitidos en contraseña

    function validateEmail(inp, msg) {
        if (!inp) return false;
        const v = inp.value.trim();
        const ok = RE_EMAIL.test(v);
        setValid(inp, ok);
        setMsg(
            msg,
            ok ?
            "Correo válido" :
            v ?
            "Correo inválido. Ej: usuario@correo.com" :
            "Correo requerido",
            ok ? "ok" : "error",
        );
        return ok;
    }

    function validateTel(inp, msg, cod) {
        if (!inp) return false;
        const v = inp.value.replace(/\s/g, "").trim();
        let ok, errorMsg;
        if (cod === "+57") {
            ok = RE_TEL_CO.test(v);
            errorMsg = v ?
                v.length !== 10 ?
                "Debe tener exactamente 10 dígitos" :
                "Debe iniciar en 3" :
                "Teléfono requerido";
        } else if (cod === "+58") {
            ok = /^[0-9]{10,11}$/.test(v);
            errorMsg = v ? "Debe tener 10 u 11 dígitos" : "Teléfono requerido";
        } else {
            ok = RE_TEL_INT.test(v);
            errorMsg = v ? "Solo dígitos, 7-15 caracteres" : "Teléfono requerido";
        }
        setValid(inp, ok);
        setMsg(msg, ok ? "Número válido" : errorMsg, ok ? "ok" : "error");
        return ok;
    }

    function validateRequired(inp, msg, label) {
        if (!inp) return false;
        const ok = inp.value.trim().length >= 2; // Mínimo 2 caracteres
        setValid(inp, ok);
        setMsg(
            msg,
            ok ? "" : inp.value ? label + " muy corto" : label + " requerido",
            "error",
        );
        return ok;
    }

    function validateCedula(inp, msg) {
        if (!inp) return false;
        const tipoDoc = document.getElementById("vTipoDoc");
        const tipo = tipoDoc ? tipoDoc.value : "1";
        const v = inp.value.trim();

        let ok = false;
        let errorMsg = "";

        if (tipo === "1") {
            // Cédula de Ciudadanía: solo dígitos, 7 a 10
            const soloDigitos = /^\d{7,10}$/.test(v);
            ok = soloDigitos;
            errorMsg = ok ? "Cédula válida" : v ?
                /\D/.test(v) ? "Solo se permiten números" :
                v.length < 7 ? "Mínimo 7 dígitos" : "Máximo 10 dígitos" :
                "Número de documento requerido";
        } else if (tipo === "2") {
            // Cédula de Extranjería: letras y números, 3 a 10 caracteres
            const valido = /^[A-Za-z0-9]{3,10}$/.test(v);
            ok = valido;
            errorMsg = ok ? "Documento válido" : v ?
                v.length < 3 ? "Mínimo 3 caracteres" : "Máximo 10 caracteres" :
                "Número de documento requerido";
        } else {
            // No ha seleccionado tipo aún
            ok = false;
            errorMsg = "Selecciona primero el tipo de documento";
        }

        setValid(inp, ok);
        setMsg(msg, errorMsg, ok ? "ok" : "error");
        return ok;
    }

    function validateNit(inp, msg) {
        if (!inp) return false;
        const ok = RE_NIT.test(inp.value.replace(/\./g, "").trim());
        setValid(inp, ok);
        setMsg(
            msg,
            ok ?
            "NIT válido" :
            inp.value ?
            "Formato inválido. Ej: 900123456-7" :
            "NIT requerido",
            ok ? "ok" : "error",
        );
        return ok;
    }

    // Validación detallada de contraseña con mensajes de error específicos
    function validatePass(inp, msg) {
        if (!inp) return false;
        const v = inp.value;
        const ok = RE_PASS.test(v);
        setValid(inp, ok);
        if (!v) setMsg(msg, "Contraseña requerida", "error");
        else if (v.length < 8) setMsg(msg, "Mínimo 8 caracteres", "error");
        else if (v.length > 30) setMsg(msg, "Máximo 30 caracteres", "error");
        else if (!/[A-Z]/.test(v))
            setMsg(msg, "Necesita al menos una mayúscula", "error");
        else if (!/[a-z]/.test(v))
            setMsg(msg, "Necesita al menos una minúscula", "error");
        else if (!/[0-9]/.test(v))
            setMsg(msg, "Necesita al menos un número", "error");
        else if (/[^A-Za-z0-9+\-]/.test(v))
            setMsg(msg, "Solo se permiten letras, números, + y -", "error");
        else if (!/[+\-]/.test(v))
            setMsg(msg, "Necesita al menos un carácter especial (+ ó -)", "error");
        else setMsg(msg, "Contraseña segura", "ok");
        return ok;
    }

    // Verifica que dos contraseñas coincidan
    function validateMatch(inp, ref, msg) {
        if (!inp || !ref) return false;
        const ok = inp.value.length > 0 && inp.value === ref.value;
        setValid(inp, ok);
        setMsg(
            msg,
            ok ?
            "Las contraseñas coinciden" :
            inp.value ?
            "No coinciden" :
            "Confirma tu contraseña",
            ok ? "ok" : "error",
        );
        return ok;
    }

    /* ── Indicador de fortaleza de contraseña ── */
    // Calcula la fortaleza según cuántos criterios cumple (largo, mayúscula, minúscula, número, especial)
    function getStrength(v) {
        let s = 0;
        if (v.length >= 8) s++;
        if (/[A-Z]/.test(v)) s++;
        if (/[a-z]/.test(v)) s++;
        if (/[0-9]/.test(v)) s++;
        if (/[+\-]/.test(v)) s++;
        if (s <= 2) return { level: "weak", label: "Débil", bars: 1 };
        if (s === 3) return { level: "medium", label: "Media", bars: 2 };
        if (s === 4) return { level: "strong", label: "Fuerte", bars: 3 };
        return { level: "strong", label: "¡Muy fuerte!", bars: 4 };
    }

    // Actualiza las barras de colores del indicador de fortaleza
    function updateStrength(passId, barPrefix, labelId) {
        const v = $(passId) ? $(passId).value : "";
        const lbl = $(labelId);
        const bars = [1, 2, 3, 4].map((n) => $(barPrefix + n));
        if (!v) {
            bars.forEach((b) => {
                if (b) b.className = "pass-strength-bar";
            });
            if (lbl) {
                lbl.textContent = "";
                lbl.className = "pass-strength-label";
            }
            return;
        }
        const s = getStrength(v);
        bars.forEach((b, i) => {
            if (b)
                b.className = "pass-strength-bar" + (i < s.bars ? " " + s.level : "");
        });
        if (lbl) {
            lbl.textContent = s.label;
            lbl.className = "pass-strength-label " + s.level;
        }
    }

    /* ── Validaciones en tiempo real mientras el usuario escribe ── */
    const on = (id, fn) => {
        const el = $(id);
        if (el) el.addEventListener("input", fn);
    };

    on("loginEmail", () => validateEmail($("loginEmail"), $("loginEmailMsg")));
    on("loginPass", () => {
        const ok = $("loginPass").value.length >= 6;
        setValid($("loginPass"), ok);
        setMsg(
            $("loginPassMsg"), !ok && $("loginPass").value ? "Contraseña muy corta" : "",
            ok ? "ok" : "error",
        );
    });
    on("vNombre", () =>
        validateRequired($("vNombre"), $("vNombreMsg"), "Nombre"),
    );
    on("vApellido", () =>
        validateRequired($("vApellido"), $("vApellidoMsg"), "Apellido"),
    );
    on("vEmail", () => validateEmail($("vEmail"), $("vEmailMsg")));
    on("vCedula", () => validateCedula($("vCedula"), $("vCedulaMsg")));
    // Revalidar número al cambiar tipo de documento
    const _vTipoDocEl = document.getElementById("vTipoDoc");
    if (_vTipoDocEl) {
        _vTipoDocEl.addEventListener("change", () => {
            const cedEl = $("vCedula");
            if (cedEl && cedEl.value.trim()) {
                validateCedula(cedEl, $("vCedulaMsg"));
            }
            // Actualizar placeholder según tipo
            if (cedEl) {
                cedEl.placeholder = _vTipoDocEl.value === "2" ?
                    "Ej: E123456789" :
                    "Número de cédula";
            }
        });
    }
    on("vTel", () => validateTel($("vTel"), $("vTelMsg"), $("vTelCod").value));
    on("vPass", () => {
        validatePass($("vPass"), $("vPassMsg"));
        updateStrength("vPass", "vPsBar", "vPassLabel");
    });
    on("vPassConf", () =>
        validateMatch($("vPassConf"), $("vPass"), $("vPassConfMsg")),
    );
    on("eNombre", () =>
        validateRequired($("eNombre"), $("eNombreMsg"), "Nombre"),
    );
    on("eNit", () => validateNit($("eNit"), $("eNitMsg")));
    on("eRepNombre", () =>
        validateRequired($("eRepNombre"), $("eRepNombreMsg"), "Nombre"),
    );
    on("eRepApellido", () =>
        validateRequired($("eRepApellido"), $("eRepApellidoMsg"), "Apellido"),
    );
    on("eEmail", () => validateEmail($("eEmail"), $("eEmailMsg")));
    on("eTel", () => validateTel($("eTel"), $("eTelMsg"), $("eTelCod").value));
    on("ePass", () => {
        validatePass($("ePass"), $("ePassMsg"));
        updateStrength("ePass", "ePsBar", "ePassLabel");
    });
    on("ePassConf", () =>
        validateMatch($("ePassConf"), $("ePass"), $("ePassConfMsg")),
    );

    /* ── Bloqueo de caracteres inválidos en campos de contraseña ──
       Solo permite: letras, números, + y - */
    [
        $("loginPass"),
        $("vPass"),
        $("vPassConf"),
        $("ePass"),
        $("ePassConf"),
    ].forEach((inp) => {
        if (!inp) return;
        // Bloquear teclas inválidas al escribir
        inp.addEventListener("keypress", (e) => {
            if (!RE_PASS_CHARS.test(e.key)) e.preventDefault();
        });
        // Limpiar caracteres inválidos al pegar (Ctrl+V)
        inp.addEventListener("paste", (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData("text");
            const cleaned = pasted.replace(/[^A-Za-z\d+\-]/g, ""); // Solo dejamos los válidos
            const start = inp.selectionStart,
                end = inp.selectionEnd;
            inp.value = inp.value.slice(0, start) + cleaned + inp.value.slice(end);
            inp.dispatchEvent(new Event("input")); // Disparamos input para re-validar
        });
    });

    /* ── Solo dígitos en campos de teléfono ── */
    [$("vTel"), $("eTel")].forEach((inp) => {
        if (!inp) return;
        inp.addEventListener("keypress", (e) => {
            if (!/[0-9]/.test(e.key)) e.preventDefault();
        });
        inp.addEventListener("paste", (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData)
                .getData("text")
                .replace(/[^0-9]/g, "");
            inp.value = text.slice(0, 10);
            inp.dispatchEvent(new Event("input"));
        });
    });

    // Al cambiar el código de país: re-validar el teléfono con las reglas nuevas
    [$("vTelCod"), $("eTelCod")].forEach((sel) => {
        if (!sel) return;
        sel.addEventListener("change", () => {
            const telId = sel.id === "vTelCod" ? "vTel" : "eTel";
            const msgId = sel.id === "vTelCod" ? "vTelMsg" : "eTelMsg";
            const telInp = $(telId);
            if (telInp && telInp.value) validateTel(telInp, $(msgId), sel.value);
            if (telInp) telInp.maxLength = sel.value === "+57" ? 10 : 15; // Ajusta el límite de caracteres
        });
    });

    /* ============================================================
       SUBMIT DEL FORMULARIO DE LOGIN
    ============================================================ */
    $("formLogin").addEventListener("submit", (e) => {
        e.preventDefault();

        // Primero validamos el email
        const okE = validateEmail($("loginEmail"), $("loginEmailMsg"));
        if (!okE) return;

        const passVal = $("loginPass").value;
        // Validamos la contraseña con mensajes de error específicos
        if (!RE_PASS.test(passVal)) {
            if (!passVal) setMsg($("loginPassMsg"), "Ingresa tu contraseña", "error");
            else if (passVal.length < 8)
                setMsg($("loginPassMsg"), "Mínimo 8 caracteres", "error");
            else if (!/[A-Z]/.test(passVal))
                setMsg($("loginPassMsg"), "Necesita al menos una mayúscula", "error");
            else if (!/[a-z]/.test(passVal))
                setMsg($("loginPassMsg"), "Necesita al menos una minúscula", "error");
            else if (!/[0-9]/.test(passVal))
                setMsg($("loginPassMsg"), "Necesita al menos un número", "error");
            else if (/[^A-Za-z0-9+\-]/.test(passVal))
                setMsg(
                    $("loginPassMsg"),
                    "Solo se permiten letras, números, + y -",
                    "error",
                );
            else
                setMsg(
                    $("loginPassMsg"),
                    "Necesita al menos un carácter especial (+ ó -)",
                    "error",
                );
            setValid($("loginPass"), false);
            return;
        }

        // Mostramos el spinner del botón
        const btn = $("btnLogin");
        btn.classList.add("loading");
        btn.disabled = true;

        const emailVal = $("loginEmail").value.trim().toLowerCase();

        // ── Fetch a registro/login.php ──
        fetch("../login/login.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailVal, password: passVal, tipo: loginType })
            })
            .then(r => r.json())
            .then(data => {
                btn.classList.remove("loading");
                btn.disabled = false;

                if (!data.ok) {
                    setMsg($("loginEmailMsg"), data.error || "Credenciales incorrectas.", "error");
                    setValid($("loginEmail"), false);
                    setValid($("loginPass"), false);
                    // El login falló: aunque el CAPTCHA ya estuviera resuelto, obligamos a
                    // resolverlo de nuevo antes de permitir otro intento.
                    if (window.TeCaptcha) window.TeCaptcha.invalidateOnFailedLogin();
                    return;
                }

                const matchedUser = data.session;
                saveSession(matchedUser);

                if (matchedUser.tipo === "admin") {
                    showWelcomeToast(matchedUser);
                    setTimeout(() => {
                        window._loginSuccess = true;
                        window.location.href = _ruta("panel_admin.html");
                    }, 1400);
                } else if (matchedUser.tipo === "empresa") {
                    showWelcomeToast(matchedUser);
                    setTimeout(() => {
                        window._loginSuccess = true;
                        const _s = (matchedUser.tipoServicio || "").toLowerCase();
                        const _pm = { transporte: "panel_transporte.html", hospedaje: "panel_hospedaje.html", planes: "panel_planes.html", personal_auxiliar: "panel_auxiliar.html" };
                        window.location.href = _ruta(_pm[_s] || "panel_transporte.html");
                    }, 1400);
                } else {
                    applySession();
                    showWelcomeToast(matchedUser);
                    setTimeout(() => {
                        window._loginSuccess = true;
                        window.location.href = _raiz();
                    }, 1400);
                }
            })
            .catch(() => {
                btn.classList.remove("loading");
                btn.disabled = false;
                setMsg($("loginEmailMsg"), "No se pudo conectar con el servidor. Intenta de nuevo.", "error");
            });
    });

    /* ============================================================
       SUBMIT DEL FORMULARIO DE REGISTRO
    ============================================================ */
    $("formRegister").addEventListener("submit", (e) => {
        e.preventDefault();

        if (selectedType === "viajero") {
            // ── Registro de viajero ──
            const okP = validatePass($("vPass"), $("vPassMsg"));
            const okPC = validateMatch($("vPassConf"), $("vPass"), $("vPassConfMsg"));
            const terms = $("vTerms").checked;
            if (!terms) setMsg($("vTermsMsg"), "Debes aceptar los términos", "error");
            if (!okP || !okPC || !terms) return;

            const btn = $("btnRegViajero");
            btn.classList.add("loading");
            btn.disabled = true;

            const nombre = $("vNombre").value.trim();
            const apellido = $("vApellido").value.trim();
            const email = $("vEmail").value.trim();
            const pass = $("vPass").value;
            const cedula = $("vCedula").value.trim();
            const tipoDoc = parseInt($("vTipoDoc").value) || 1;
            const celular = $("vTel") ? $("vTel").value.trim() : "";

            fetch("../login/registro_viajero.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        documento: cedula,
                        tipo_doc: tipoDoc,
                        nombre: nombre,
                        apellido: apellido,
                        celular: celular,
                        email: email,
                        password: pass,
                        accesibilidad: "NINGUNA",
                    })
                })
                .then(r => r.json())
                .then(data => {
                    btn.classList.remove("loading");
                    btn.disabled = false;

                    if (!data.ok) {
                        setMsg($("vPassMsg"), data.error || "Error al registrar. Intenta de nuevo.", "error");
                        return;
                    }

                    $("formRegister").classList.remove("active");
                    $("authSuccess").classList.add("show");
                    $("successTitle").textContent = "¡Registro exitoso!";
                    $("successMsg").textContent = "Tu cuenta de viajero ha sido creada. Ya puedes iniciar sesión con tus credenciales.";
                    $("btnSuccessClose").textContent = "Iniciar sesión";
                    $("btnSuccessClose").onclick = () => {
                        $("authSuccess").classList.remove("show");
                        switchTab("login");
                        $("loginEmail").value = email;
                        document.querySelectorAll("[data-login-type]").forEach(b => b.classList.remove("selected"));
                        const bv = document.querySelector('[data-login-type="viajero"]');
                        if (bv) bv.classList.add("selected");
                        loginType = "viajero";
                    };
                })
                .catch(() => {
                    btn.classList.remove("loading");
                    btn.disabled = false;
                    setMsg($("vPassMsg"), "No se pudo conectar con el servidor.", "error");
                });
        } else {
            // ── Registro de empresa ──
            const okE = validateEmail($("eEmail"), $("eEmailMsg"));
            const okT = validateTel($("eTel"), $("eTelMsg"), $("eTelCod").value);
            const okP = validatePass($("ePass"), $("ePassMsg"));
            const okPC = validateMatch($("ePassConf"), $("ePass"), $("ePassConfMsg"));
            const terms = $("eTerms").checked;
            if (!terms) setMsg($("eTermsMsg"), "Debes aceptar los términos", "error");
            if (!okE || !okT || !okP || !okPC || !terms) return; // Si alguna validación falla, no avanzamos

            const btn = $("btnRegEmpresa");
            btn.classList.add("loading");
            btn.disabled = true;

            const eNombre = $("eNombre").value.trim();
            const eEmail = $("eEmail").value.trim();
            const ePass = $("ePass").value;
            const eNit = $("eNit").value.trim();
            const eUbic = $("eUbicacion").value;
            const eTel = $("eTel") ? $("eTel").value.trim() : "";

            fetch("../login/registro_empresa.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nit: eNit,
                        nombre: eNombre,
                        email_inst: eEmail,
                        contacto: eTel,
                        id_ciudad: eUbic,
                        tipo_servicio: selectedService,
                        email_login: eEmail,
                        password: ePass,
                    })
                })
                .then(r => r.json())
                .then(data => {
                    btn.classList.remove("loading");
                    btn.disabled = false;

                    if (!data.ok) {
                        const err = data.error || "Error al registrar. Intenta de nuevo.";
                        if (err.includes("NIT")) setMsg($("eNitMsg"), err, "error");
                        else if (err.includes("correo") || err.includes("Correo")) setMsg($("eEmailMsg"), err, "error");
                        else if (err.includes("contraseña") || err.includes("Contraseña")) setMsg($("ePassMsg"), err, "error");
                        else if (err.includes("Ciudad") || err.includes("ciudad")) setMsg($("eUbicacionMsg"), err, "error");
                        else if (err.includes("servicio")) setMsg($("eServiceMsg"), err, "error");
                        else setMsg($("ePassMsg"), err, "error");
                        return;
                    }

                    $("formRegister").classList.remove("active");
                    $("authSuccess").classList.add("show");
                    $("successIcon").style.background = "linear-gradient(135deg,#f59e0b,#eab308)";
                    $("successIcon").innerHTML = "<i class='fa-solid fa-clock'></i>";
                    $("successTitle").textContent = "¡Solicitud enviada!";
                    $("successMsg").textContent =
                        "Tu empresa ha sido registrada. Nuestro equipo revisará tu información en 24-48 horas y te contactará al correo " + eEmail + ".";
                    $("btnSuccessClose").textContent = "Entendido";
                    $("btnSuccessClose").onclick = () => {
                        window._loginSuccess = true;
                        window.location.href = _raiz();
                    };
                })
                .catch(() => {
                    btn.classList.remove("loading");
                    btn.disabled = false;
                    setMsg($("ePassMsg"), "No se pudo conectar con el servidor.", "error");
                });
        }
    });

    /* ============================================================
       FUNCIONALIDAD "OLVIDÉ MI CONTRASEÑA"
    ============================================================ */
    $("forgotLink").addEventListener("click", (e) => {
        e.preventDefault();
        const email = $("loginEmail").value.trim();
        if (!email || !RE_EMAIL.test(email)) {
            // Si el email no está ingresado o es inválido, lo pedimos primero
            setMsg($("loginEmailMsg"), "Ingresa tu correo primero", "error");
            $("loginEmail").focus();
            return;
        }
        window.location.href = _ruta("restablecer_contrasena.html") + "?email=" + encodeURIComponent(email);
    });

    $("btnSuccessClose").addEventListener("click", closeAuth);

    // Aseguramos que todos los pasos intermedios estén ocultos al cargar
    ["vStep1", "vStep2", "eStep1", "eStep2"].forEach((id) => {
        const el = $(id);
        if (el) el.style.display = "none";
    });

    // ── API pública del módulo de autenticación ──
    // Otros scripts pueden llamar window.TourismAuth.open() para abrir el modal de login
    window.TourismAuth = { open: openAuth, close: closeAuth };
})();