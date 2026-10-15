    /* ============================================================
       LOGIN SOCIAL (Google / Facebook)
       Pega este bloque justo ANTES de:
       window.TourismAuth = { open: openAuth, close: closeAuth };
       Así queda dentro del mismo cierre (closure) que saveSession,
       applySession, showWelcomeToast, setMsg, $, _raiz, etc. y puede
       reusarlas tal cual, sin duplicar nada.
    ============================================================ */

    // TODO: reemplaza por tu Client ID de Google y tu App ID de Facebook
    const GOOGLE_CLIENT_ID = "TU_CLIENT_ID.apps.googleusercontent.com";
    const FACEBOOK_APP_ID = "TU_APP_ID";

    function loadScriptOnce(src, id) {
        return new Promise((resolve) => {
            if (document.getElementById(id)) return resolve();
            const s = document.createElement("script");
            s.src = src; s.id = id; s.async = true; s.defer = true;
            s.onload = () => resolve();
            document.head.appendChild(s);
        });
    }

    function handleSocialResponse(data, btn) {
        btn.classList.remove("loading");
        btn.disabled = false;

        if (!data.ok) {
            setMsg($("loginEmailMsg"), data.error || "No se pudo iniciar sesión.", "error");
            return;
        }

        if (data.nuevo) {
            showSocialProfileForm(data.perfil);
            return;
        }

        const matchedUser = data.session;
        saveSession(matchedUser);
        applySession();
        showWelcomeToast(matchedUser);
        setTimeout(() => {
            window._loginSuccess = true;
            window.location.href = _raiz();
        }, 1400);
    }

    function postSocial(body, btn) {
        fetch("../login/login_social.php", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
            .then(r => r.json())
            .then(data => handleSocialResponse(data, btn))
            .catch(() => {
                btn.classList.remove("loading");
                btn.disabled = false;
                setMsg($("loginEmailMsg"), "No se pudo conectar con el servidor.", "error");
            });
    }

    /* ── Mini formulario para completar el perfil (solo la primera vez) ── */
    function showSocialProfileForm(perfil) {
        if ($("socialProfileOverlay")) $("socialProfileOverlay").remove();

        document.body.insertAdjacentHTML("beforeend", `
        <div class="auth-overlay" id="socialProfileOverlay"
             style="position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999;">
          <div class="login-page-card" style="max-width:380px;">
            <h3 style="margin-bottom:4px;">¡Ya casi, ${perfil.nombre}!</h3>
            <p style="opacity:.8;margin-bottom:16px;">Nos falta tu documento y celular para crear tu cuenta.</p>
            <select id="spTipoDoc" class="btn-auth" style="margin-bottom:10px;">
              <option value="1">Cédula de ciudadanía</option>
              <option value="2">Cédula de extranjería</option>
              <option value="3">Pasaporte</option>
            </select>
            <input type="text" id="spDocumento" placeholder="Número de documento" style="margin-bottom:10px;width:100%;">
            <input type="tel" id="spCelular" placeholder="Celular" style="margin-bottom:10px;width:100%;">
            <span class="field-msg" id="spMsg"></span>
            <button class="btn-auth" id="spSubmit" style="margin-top:10px;">
              <span class="btn-text">Crear mi cuenta</span>
              <div class="btn-spinner"></div>
            </button>
          </div>
        </div>`);

        $("spSubmit").addEventListener("click", () => {
            const documento = $("spDocumento").value.trim();
            const celular = $("spCelular").value.trim();
            const tipoDoc = parseInt($("spTipoDoc").value) || 1;

            if (!documento || !celular) {
                setMsg($("spMsg"), "Completa documento y celular.", "error");
                return;
            }

            const btn = $("spSubmit");
            btn.classList.add("loading");
            btn.disabled = true;

            fetch("../login/registro_viajero_social.php", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documento, tipo_doc: tipoDoc, celular })
            })
                .then(r => r.json())
                .then(data => {
                    btn.classList.remove("loading");
                    btn.disabled = false;
                    if (!data.ok) {
                        setMsg($("spMsg"), data.error || "No se pudo crear la cuenta.", "error");
                        return;
                    }
                    $("socialProfileOverlay").remove();
                    const matchedUser = data.session;
                    saveSession(matchedUser);
                    applySession();
                    showWelcomeToast(matchedUser);
                    setTimeout(() => {
                        window._loginSuccess = true;
                        window.location.href = _raiz();
                    }, 1400);
                })
                .catch(() => {
                    btn.classList.remove("loading");
                    btn.disabled = false;
                    setMsg($("spMsg"), "No se pudo conectar con el servidor.", "error");
                });
        });
    }

    /* ── Google ── */
    function initGoogleButton() {
        loadScriptOnce("https://accounts.google.com/gsi/client", "gsi-client").then(() => {
            if (!window.google || !$("btnGoogleAuth")) return;

            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response) => {
                    const btn = $("btnGoogleAuth");
                    btn.classList.add("loading");
                    btn.disabled = true;
                    postSocial({ proveedor: "google", token: response.credential }, btn);
                }
            });

            // Renderizamos el botón REAL de Google oculto, y el clic en
            // nuestro botón con nuestro propio estilo lo dispara. Es el
            // truco estándar para poder tener un botón de Google que
            // combine con el resto del diseño.
            const hidden = document.createElement("div");
            hidden.id = "googleHiddenBtn";
            hidden.style.cssText = "position:fixed;top:-9999px;left:-9999px;";
            document.body.appendChild(hidden);
            google.accounts.id.renderButton(hidden, { type: "standard" });

            $("btnGoogleAuth").addEventListener("click", () => {
                const real = hidden.querySelector("div[role=button]");
                if (real) real.click();
            });
        });
    }

    /* ── Facebook ── */
    function initFacebookButton() {
        window.fbAsyncInit = function () {
            FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: "v20.0" });
        };
        loadScriptOnce("https://connect.facebook.net/es_LA/sdk.js", "fb-sdk").then(() => {
            if (!$("btnFacebookAuth")) return;
            $("btnFacebookAuth").addEventListener("click", () => {
                const btn = $("btnFacebookAuth");
                FB.login((res) => {
                    if (res.authResponse) {
                        btn.classList.add("loading");
                        btn.disabled = true;
                        postSocial({ proveedor: "facebook", token: res.authResponse.accessToken }, btn);
                    } else {
                        setMsg($("loginEmailMsg"), "Inicio con Facebook cancelado.", "error");
                    }
                }, { scope: "email public_profile" });
            });
        });
    }

    initGoogleButton();
    initFacebookButton();
