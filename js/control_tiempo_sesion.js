(function () {
    "use strict";

    const timeoutMs = 10 * 60 * 1000;
    const heartbeatIntervalMs = 10 * 1000;
    const adminSessionKey = "te_session";
    const artisanSessionKey = "te_ecommerce_session";
    const privatePage = /\/(?:panel_[^/]+|perfil_(?:admin|empresa)\.html|config_(?:admin|empresa)\.html|festividades_admin\.html|e-commerce\/admin\.php)$/i
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

    function getStoredSession() {
        for (const key of [adminSessionKey, artisanSessionKey]) {
            const value = localStorage.getItem(key) || sessionStorage.getItem(key);
            if (!value) continue;

            try {
                const session = JSON.parse(value);
                if (session && typeof session === "object" && session.id) {
                    return { key: key, session: session };
                }
            } catch (error) {
                console.warn("[TourismEasy] No se pudo leer la sesión guardada.", error);
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            }
        }
        return null;
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
        const artisan = session && session.tipo === "artesano";
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
        const lastActivity = Number(session.ultimaActividad);
        return !Number.isFinite(lastActivity) || Date.now() - lastActivity >= timeoutMs;
    }

    function saveActivity(stored) {
        stored.session.ultimaActividad = Date.now();
        const value = JSON.stringify(stored.session);
        try {
            if (localStorage.getItem(stored.key)) {
                localStorage.setItem(stored.key, value);
                sessionStorage.removeItem(stored.key);
            } else {
                sessionStorage.setItem(stored.key, value);
            }
        } catch (error) {
            console.warn("[TourismEasy] No se pudo actualizar la actividad de la sesión.", error);
        }
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
                    const current = checkSession();
                    if (current) saveActivity(current);
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
    });

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState !== "visible") return;
        const stored = checkSession();
        if (stored) validateWithServer(stored, true);
    });

    window.setInterval(function () {
        const stored = checkSession();
        if (!stored) return;
        if (Date.now() - Number(stored.session.ultimaActividad) < 60 * 1000) {
            validateWithServer(stored);
        }
    }, heartbeatIntervalMs);
})();
