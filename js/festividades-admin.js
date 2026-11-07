(function() {
    "use strict";

    var endpoint = "../admin/festividades.php";
    var csrfToken = "";
    var festividades = [];
    var form = document.getElementById("festividadForm");
    var dialog = document.getElementById("festividadDialog");
    var tableBody = document.getElementById("festividadesTabla");
    var errorBox = document.getElementById("festividadesError");
    var formErrorBox = document.getElementById("festividadFormError");
    var saveButton = document.getElementById("btnGuardarFestividad");
    var pagination = document.getElementById("festividadesPaginacion");
    var paginationSummary = document.getElementById("festividadesResumen");
    var currentPageLabel = document.getElementById("festividadesPaginaActual");
    var previousPageButton = document.getElementById("festividadesAnterior");
    var nextPageButton = document.getElementById("festividadesSiguiente");
    var upcomingList = document.getElementById("festividadesProximas");
    var pageSize = 10;
    var currentPage = 1;
    var monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

    function mostrarError(mensaje) {
        var target = dialog.open ? formErrorBox : errorBox;
        target.textContent = mensaje;
        target.hidden = false;
    }

    function limpiarError() {
        errorBox.textContent = "";
        errorBox.hidden = true;
        formErrorBox.textContent = "";
        formErrorBox.hidden = true;
    }

    function cerrarDialogo(notify) {
        if (!dialog.open) return;
        dialog.close();
        if (notify) window.TEUI.notifyClosed("Formulario");
    }

    async function respuestaJson(response) {
        var data;
        try {
            data = await response.json();
        } catch (error) {
            throw new Error("El servidor devolvió una respuesta que no es JSON.");
        }
        if (!response.ok || !data.ok) {
            throw new Error(data.error || "No se pudo completar la solicitud.");
        }
        return data;
    }

    function crearCelda(texto, clase) {
        var celda = document.createElement("td");
        celda.textContent = texto;
        if (clase) celda.className = clase;
        return celda;
    }

    function actualizarResumenSidebar(pageCount) {
        var nacionales = festividades.filter(function(festividad) {
            return festividad.tipo === "NACIONAL";
        }).length;
        var inicio = festividades.length ? (currentPage - 1) * pageSize + 1 : 0;
        var fin = Math.min(currentPage * pageSize, festividades.length);
        document.getElementById("festividadesTotal").textContent = String(festividades.length);
        document.getElementById("festividadesNacionales").textContent = String(nacionales);
        document.getElementById("festividadesRegionales").textContent = String(
            festividades.filter(function(festividad) {
                return festividad.tipo === "REGIONAL";
            }).length
        );
        document.getElementById("festividadesRango").textContent = festividades.length ? inicio + "–" + fin : "Sin registros";
        document.getElementById("festividadesPaginaSidebar").textContent = currentPage + " de " + (pageCount || 1);
    }

    function renderizarProximasCelebraciones() {
        upcomingList.replaceChildren();
        if (!festividades.length) {
            var empty = document.createElement("p");
            empty.className = "festividades-upcoming-empty";
            empty.textContent = "Agrega festividades al calendario para ver aquí las próximas celebraciones.";
            upcomingList.appendChild(empty);
            return;
        }

        var hoy = new Date();
        var fechaHoy = String(hoy.getMonth() + 1).padStart(2, "0") + "-" + String(hoy.getDate()).padStart(2, "0");
        var ordenadas = festividades.slice().sort(function(a, b) {
            return a.fecha_clave.trim().localeCompare(b.fecha_clave.trim());
        });
        var proximas = ordenadas.filter(function(festividad) {
            return festividad.fecha_clave.trim() >= fechaHoy;
        }).concat(ordenadas.filter(function(festividad) {
            return festividad.fecha_clave.trim() < fechaHoy;
        })).slice(0, 3);

        proximas.forEach(function(festividad) {
            var partes = festividad.fecha_clave.trim().split("-");
            var item = document.createElement("article");
            item.className = "festividad-upcoming-item";
            var icon = document.createElement("span");
            icon.className = "festividad-upcoming-emoji";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = festividad.emoji || "📅";
            var content = document.createElement("div");
            content.className = "festividad-upcoming-info";
            var title = document.createElement("strong");
            title.textContent = festividad.titulo;
            var subtitle = document.createElement("span");
            subtitle.textContent = festividad.subtitulo || (festividad.tipo === "NACIONAL" ? "Nacional" : "Regional");
            var date = document.createElement("time");
            date.className = "festividad-upcoming-date";
            date.textContent = Number(partes[0]) + " " + (monthNames[Number(partes[0]) - 1] || "");
            date.dateTime = "2000-" + festividad.fecha_clave.trim();
            content.append(title, subtitle);
            item.append(icon, content, date);
            upcomingList.appendChild(item);
        });
    }

    function renderizarFestividades() {
        tableBody.replaceChildren();
        var pageCount = Math.ceil(festividades.length / pageSize);
        currentPage = Math.max(1, Math.min(currentPage, pageCount || 1));
        if (pagination) {
            pagination.hidden = pageCount <= 1;
            if (pageCount) {
                var firstItem = (currentPage - 1) * pageSize + 1;
                var lastItem = Math.min(currentPage * pageSize, festividades.length);
                paginationSummary.textContent = "Mostrando " + firstItem + "–" + lastItem + " de " + festividades.length;
                currentPageLabel.textContent = "Página " + currentPage + " de " + pageCount;
                previousPageButton.disabled = currentPage === 1;
                nextPageButton.disabled = currentPage === pageCount;
            }
        }
        actualizarResumenSidebar(pageCount);
        renderizarProximasCelebraciones();
        if (!festividades.length) {
            var vacio = document.createElement("tr");
            var mensaje = crearCelda("Todavía no hay festividades registradas.", "festividades-empty");
            mensaje.colSpan = 4;
            vacio.appendChild(mensaje);
            tableBody.appendChild(vacio);
            return;
        }

        festividades.slice((currentPage - 1) * pageSize, currentPage * pageSize).forEach(function(festividad) {
            var fila = document.createElement("tr");
            fila.appendChild(crearCelda(festividad.fecha_clave.trim()));

            var nombre = document.createElement("td");
            var titulo = document.createElement("span");
            titulo.className = "festividad-cell-title";
            titulo.textContent = festividad.emoji + " " + festividad.titulo;
            var subtitulo = document.createElement("span");
            subtitulo.className = "festividad-cell-subtitle";
            subtitulo.textContent = festividad.subtitulo;
            nombre.append(titulo, subtitulo);
            fila.appendChild(nombre);

            fila.appendChild(crearCelda(festividad.tipo === "NACIONAL" ? "Nacional" : "Regional"));

            var acciones = document.createElement("td");
            var grupo = document.createElement("div");
            grupo.className = "festividad-actions";
            var editar = document.createElement("button");
            editar.className = "festividad-action";
            editar.type = "button";
            editar.title = "Editar festividad";
            editar.setAttribute("aria-label", "Editar " + festividad.titulo);
            editar.innerHTML = '<i class="fa-solid fa-pen"></i>';
            editar.addEventListener("click", function() {
                abrirFormulario(festividad);
            });
            var eliminar = document.createElement("button");
            eliminar.className = "festividad-action festividad-action-delete";
            eliminar.type = "button";
            eliminar.title = "Eliminar festividad";
            eliminar.setAttribute("aria-label", "Eliminar " + festividad.titulo);
            eliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
            eliminar.addEventListener("click", function() {
                eliminarFestividad(festividad);
            });
            grupo.append(editar, eliminar);
            acciones.appendChild(grupo);
            fila.appendChild(acciones);
            tableBody.appendChild(fila);
        });
    }

    function abrirFormulario(festividad) {
        limpiarError();
        form.reset();
        var existente = !!festividad;
        document.getElementById("festividadDialogTitle").textContent = existente ? "Editar festividad" : "Agregar festividad";
        saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar';
        form.elements.id.disabled = existente;
        form.elements.id.value = existente ? festividad.id_festividad : "";
        form.elements.fecha_clave.value = existente ? festividad.fecha_clave.trim() : "";
        form.elements.subtitulo.value = existente ? festividad.subtitulo : "";
        form.elements.titulo.value = existente ? festividad.titulo : "";
        form.elements.frase.value = existente ? festividad.frase : "";
        form.elements.emoji.value = existente ? festividad.emoji : "";
        form.elements.tipo.value = existente ? festividad.tipo : "REGIONAL";
        form.elements.color_1.value = existente ? festividad.color_1.trim() : "#009B3A";
        form.elements.color_2.value = existente ? festividad.color_2.trim() : "#FFCD00";
        form.elements.color_3.value = existente ? festividad.color_3.trim() : "#FFFFFF";
        form.elements.bg_card.value = existente ? festividad.bg_card.trim() : "#1e293b";
        form.elements.id_ciudad.value = existente && festividad.id_ciudad ? festividad.id_ciudad : "";
        form.dataset.idActual = existente ? festividad.id_festividad : "";
        window.TEUI.markClean(form);
        dialog.showModal();
    }

    async function eliminarFestividad(festividad) {
        if (!await window.TEUI.confirm({
            title: "Eliminar festividad",
            message: '¿Quieres eliminar "' + festividad.titulo + '"? Esta acción no se puede deshacer.',
            confirmText: "Sí, eliminar"
        })) return;
        limpiarError();
        try {
            await enviar({ action: "delete", id: festividad.id_festividad });
            await cargarFestividades();
            window.TEUI.toast("Festividad eliminada correctamente.");
        } catch (error) {
            mostrarError(error.message);
        }
    }

    async function enviar(payload) {
        var response = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken
            },
            body: JSON.stringify(payload)
        });
        return respuestaJson(response);
    }

    async function cargarFestividades() {
        var response = await fetch(endpoint + "?admin=1", { credentials: "include" });
        var data = await respuestaJson(response);
        csrfToken = data.csrf;
        festividades = data.data;
        renderizarFestividades();
    }

    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        limpiarError();
        if (!form.reportValidity()) return;
        saveButton.disabled = true;
        var editing = !!form.dataset.idActual;
        var values = new FormData(form);
        var festivalData = {
            id: form.elements.id.value.trim(),
            fecha_clave: values.get("fecha_clave").trim(),
            subtitulo: values.get("subtitulo").trim(),
            titulo: values.get("titulo").trim(),
            frase: values.get("frase").trim(),
            emoji: values.get("emoji").trim(),
            tipo: values.get("tipo"),
            color_1: values.get("color_1"),
            color_2: values.get("color_2"),
            color_3: values.get("color_3"),
            bg_card: values.get("bg_card"),
            id_ciudad: values.get("id_ciudad").trim()
        };
        try {
            await enviar({
                action: editing ? "update" : "create",
                id: form.dataset.idActual,
                festividad: festivalData
            });
            window.TEUI.markClean(form);
            cerrarDialogo(false);
            await cargarFestividades();
            window.TEUI.toast(editing ? "Festividad actualizada correctamente." : "Festividad guardada correctamente.");
        } catch (error) {
            mostrarError(error.message);
        } finally {
            saveButton.disabled = false;
        }
    });

    document.getElementById("btnAgregarFestividad").addEventListener("click", function() {
        abrirFormulario(null);
    });
    document.getElementById("agregarFestividadSidebar").addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("btnAgregarFestividad").click();
    });
    previousPageButton.addEventListener("click", function() {
        if (currentPage > 1) {
            currentPage -= 1;
            renderizarFestividades();
        }
    });
    nextPageButton.addEventListener("click", function() {
        if (currentPage < Math.ceil(festividades.length / pageSize)) {
            currentPage += 1;
            renderizarFestividades();
        }
    });
    async function cerrarFormulario() {
        if (await window.TEUI.confirmDiscard(form)) cerrarDialogo(true);
    }
    document.getElementById("btnCerrarDialogo").addEventListener("click", cerrarFormulario);
    document.getElementById("btnCancelarFestividad").addEventListener("click", cerrarFormulario);
    dialog.addEventListener("cancel", function(event) {
        event.preventDefault();
        cerrarFormulario();
    });

    document.getElementById("darkModeToggle").addEventListener("click", function() {
        var dark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", dark ? "dark" : "light");
        this.querySelector("i").className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    });
    var darkModeButton = document.getElementById("darkModeToggle");
    var savedTheme = localStorage.getItem("theme");
    var dark = savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark-mode", dark);
    darkModeButton.querySelector("i").className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";

    (function configurarSesion() {
        var storedSession = localStorage.getItem("te_session") || sessionStorage.getItem("te_session");
        var session = JSON.parse(storedSession || "null");
        if (!session || session.tipo !== "admin") {
            window.location.href = "../index.html";
            return;
        }
        localStorage.setItem("te_session", JSON.stringify(session));
        sessionStorage.removeItem("te_session");
        document.getElementById("sidebarAvatar").textContent = session.avatar || "AD";
        document.getElementById("sidebarNombre").textContent = session.nombre || "Administrador";

        var slot = document.getElementById("sessionWidgetSlot");
        var widget = document.createElement("div");
        widget.className = "session-widget";
        var trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "session-trigger";
        var avatar = document.createElement("div");
        avatar.className = "session-avatar";
        avatar.textContent = session.avatar || "AD";
        var info = document.createElement("div");
        info.className = "session-info";
        var name = document.createElement("span");
        name.className = "session-name";
        name.textContent = session.nombre || "Administrador";
        var role = document.createElement("span");
        role.className = "session-tipo";
        role.textContent = "Administrador";
        info.append(name, role);
        trigger.append(avatar, info);
        var chevron = document.createElement("i");
        chevron.className = "fa-solid fa-chevron-down session-chevron";
        trigger.appendChild(chevron);
        var dropdown = document.createElement("div");
        dropdown.className = "session-dropdown";
        [
            ["../index.html", "🏠", "Ir al sitio"],
            ["panel_admin.html", "🛡️", "Panel Admin"],
            ["perfil_admin.html", "👤", "Mi Perfil"],
            ["config_admin.html", "⚙️", "Configuración"],
            ["festividades_admin.html", "📅", "Festividades"]
        ].forEach(function(item) {
            var link = document.createElement("a");
            link.className = "session-menu-item";
            link.href = item[0];
            link.append(document.createTextNode(item[1] + " " + item[2]));
            dropdown.appendChild(link);
        });
        var logoutLink = document.createElement("a");
        logoutLink.className = "session-menu-item session-menu-danger";
        logoutLink.href = "#";
        logoutLink.append(document.createTextNode("🚪 Cerrar Sesión"));
        dropdown.appendChild(logoutLink);
        widget.append(trigger, dropdown);
        slot.appendChild(widget);
        trigger.addEventListener("click", function(event) {
            event.stopPropagation();
            var open = dropdown.classList.toggle("open");
            chevron.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
        });
        document.addEventListener("click", function() {
            dropdown.classList.remove("open");
            chevron.style.transform = "rotate(0deg)";
        });

        logoutLink.addEventListener("click", cerrarSesion);
    })();

    async function cerrarSesion(event) {
        event.preventDefault();
        await window.TEUI.logoutAdmin("../login/logout_admin.php", "../index.html");
    }

    document.getElementById("btnLogout").addEventListener("click", cerrarSesion);

    cargarFestividades().catch(function(error) {
        mostrarError(error.message);
        tableBody.replaceChildren();
    });
})();