(function () {
    "use strict";

    const heartbeatIntervalMs = 10 * 1000;
    const adminSessionKey = "te_session";
    const artisanSessionKey = "te_ecommerce_session";
    sessionStorage.removeItem("tourismeasy_sue_chat");
    const privatePage = /\/(?:panel_[^/]+|perfil_(?:admin|empresa)\.html|config_(?:admin|empresa)\.html|festividades_admin\.html|catalogos_admin\.html|e-commerce\/admin\.php)$/i
        .test(window.location.pathname);
    const loginPage = /\/login(?:_ecommerce)?\.html$/i.test(window.location.pathname);
    const heartbeatUrl = new URL(
        window.location.pathname.includes("/html/") || window.location.pathname.includes("/e-commerce/")
            ? "../login/mantener_sesion.php"
            : "login/mantener_sesion.php",
        window.location.href
    );
    let lastHeartbeat = 0;
    let heartbeatPending = false;
    let lastUserActivity = Date.now();

    function normalizarSesion(session) {
        if (!session || typeof session !== "object") return null;
        if (!["admin", "empresa", "artesano"].includes(session.tipo)) return null;

        const normalized = { tipo: session.tipo };
        const service = String(session.tipoServicio || session.servicio || "").trim();
        if (session.tipo === "empresa" && service) normalized.tipoServicio = service;
        return normalized;
    }

    function guardarSesion(session) {
        const normalized = normalizarSesion(session);
        localStorage.removeItem(adminSessionKey);
        localStorage.removeItem(artisanSessionKey);
        sessionStorage.removeItem(adminSessionKey);
        sessionStorage.removeItem(artisanSessionKey);
        if (!normalized) return null;

        const key = normalized.tipo === "artesano" ? artisanSessionKey : adminSessionKey;
        localStorage.setItem(key, JSON.stringify(normalized));
        return normalized;
    }

    const storedLegacy = [adminSessionKey, artisanSessionKey]
        .map(function (key) {
            return localStorage.getItem(key) || sessionStorage.getItem(key);
        })
        .find(Boolean);
    let currentSession = null;
    if (storedLegacy) {
        try {
            currentSession = guardarSesion(JSON.parse(storedLegacy));
        } catch (error) {
            localStorage.removeItem(adminSessionKey);
            localStorage.removeItem(artisanSessionKey);
            sessionStorage.removeItem(adminSessionKey);
            sessionStorage.removeItem(artisanSessionKey);
        }
    }

    window.TourismSession = {
        get: function () {
            const raw = localStorage.getItem(adminSessionKey) || localStorage.getItem(artisanSessionKey);
            if (!raw) {
                currentSession = null;
                return null;
            }
            try {
                currentSession = normalizarSesion(JSON.parse(raw));
                return currentSession ? { ...currentSession } : null;
            } catch (error) {
                clearSession();
                return null;
            }
        },
        save: function (session) {
            currentSession = guardarSesion(session);
            return currentSession ? { ...currentSession } : null;
        },
        clear: function () {
            currentSession = null;
            clearSession();
        }
    };

    function getStoredSession() {
        const session = window.TourismSession.get();
        if (!session) return null;
        return {
            key: session.tipo === "artesano" ? artisanSessionKey : adminSessionKey,
            session: session
        };
    }

    function clearSession() {
        localStorage.removeItem(adminSessionKey);
        localStorage.removeItem(artisanSessionKey);
        sessionStorage.removeItem(adminSessionKey);
        sessionStorage.removeItem(artisanSessionKey);
        window.dispatchEvent(new Event("te-session-expired"));
    }

    function redirectToLogin(session) {
        if (!privatePage || loginPage) return;
        const artisan = (session && session.tipo === "artesano")
            || window.location.pathname.includes("/e-commerce/");
        const target = artisan ? "../html/login_ecommerce.html" : "login.html";
        const loginUrl = new URL(target, window.location.href);
        loginUrl.searchParams.set("sesion_expirada", "1");
        window.location.replace(loginUrl.href);
    }

    function expireSession(session) {
        clearSession();
        redirectToLogin(session);
    }

    function isExpired(session) {
        return !session || !["admin", "empresa", "artesano"].includes(session.tipo);
    }

    function saveActivity(stored) {
        lastUserActivity = Date.now();
        validateWithServer(stored, true);
    }

    function checkSession() {
        const stored = getStoredSession();
        if (!stored) return null;
        if (isExpired(stored.session)) {
            expireSession(stored.session);
            return null;
        }
        return stored;
    }

    function validateWithServer(stored, force) {
        if (heartbeatPending || (!force && Date.now() - lastHeartbeat < heartbeatIntervalMs)) return;
        heartbeatPending = true;
        lastHeartbeat = Date.now();
        fetch(heartbeatUrl.href, {
            credentials: "include",
            cache: "no-store"
        })
            .then(function (response) {
                if (response.status === 401) {
                    expireSession(stored.session);
                    return null;
                }
                if (!response.ok) throw new Error("No se pudo validar la sesión.");
                return response.json();
            })
            .then(function (result) {
                if (result && result.activa === true) {
                    checkSession();
                } else if (result && result.activa === false) {
                    expireSession(stored.session);
                }
            })
            .catch(function (error) {
                console.warn("[TourismEasy] No se pudo validar la sesión con el servidor.", error);
            })
            .finally(function () {
                heartbeatPending = false;
            });
    }

    const initialSession = getStoredSession();
    if (initialSession && isExpired(initialSession.session)) {
        expireSession(initialSession.session);
    } else if (initialSession) {
        validateWithServer(initialSession);
    }

    function recordUserActivity() {
        const stored = checkSession();
        if (!stored) return;
        saveActivity(stored);
        validateWithServer(stored);
    }

    ["pointerdown", "keydown", "touchstart", "input", "scroll"].forEach(function (eventName) {
        document.addEventListener(eventName, recordUserActivity, { passive: true });
    });

    window.addEventListener("storage", function (event) {
        if (![adminSessionKey, artisanSessionKey].includes(event.key)) return;
        const stored = checkSession();
        if (stored) validateWithServer(stored);
        else if (privatePage) redirectToLogin(null);
    });

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState !== "visible") return;
        const stored = checkSession();
        if (stored) validateWithServer(stored, true);
    });

    window.setInterval(function () {
        const stored = checkSession();
        if (!stored) return;
        if (Date.now() - lastUserActivity < 60 * 1000) {
            validateWithServer(stored);
        }
    }, heartbeatIntervalMs);
})();
