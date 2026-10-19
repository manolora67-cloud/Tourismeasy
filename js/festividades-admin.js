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

    function renderizarFestividades() {
        tableBody.replaceChildren();
        if (!festividades.length) {
            var vacio = document.createElement("tr");
            var mensaje = crearCelda("Todavía no hay festividades registradas.", "festividades-empty");
            mensaje.colSpan = 4;
            vacio.appendChild(mensaje);
            tableBody.appendChild(vacio);
            return;
        }

        festividades.forEach(function(festividad) {
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
        dialog.showModal();
    }

    async function eliminarFestividad(festividad) {
        if (!window.confirm('¿Eliminar "' + festividad.titulo + '"? Esta acción no se puede deshacer.')) return;
        limpiarError();
        try {
            await enviar({ action: "delete", id: festividad.id_festividad });
            await cargarFestividades();
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
            dialog.close();
            await cargarFestividades();
        } catch (error) {
            mostrarError(error.message);
        } finally {
            saveButton.disabled = false;
        }
    });

    document.getElementById("btnAgregarFestividad").addEventListener("click", function() {
        abrirFormulario(null);
    });
    document.getElementById("btnCerrarDialogo").addEventListener("click", function() {
        dialog.close();
    });
    document.getElementById("btnCancelarFestividad").addEventListener("click", function() {
        dialog.close();
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
            ["panel_admin.html", "fa-shield-halved", "Panel Admin"],
            ["perfil_admin.html", "fa-user", "Mi Perfil"],
            ["config_admin.html", "fa-gear", "Configuración"],
            ["festividades_admin.html", "fa-calendar-days", "Festividades"]
        ].forEach(function(item) {
            var link = document.createElement("a");
            link.className = "session-menu-item";
            link.href = item[0];
            var icon = document.createElement("i");
            icon.className = "fa-solid " + item[1];
            link.append(icon, document.createTextNode(" " + item[2]));
            dropdown.appendChild(link);
        });
        var logoutLink = document.createElement("a");
        logoutLink.className = "session-menu-item session-menu-danger";
        logoutLink.href = "#";
        var logoutIcon = document.createElement("i");
        logoutIcon.className = "fa-solid fa-right-from-bracket";
        logoutLink.append(logoutIcon, document.createTextNode(" Cerrar Sesión"));
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
        try {
            const response = await fetch("../login/logout_admin.php", {
                method: "POST",
                credentials: "include"
            });
            const result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(result.error || "No se pudo cerrar la sesión.");
            }
            sessionStorage.removeItem("te_session");
            localStorage.removeItem("te_session");
            window.location.href = "../index.html";
        } catch (error) {
            console.warn("No se pudo confirmar el cierre de sesión en el servidor.", error);
            alert(error.message || "No se pudo cerrar la sesión. Intenta de nuevo.");
        }
    }

    document.getElementById("btnLogout").addEventListener("click", cerrarSesion);

    cargarFestividades().catch(function(error) {
        mostrarError(error.message);
        tableBody.replaceChildren();
    });
})();