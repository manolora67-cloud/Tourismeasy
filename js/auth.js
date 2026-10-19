(function() {
    "use strict";

    const inHtml = window.location.pathname.includes("/html/");
    const apiBase = inHtml ? "../" : "";
    const pageBase = inHtml ? "" : "html/";
    const loginPage = document.getElementById("loginPageCard");

    const modal = `
<div class="auth-overlay" id="authOverlay" role="dialog" aria-modal="true" aria-labelledby="authDialogTitle">
  <div class="auth-box" id="authBox">
    <div class="auth-header">
      <button class="auth-close" id="authClose" aria-label="Cerrar">&times;</button>
      <div class="auth-logo">
        <img src="${inHtml ? "../" : ""}img/TURISMEASY.png" alt="TourismEasy" class="auth-logo-img">
        <span class="auth-logo-text">TOURISMEASY</span>
      </div>
      <p id="authDialogTitle">Acceso para empresas y administración</p>
    </div>
    <div class="auth-tabs">
      <button class="auth-tab active" id="tabLogin" type="button">Iniciar sesión</button>
      <button class="auth-tab" id="tabRegister" type="button">Registro de empresa</button>
    </div>
    <div class="auth-body">
      <form class="auth-form active" id="formLogin" novalidate>
        <div class="field-group">
          <label for="loginType">Tipo de cuenta</label>
          <select id="loginType">
            <option value="empresa">Empresa</option>
            <option value="admin">Administración</option>
          </select>
        </div>
        <div class="field-group">
          <label for="loginEmail">Correo electrónico</label>
          <div class="field-wrap"><i class="fa-solid fa-envelope field-icon"></i><input type="email" id="loginEmail" autocomplete="username" required></div>
          <span class="field-msg" id="loginEmailMsg"></span>
        </div>
        <div class="field-group">
          <label for="loginPass">Contraseña</label>
                    <div class="field-wrap has-toggle"><i class="fa-solid fa-lock field-icon"></i><input type="password" id="loginPass" autocomplete="current-password" required><button type="button" class="toggle-pass" data-target="loginPass" aria-label="Mostrar contraseña"><i class="fa-solid fa-eye"></i></button></div>
          <span class="field-msg" id="loginPassMsg"></span>
        </div>
        <div class="forgot-link"><a href="${pageBase}restablecer_contrasena.html" id="forgotLink">¿Olvidaste tu contraseña?</a></div>
        <button type="submit" class="btn-auth" id="btnLogin"><span class="btn-text">Iniciar sesión</span><div class="btn-spinner"></div></button>
        <p class="field-msg" id="loginStatus" role="status"></p>
        <button type="button" class="btn-auth" id="btnReplaceSession" style="display:none">Cerrar la otra sesión e iniciar aquí</button>
      </form>
      <form class="auth-form" id="formRegister" novalidate>
                <div class="register-intro">
                    <span class="register-mark" aria-hidden="true"><i class="fa-solid fa-store"></i></span>
                    <div class="register-copy">
                        <span class="register-eyebrow">Portal para empresas</span>
                        <h2>Solicita acceso a TourismEasy</h2>
                        <p>Completa los datos de tu empresa. El acceso al panel se habilita después de la revisión.</p>
                    </div>
                </div>
                <ol class="register-flow" aria-label="Etapas de la solicitud">
                    <li><span class="register-step-number">01</span><span>Envías los datos</span></li>
                    <li><span class="register-step-number">02</span><span>Revisamos la solicitud</span></li>
                    <li><span class="register-step-number">03</span><span>Accedes al panel</span></li>
                </ol>
                <div class="register-field-grid">
                <div class="field-group register-field-wide">
          <label for="eNombre">Nombre de la empresa</label>
          <input type="text" id="eNombre" maxlength="50" required>
          <span class="field-msg" id="eNombreMsg"></span>
        </div>
        <div class="field-group">
          <label for="eNit">NIT (10 dígitos)</label>
          <input type="text" id="eNit" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" required>
          <span class="field-msg" id="eNitMsg"></span>
        </div>
        <div class="field-group">
          <label for="eService">Servicio</label>
          <select id="eService" required>
            <option value="">Selecciona un servicio</option>
            <option value="PLANES">Planes turísticos</option>
            <option value="HOSPEDAJE">Hospedaje</option>
            <option value="TRANSPORTE">Transporte</option>
          </select>
        </div>
        <div class="field-group">
          <label for="eUbicacion">Ciudad / municipio</label>
          <select id="eUbicacion" required><option value="">Cargando municipios…</option></select>
          <span class="field-msg" id="eUbicacionMsg"></span>
        </div>
        <div class="field-group">
          <label for="eEmail">Correo institucional</label>
          <input type="email" id="eEmail" autocomplete="email" required>
          <span class="field-msg" id="eEmailMsg"></span>
        </div>
        <div class="field-group">
          <label for="eTel">Teléfono de contacto</label>
          <input type="tel" id="eTel" inputmode="numeric" pattern="[0-9]{7,15}" maxlength="15" required>
          <span class="field-msg" id="eTelMsg"></span>
        </div>
                <div class="field-group register-field-wide">
          <label for="ePass">Contraseña (mínimo 8 caracteres)</label>
                  <div class="field-wrap has-toggle"><i class="fa-solid fa-lock field-icon"></i><input type="password" id="ePass" autocomplete="new-password" minlength="8" required><button type="button" class="toggle-pass" data-target="ePass" aria-label="Mostrar contraseña"><i class="fa-solid fa-eye"></i></button></div>
          <span class="field-msg" id="ePassMsg"></span>
        </div>
                </div>
        <label class="check-row"><input type="checkbox" id="eTerms" required> Acepto los términos y la política de privacidad.</label>
        <button type="submit" class="btn-auth" id="btnRegEmpresa"><span class="btn-text">Enviar solicitud</span><div class="btn-spinner"></div></button>
        <p class="field-msg" id="registerStatus" role="status"></p>
      </form>
    </div>
  </div>
</div>`;

    if (loginPage) {
        document.body.insertAdjacentHTML("beforeend", modal);
        const overlay = document.getElementById("authOverlay");
        const box = document.getElementById("authBox");
        loginPage.appendChild(box);
        overlay.remove();
        bindAuthForms();
    }

    function bindAuthForms() {
        const loginForm = document.getElementById("formLogin");
        const registerForm = document.getElementById("formRegister");
        const tabLogin = document.getElementById("tabLogin");
        const tabRegister = document.getElementById("tabRegister");
        const loginStatus = document.getElementById("loginStatus");
        const registerStatus = document.getElementById("registerStatus");
        const replaceSessionButton = document.getElementById("btnReplaceSession");

        document.querySelectorAll(".toggle-pass[data-target]").forEach((button) => {
            button.addEventListener("click", () => {
                const input = document.getElementById(button.dataset.target);
                const icon = button.querySelector("i");
                const visible = input.type === "password";
                input.type = visible ? "text" : "password";
                icon.classList.toggle("fa-eye", !visible);
                icon.classList.toggle("fa-eye-slash", visible);
                button.setAttribute("aria-label", visible ? "Ocultar contraseña" : "Mostrar contraseña");
            });
        });

        function switchTab(register) {
            tabLogin.classList.toggle("active", !register);
            tabRegister.classList.toggle("active", register);
            loginForm.classList.toggle("active", !register);
            registerForm.classList.toggle("active", register);
            document.getElementById("authDialogTitle").textContent = register ?
                "Solicitud de acceso empresarial" :
                "Acceso para empresas y administración";
            if (loginPage) loginPage.classList.toggle("register-open", register);
            loginStatus.textContent = "";
            registerStatus.textContent = "";
        }

        tabLogin.addEventListener("click", () => switchTab(false));
        tabRegister.addEventListener("click", () => switchTab(true));

        fetch(apiBase + "datos_referencia.php?tipo=ciudades")
            .then((response) => {
                if (!response.ok) throw new Error("No se pudieron cargar los municipios.");
                return response.json();
            })
            .then((result) => {
                if (!result.ok || !result.data || !Array.isArray(result.data.ciudades)) {
                    throw new Error(result.error || "Respuesta de municipios inválida.");
                }
                const citySelect = document.getElementById("eUbicacion");
                citySelect.innerHTML = '<option value="">Selecciona una ciudad</option>';
                result.data.ciudades.forEach((city) => {
                    const option = document.createElement("option");
                    option.value = city.id;
                    option.textContent = city.nombre;
                    citySelect.appendChild(option);
                });
            })
            .catch((error) => {
                const citySelect = document.getElementById("eUbicacion");
                citySelect.innerHTML = '<option value="">No se pudieron cargar los municipios</option>';
                document.getElementById("eUbicacionMsg").textContent = error.message;
                document.getElementById("eUbicacionMsg").classList.add("error");
            });

        async function iniciarSesion(reemplazarSesion) {
            loginStatus.textContent = "";
            loginStatus.classList.remove("error", "ok");
            if (!loginForm.reportValidity()) return;
            if (window.TeCaptcha && !window.TeCaptcha.isVerified()) {
                loginStatus.textContent = "Completa la verificación de seguridad.";
                loginStatus.classList.add("error");
                return;
            }

            const button = document.getElementById("btnLogin");
            button.disabled = true;
            replaceSessionButton.disabled = true;
            button.classList.add("loading");
            try {
                const response = await fetch(apiBase + "login/login.php", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: document.getElementById("loginEmail").value.trim(),
                        password: document.getElementById("loginPass").value,
                        tipo: document.getElementById("loginType").value,
                        reemplazar_sesion: reemplazarSesion
                    })
                });
                const result = await response.json();
                if (response.status === 409 && result.code === "SESION_ACTIVA") {
                    loginStatus.textContent = result.error + " Puedes cerrar la sesión anterior e iniciar aquí.";
                    loginStatus.classList.add("error");
                    replaceSessionButton.style.display = "flex";
                    return;
                }
                if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo iniciar sesión.");
                replaceSessionButton.style.display = "none";
                localStorage.setItem("te_session", JSON.stringify(result.session));
                const destino = result.session.tipo === "admin" ?
                    "panel_admin.html" :
                    ({ transporte: "panel_transporte.html", hospedaje: "panel_hospedaje.html", planes: "panel_planes.html" }[String(result.session.tipoServicio || "").toLowerCase()] || "panel_transporte.html");
                window._loginSuccess = true;
                window.location.href = destino;
            } catch (error) {
                loginStatus.textContent = error.message;
                loginStatus.classList.add("error");
                if (window.TeCaptcha) window.TeCaptcha.invalidateOnFailedLogin();
            } finally {
                button.disabled = false;
                replaceSessionButton.disabled = false;
                button.classList.remove("loading");
            }
        }

        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            iniciarSesion(false);
        });
        replaceSessionButton.addEventListener("click", () => iniciarSesion(true));

        registerForm.addEventListener("submit", async(event) => {
            event.preventDefault();
            registerStatus.textContent = "";
            registerStatus.classList.remove("error", "ok");
            if (!registerForm.reportValidity()) return;
            const button = document.getElementById("btnRegEmpresa");
            button.disabled = true;
            button.classList.add("loading");
            try {
                const email = document.getElementById("eEmail").value.trim();
                const response = await fetch(apiBase + "login/registro_empresa.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nit: document.getElementById("eNit").value.trim(),
                        nombre: document.getElementById("eNombre").value.trim(),
                        email_inst: email,
                        contacto: document.getElementById("eTel").value.trim(),
                        id_ciudad: document.getElementById("eUbicacion").value,
                        tipo_servicio: document.getElementById("eService").value,
                        email_login: email,
                        password: document.getElementById("ePass").value
                    })
                });
                const result = await response.json();
                if (!response.ok || !result.ok) throw new Error(result.error || "No se pudo enviar la solicitud.");
                registerForm.reset();
                registerStatus.textContent = "Solicitud enviada. El equipo revisará la información y contactará a la empresa.";
                registerStatus.classList.add("ok");
            } catch (error) {
                registerStatus.textContent = error.message;
                registerStatus.classList.add("error");
            } finally {
                button.disabled = false;
                button.classList.remove("loading");
            }
        });

        document.querySelectorAll(".auth-close").forEach((button) => {
            button.addEventListener("click", () => window.TourismAuth.close());
        });
    }

    function clearSession() {
        sessionStorage.removeItem("te_session");
        localStorage.removeItem("te_session");
    }

    function getSession() {
        try {
            const storedSession = localStorage.getItem("te_session") || sessionStorage.getItem("te_session");
            const session = JSON.parse(storedSession || "null");
            if (session) {
                localStorage.setItem("te_session", JSON.stringify(session));
                sessionStorage.removeItem("te_session");
            }
            if (session && ["admin", "empresa"].includes(session.tipo)) return session;
        } catch (error) {
            console.error("No se pudo leer la sesión:", error);
        }
        clearSession();
        return null;
    }

    function route(file) {
        return pageBase + file;
    }

    function panelForSession(user) {
        if (user.tipo === "admin") return "panel_admin.html";
        return {
            transporte: "panel_transporte.html",
            hospedaje: "panel_hospedaje.html",
            planes: "panel_planes.html"
        }[String(user.tipoServicio || "").toLowerCase()] || "panel_transporte.html";
    }

    function guardCompanyPage() {
        const user = getSession();
        if (!user || user.tipo !== "empresa") return true;

        const allowedPages = [
            "panel_transporte.html",
            "panel_hospedaje.html",
            "panel_planes.html",
            "perfil_empresa.html",
            "config_empresa.html"
        ];
        const filename = window.location.pathname.split("/").pop();
        if (allowedPages.includes(filename)) return true;

        window.location.replace(route(panelForSession(user)));
        return false;
    }

    function applySession() {
        const user = getSession();
        document.querySelectorAll(".btn-acceder").forEach((button) => {
            button.style.display = user ? "none" : "";
        });
        document.querySelectorAll(".session-widget").forEach((widget) => widget.remove());
        if (!user) return;

        const panel = panelForSession(user);
        const menu = user.tipo === "admin" ?
            `<a class="session-menu-item session-menu-highlight" href="${route(panel)}">Panel Admin</a><a class="session-menu-item" href="${route("perfil_admin.html")}">Mi Perfil</a><a class="session-menu-item" href="${route("config_admin.html")}">Configuración</a>` :
            `<a class="session-menu-item session-menu-highlight" href="${route(panel)}">Mi Panel</a><a class="session-menu-item" href="${route("perfil_empresa.html")}">Mi Perfil</a><a class="session-menu-item" href="${route("config_empresa.html")}">Configuración</a>`;
        const widget = document.createElement("div");
        widget.className = "session-widget";
        widget.innerHTML = `<button class="session-trigger"><span class="session-avatar"></span><span class="session-info"><span class="session-name"></span><span class="session-tipo"></span></span><i class="fa-solid fa-chevron-down session-chevron"></i></button><div class="session-dropdown">${menu}<a class="session-menu-item session-menu-danger logout-btn" href="#">Cerrar sesión</a></div>`;
        const name = String(user.nombre || (user.tipo === "admin" ? "Administrador" : "Empresa"));
        widget.querySelector(".session-avatar").textContent = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
        widget.querySelector(".session-name").textContent = name;
        widget.querySelector(".session-tipo").textContent = user.tipo === "admin" ? "Administrador" : "Empresa";
        const darkMode = document.getElementById("dark-mode-toggle");
        if (darkMode && darkMode.parentElement) darkMode.parentElement.insertBefore(widget, darkMode);
        else {
            const navContainer = document.querySelector(".nav-container");
            if (navContainer) navContainer.appendChild(widget);
        }
        widget.querySelector(".session-trigger").addEventListener("click", () => {
            widget.querySelector(".session-dropdown").classList.toggle("open");
        });
        widget.querySelector(".logout-btn").addEventListener("click", async(event) => {
            event.preventDefault();
            try {
                const response = await fetch(apiBase + "login/logout_admin.php", {
                    method: "POST",
                    credentials: "include"
                });
                const result = await response.json();
                if (!response.ok || !result.ok) {
                    throw new Error(result.error || "No se pudo cerrar la sesión.");
                }
                clearSession();
                window.location.href = inHtml ? "../index.html" : "index.html";
            } catch (error) {
                console.error("No se pudo cerrar la sesión en el servidor:", error);
                alert(error.message || "No se pudo cerrar la sesión. Intenta de nuevo.");
            }
        });
    }

    window.TourismAuth = {
        open: function(tab) {
            if (!loginPage) {
                window.location.href = pageBase + "login.html";
                return;
            }
            if (tab === "register") document.getElementById("tabRegister").click();
        },
        close: function() {
            window._loginSuccess = true;
            window.location.href = inHtml ? "../index.html" : "index.html";
        }
    };

    const session = getSession();
    const filename = window.location.pathname.split("/").pop();
    if (session && filename === "login.html") {
        window.location.href = route(panelForSession(session));
    } else if (guardCompanyPage()) {
        applySession();
    }

    window.addEventListener("pageshow", (event) => {
        if (event.persisted && guardCompanyPage()) applySession();
    });
})();