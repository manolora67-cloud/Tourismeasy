(function () {
    "use strict";

    var panelesEmpresa = {
        TRANSPORTE: { ruta: "panel_transporte.html", icono: "fa-bus" },
        HOSPEDAJE: { ruta: "panel_hospedaje.html", icono: "fa-hotel" },
        PLANES: { ruta: "panel_planes.html", icono: "fa-map-location-dot" },
        PERSONAL_AUXILIAR: { ruta: "panel_auxiliar.html", icono: "fa-person-cane" },
        AUXILIAR: { ruta: "panel_auxiliar.html", icono: "fa-person-cane" }
    };

    var menus = {
        admin: {
            etiqueta: "Administrador",
            avatar: "AD",
            items: [
                { texto: "Ir al sitio", ruta: "index.html", icono: "fa-house" },
                { texto: "Panel Administrador", ruta: "html/panel_admin.html", icono: "fa-shield-halved", activo: "panel" },
                { texto: "Mi Perfil", ruta: "html/perfil_admin.html", icono: "fa-user", activo: "perfil" },
                { texto: "Configuración", ruta: "html/config_admin.html", icono: "fa-gear", activo: "config" },
                { texto: "Festividades", ruta: "html/festividades_admin.html", icono: "fa-calendar-days", activo: "festividades" },
                { texto: "Catálogos", ruta: "html/catalogos_admin.html", icono: "fa-list-check", activo: "catalogos" }
            ]
        },
        empresa: {
            etiqueta: "Empresa",
            avatar: "EM",
            items: [
                { texto: "Panel Empresa", icono: "", activo: "panel", panelEmpresa: true },
                { texto: "Mi Perfil", ruta: "html/perfil_empresa.html", icono: "fa-user", activo: "perfil" },
                { texto: "Configuración", ruta: "html/config_empresa.html", icono: "fa-gear", activo: "config" }
            ]
        },
        artesano: {
            etiqueta: "Artesano",
            avatar: "AR",
            items: [
                { texto: "Mi Panel de Productos", ruta: "e-commerce/admin.php", icono: "fa-box", activo: "panel" },
                { texto: "Mi Perfil", ruta: "e-commerce/perfil_artesano.php", icono: "fa-user", activo: "perfil" }
            ]
        }
    };

    function obtenerSesion() {
        try {
            var raw = localStorage.getItem("te_session") || sessionStorage.getItem("te_session");
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error("No se pudo leer la sesión para el menú.", error);
            return null;
        }
    }

    function nombreUsuario(usuario) {
        var nombre = usuario.nombreCompleto || usuario.nombre || usuario.nom_persona
            || usuario.nom_empresa || usuario.nombre_empresa || usuario.name || "";
        return typeof nombre === "string" && nombre.trim() ? nombre.trim() : "Cuenta TourismEasy";
    }

    function iniciales(nombre, predeterminadas) {
        var partes = nombre.trim().split(/\s+/).filter(Boolean);
        if (!partes.length || nombre === "Cuenta TourismEasy") return predeterminadas;
        return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : ""))
            .toLocaleUpperCase();
    }

    function agregarIcono(enlace, icono) {
        if (!icono) return;
        var elemento = document.createElement("i");
        elemento.className = "fa-solid " + icono;
        elemento.setAttribute("aria-hidden", "true");
        enlace.appendChild(elemento);
    }

    function cerrarSesion(rol, raiz) {
        if (rol === "artesano") return;
        if (window.TEUI && typeof window.TEUI.logoutAdmin === "function") {
            window.TEUI.logoutAdmin(raiz + "login/logout_admin.php", raiz + "index.html");
        } else {
            console.error("No está disponible el servicio común para cerrar sesión.");
        }
    }

    function montar() {
        var slot = document.getElementById("sessionWidgetSlot");
        if (!slot) return false;

        var usuario = obtenerSesion();
        var rol = slot.dataset.role || (usuario && usuario.tipo);
        if (!usuario || !menus[rol] || usuario.tipo !== rol) return false;

        var configuracion = menus[rol];
        var raiz = slot.dataset.root || "../";
        var paginaActiva = slot.dataset.active || "";
        var nombre = nombreUsuario(usuario);
        var widget = document.createElement("div");
        widget.id = "sessionWidget";
        widget.className = "session-widget";

        var boton = document.createElement("button");
        boton.type = "button";
        boton.className = "session-trigger";
        boton.id = "sessionTrigger";
        boton.setAttribute("aria-haspopup", "true");
        boton.setAttribute("aria-expanded", "false");

        var avatar = document.createElement("div");
        avatar.className = "session-avatar";
        avatar.textContent = iniciales(nombre, configuracion.avatar);
        var informacion = document.createElement("div");
        informacion.className = "session-info";
        var nombreElemento = document.createElement("span");
        nombreElemento.className = "session-name";
        if (rol === "artesano") nombreElemento.id = "artesanoNombre";
        nombreElemento.textContent = nombre;
        var tipo = document.createElement("span");
        tipo.className = "session-tipo";
        tipo.textContent = configuracion.etiqueta;
        informacion.append(nombreElemento, tipo);
        var chevron = document.createElement("i");
        chevron.className = "fa-solid fa-chevron-down session-chevron";
        chevron.id = "sessionChevron";
        chevron.setAttribute("aria-hidden", "true");
        boton.append(avatar, informacion, chevron);

        var menu = document.createElement("div");
        menu.className = "session-dropdown";
        menu.id = "sessionDropdown";
        menu.setAttribute("role", "menu");
        configuracion.items.forEach(function (item) {
            var enlace = document.createElement("a");
            enlace.className = "session-menu-item";
            if (
                (rol === "empresa" && item.panelEmpresa)
                || (rol === "admin" && item.activo === paginaActiva)
                || (rol === "artesano" && item.activo === paginaActiva)
            ) {
                enlace.classList.add("session-menu-highlight");
            }
            if (item.panelEmpresa) {
                var servicio = String(usuario.tipoServicio || usuario.servicio || "TRANSPORTE").toUpperCase();
                var panel = panelesEmpresa[servicio] || panelesEmpresa.TRANSPORTE;
                enlace.href = raiz + "html/" + panel.ruta;
                item.icono = panel.icono;
            } else {
                enlace.href = raiz + item.ruta;
            }
            enlace.setAttribute("role", "menuitem");
            agregarIcono(enlace, item.icono);
            enlace.appendChild(document.createTextNode(item.texto));
            menu.appendChild(enlace);
        });

        var salir = document.createElement(rol === "artesano" ? "button" : "a");
        salir.className = "session-menu-item session-menu-danger";
        salir.id = rol === "artesano" ? "btnLogoutArtesano" : "btnLogout";
        if (rol === "artesano") {
            salir.type = "button";
            salir.textContent = "Cerrar sesión";
        } else {
            salir.href = "#";
            salir.setAttribute("role", "menuitem");
            salir.appendChild(document.createTextNode("Cerrar sesión"));
        }
        agregarIcono(salir, "fa-right-from-bracket");
        menu.appendChild(salir);

        widget.append(boton, menu);
        slot.replaceChildren(widget);

        function cerrarMenu() {
            menu.classList.remove("open");
            boton.setAttribute("aria-expanded", "false");
            chevron.style.transform = "rotate(0deg)";
        }

        boton.addEventListener("click", function (event) {
            event.stopPropagation();
            var abierto = menu.classList.toggle("open");
            boton.setAttribute("aria-expanded", String(abierto));
            chevron.style.transform = abierto ? "rotate(180deg)" : "rotate(0deg)";
        });
        menu.addEventListener("click", function (event) {
            event.stopPropagation();
        });
        document.addEventListener("click", cerrarMenu);
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                cerrarMenu();
                boton.focus();
            }
        });
        if (rol !== "artesano") {
            salir.addEventListener("click", function (event) {
                event.preventDefault();
                cerrarSesion(rol, raiz);
            });
        }
        return true;
    }

    window.TESessionMenu = { mount: montar };
})();
