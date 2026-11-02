(function () {
    var sessionValue = localStorage.getItem("te_session") || sessionStorage.getItem("te_session");
    if (!sessionValue) return;

    var user;
    try {
        user = JSON.parse(sessionValue);
    } catch (error) {
        console.error("No se pudo leer la sesión de la empresa:", error);
        showUnavailable();
        return;
    }

    if (!user || user.tipo !== "empresa" || !user.id) {
        showUnavailable();
        return;
    }

    fetch("../soli_empresas/get_perfil_empresa.php", {
        credentials: "include",
        cache: "no-store"
    })
        .then(function (response) {
            if (!response.ok) throw new Error("El servidor respondió con HTTP " + response.status);
            return response.json();
        })
        .then(function (data) {
            if (!data.ok || !data.empresa) {
                throw new Error(data.error || "No se recibieron los datos de la empresa.");
            }
            var empresa = data.empresa;
            if (String(empresa.nit) !== String(user.id)) {
                throw new Error("La sesión del navegador no coincide con la empresa autenticada en el servidor.");
            }

            var nombre = typeof empresa.nombre === "string" ? empresa.nombre.trim() : "";
            if (!nombre) throw new Error("El servidor no devolvió el nombre de la empresa.");
            var initials = nombre.split(/\s+/).map(function (word) {
                return word[0] || "";
            }).join("").toUpperCase().slice(0, 2) || "EM";

            setText("#panelNombre", nombre);
            setText("#panelAvatar", initials);
            setText("#panelPerfilEstado", "Panel de empresa · TourismEasy");
            setText("#sessionWidget .session-name", nombre);
            setText("#sessionWidget .session-avatar", initials);
            document.title = "Panel - " + nombre + " - TourismEasy";
            var serviceKey = String(empresa.servicio || "").toUpperCase();
            var panelByService = {
                TRANSPORTE: "panel_transporte.html",
                HOSPEDAJE: "panel_hospedaje.html",
                PLANES: "panel_planes.html",
                PERSONAL_AUXILIAR: "panel_auxiliar.html",
                AUXILIAR: "panel_auxiliar.html"
            };
            var panelLink = document.querySelector("#sessionWidget .session-menu-highlight");
            if (panelLink && panelByService[serviceKey]) {
                panelLink.href = panelByService[serviceKey];
            }

            user.nombre = nombre;
            user.avatar = initials;
            user.tipoServicio = empresa.servicio || user.tipoServicio;
            var sessionStore = localStorage.getItem("te_session") ? localStorage : sessionStorage;
            sessionStore.setItem("te_session", JSON.stringify(user));
        })
        .catch(function (error) {
            console.error("No se pudo cargar el perfil de la empresa:", error);
            showUnavailable();
        });

    function setText(selector, value) {
        var element = document.querySelector(selector);
        if (element) element.textContent = value;
    }

    function showUnavailable() {
        setText("#panelNombre", "No disponible");
        setText("#panelPerfilEstado", "No se pudo cargar el perfil de la empresa.");
        setText("#sessionWidget .session-name", "No disponible");
    }
})();
