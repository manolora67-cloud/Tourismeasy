(function () {
    try {
        const storedSession = localStorage.getItem("te_session") || sessionStorage.getItem("te_session");
        const session = JSON.parse(storedSession || "null");
        if (session && ["admin", "empresa"].includes(session.tipo)) {
            localStorage.setItem("te_session", JSON.stringify(session));
            sessionStorage.removeItem("te_session");
            const panel = session.tipo === "admin"
                ? "panel_admin.html"
                : ({
                    transporte: "panel_transporte.html",
                    hospedaje: "panel_hospedaje.html",
                    planes: "panel_planes.html"
                }[String(session.tipoServicio || "").toLowerCase()] || "panel_transporte.html");
            window.location.replace(panel);
            return;
        }
    } catch (error) {
        sessionStorage.removeItem("te_session");
        localStorage.removeItem("te_session");
    }

    const darkBtn = document.getElementById("darkModeToggle");
    const icon = darkBtn ? darkBtn.querySelector("i") : null;
    const saved = localStorage.getItem("theme");
    const dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark-mode", dark);
    if (icon) icon.className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    if (darkBtn) {
        darkBtn.addEventListener("click", function () {
            const enabled = !document.body.classList.contains("dark-mode");
            document.body.classList.toggle("dark-mode", enabled);
            localStorage.setItem("theme", enabled ? "dark" : "light");
            if (icon) icon.className = enabled ? "fa-solid fa-sun" : "fa-solid fa-moon";
        });
    }

    window.addEventListener("beforeunload", function (event) {
        if (!window._loginSuccess) {
            event.preventDefault();
            event.returnValue = "¿Seguro que quieres salir? Perderás el progreso del formulario.";
        }
    });

    const back = document.querySelector(".btn-back-home");
    if (back) {
        back.addEventListener("click", function (event) {
            event.preventDefault();
            if (window.confirm("¿Seguro que deseas salir? Perderás el progreso del formulario.")) {
                window._loginSuccess = true;
                window.location.href = "../index.html";
            }
        });
    }
})();
