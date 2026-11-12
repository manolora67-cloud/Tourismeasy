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
    var imageFileInput = document.getElementById("festividadImagenArchivo");
    var imagePreview = document.getElementById("festividadImagenVistaPrevia");
    var imageStatus = document.getElementById("festividadImagenEstado");
    var removeImageButton = document.getElementById("festividadImagenQuitar");
    var ciudadSelect = form.elements.id_ciudad;
    var ciudades = [];
    var ciudadesPromise;
    var imagenSubiendo = false;
    var categorias = {
        PAISAJES: "Paisajes",
        PATRIMONIO: "Patrimonio",
        MUSICA: "Música",
        TRADICION: "Tradición"
    };
    var pageSize = 10;
    var currentPage = 1;

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

    function actualizarVistaPreviaImagen(url) {
        imagePreview.hidden = !url;
        if (url) {
            imagePreview.src = url;
            removeImageButton.hidden = false;
        } else {
            imagePreview.removeAttribute("src");
            removeImageButton.hidden = true;
        }
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

    async function cargarCiudades() {
        var response = await fetch("../datos_referencia.php?tipo=ciudades", {
            credentials: "include",
            cache: "no-store"
        });
        var data = await respuestaJson(response);
        if (!data.data || !Array.isArray(data.data.ciudades)) {
            throw new Error("No se recibió la lista de municipios.");
        }

        ciudades = data.data.ciudades;
        var municipiosSantander = ciudades.filter(function(ciudad) {
            return String(ciudad.id).startsWith("68");
        });
        if (!municipiosSantander.length) {
            throw new Error("No hay municipios de Santander disponibles.");
        }
        ciudadSelect.replaceChildren(new Option("Sin municipio asociado", ""));
        municipiosSantander.forEach(function(ciudad) {
            ciudadSelect.add(new Option(ciudad.nombre, String(ciudad.id).trim()));
        });
    }

    function nombreCiudad(festividad) {
        if (festividad.tipo === "NACIONAL") return "Nacional";
        var idCiudad = String(festividad.id_ciudad || "").trim();
        if (!idCiudad) return "Sin municipio asociado";
        var ciudad = ciudades.find(function(item) {
            return String(item.id).trim() === idCiudad;
        });
        return ciudad ? ciudad.nombre : "Municipio no disponible";
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
        if (!festividades.length) {
            var vacio = document.createElement("tr");
            var mensaje = crearCelda("Todavía no hay festividades registradas.", "festividades-empty");
            mensaje.colSpan = 6;
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
            fila.appendChild(crearCelda(categorias[festividad.categoria] || "Tradición"));
            fila.appendChild(crearCelda(nombreCiudad(festividad)));

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

    async function abrirFormulario(festividad) {
        var ciudadesCargadas = await ciudadesPromise;
        if (!ciudadesCargadas) {
            mostrarError("No se pueden editar festividades sin cargar la lista de municipios.");
            return;
        }
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
        form.elements.categoria.value = existente ? (festividad.categoria || "TRADICION") : "TRADICION";
        form.elements.img_url.value = existente ? String(festividad.img_url || "").trim() : "";
        form.elements.color_1.value = existente ? festividad.color_1.trim() : "#009B3A";
        form.elements.color_2.value = existente ? festividad.color_2.trim() : "#FFCD00";
        form.elements.color_3.value = existente ? festividad.color_3.trim() : "#FFFFFF";
        form.elements.bg_card.value = existente ? festividad.bg_card.trim() : "#1e293b";
        var idCiudad = existente ? String(festividad.id_ciudad || "").trim() : "";
        if (idCiudad && !Array.from(ciudadSelect.options).some(function(option) {
            return option.value === idCiudad;
        })) {
            var ciudadExistente = ciudades.find(function(ciudad) {
                return String(ciudad.id).trim() === idCiudad;
            });
            ciudadSelect.add(new Option(
                ciudadExistente ? ciudadExistente.nombre : "Municipio asociado (" + idCiudad + ")",
                idCiudad
            ));
        }
        ciudadSelect.value = idCiudad;
        imageFileInput.value = "";
        imageStatus.textContent = "";
        actualizarVistaPreviaImagen(form.elements.img_url.value);
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
        if (ciudadesPromise) await ciudadesPromise;
        var response = await fetch(endpoint + "?admin=1", { credentials: "include" });
        var data = await respuestaJson(response);
        csrfToken = data.csrf;
        festividades = data.data;
        renderizarFestividades();
    }

    async function subirImagenFestividad(event) {
        var file = event.target.files && event.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            imageStatus.textContent = "La imagen no puede superar 5 MB.";
            imageFileInput.value = "";
            return;
        }

        imagenSubiendo = true;
        saveButton.disabled = true;
        imageFileInput.disabled = true;
        removeImageButton.disabled = true;
        imageStatus.textContent = "Subiendo imagen a Cloudinary…";
        try {
            var body = new FormData();
            body.append("imagen", file);
            var response = await fetch("../subir_imagen.php", {
                method: "POST",
                credentials: "include",
                headers: {
                    "X-CSRF-Token": csrfToken,
                    "X-Upload-Type": "festividad"
                },
                body: body
            });
            var result = await respuestaJson(response);
            form.elements.img_url.value = result.url;
            form.elements.img_url.dispatchEvent(new Event("input", { bubbles: true }));
            actualizarVistaPreviaImagen(result.url);
            imageStatus.textContent = "Imagen cargada. Guarda la festividad para asociarla.";
        } catch (error) {
            imageStatus.textContent = error.message;
        } finally {
            imagenSubiendo = false;
            saveButton.disabled = false;
            imageFileInput.disabled = false;
            removeImageButton.disabled = false;
            imageFileInput.value = "";
        }
    }

    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        limpiarError();
        if (imagenSubiendo) {
            mostrarError("Espera a que termine la carga de la imagen.");
            return;
        }
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
            categoria: values.get("categoria"),
            img_url: values.get("img_url").trim(),
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
    imageFileInput.addEventListener("change", subirImagenFestividad);
    removeImageButton.addEventListener("click", function() {
        form.elements.img_url.value = "";
        form.elements.img_url.dispatchEvent(new Event("input", { bubbles: true }));
        imageFileInput.value = "";
        actualizarVistaPreviaImagen("");
        imageStatus.textContent = "La imagen se quitará al guardar.";
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

    async function cerrarSesion(event) {
        event.preventDefault();
        await window.TEUI.logoutAdmin("../login/logout_admin.php", "../index.html");
    }

    document.getElementById("btnLogout").addEventListener("click", cerrarSesion);

    ciudadesPromise = cargarCiudades().then(function() {
        return true;
    }).catch(function(error) {
        ciudadSelect.replaceChildren(new Option("No se pudieron cargar municipios", ""));
        ciudadSelect.disabled = true;
        mostrarError("No se pudo cargar la lista de municipios.");
        console.error("[TourismEasy] No se pudieron cargar los municipios para festividades.", error);
        return false;
    });

    cargarFestividades().catch(function(error) {
        mostrarError(error.message);
        tableBody.replaceChildren();
    });
})();