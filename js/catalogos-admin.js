(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("catalogoForm");
        var table = document.getElementById("catalogosTabla");
        var status = document.getElementById("catalogosEstado");
        var identifierTitle = document.getElementById("catalogoIdentificadorTitulo");
        if (!form || !table || !status || !identifierTitle) return;

        var API_URL = "../admin/catalogos.php?admin=1";
        var csrfToken = "";
        var catalogData = null;
        var editing = null;
        var typeSelect = document.getElementById("catalogoTipo");
        var nameInput = document.getElementById("catalogoNombre");
        var idInput = document.getElementById("catalogoId");
        var saveButton = document.getElementById("catalogoGuardar");
        var cancelButton = document.getElementById("catalogoCancelar");
        var labels = {
            tipos_plan: "Tipos de plan turístico",
            tipos_hospedaje: "Tipos de hospedaje",
            categorias_artesania: "Categorías artesanales",
            servicios_hospedaje: "Servicios de hospedaje",
            clases_transporte: "Clases de transporte"
        };

        function setStatus(message, isError) {
            status.textContent = message;
            status.classList.toggle("is-error", Boolean(isError));
        }

        function resetForm() {
            editing = null;
            form.reset();
            idInput.value = "";
            typeSelect.disabled = false;
            cancelButton.hidden = true;
            saveButton.innerHTML = '<i class="fa-solid fa-plus"></i> Agregar';
        }

        function addCell(row, value) {
            var cell = document.createElement("td");
            cell.textContent = value == null ? "" : String(value);
            row.appendChild(cell);
            return cell;
        }

        function render() {
            if (!catalogData) return;
            var type = typeSelect.value;
            identifierTitle.textContent = type === "categorias_artesania" ? "Código" : "ID";
            var items = Array.isArray(catalogData[type]) ? catalogData[type] : [];
            items = items.slice().sort(function (a, b) {
                return String(a.nombre).localeCompare(String(b.nombre), "es");
            });

            table.replaceChildren();
            if (!items.length) {
                var empty = document.createElement("tr");
                var emptyCell = addCell(empty, "No hay opciones registradas en este catálogo.");
                emptyCell.colSpan = 4;
                emptyCell.className = "catalog-empty";
                table.appendChild(empty);
                return;
            }

            items.forEach(function (item) {
                var row = document.createElement("tr");
                addCell(row, item.codigo || item.id);
                addCell(row, item.nombre);

                var stateCell = document.createElement("td");
                var badge = document.createElement("span");
                badge.className = item.activo ? "status-badge status-badge--active" : "status-badge status-badge--inactive";
                badge.textContent = item.activo ? "Activo" : "Inactivo";
                stateCell.appendChild(badge);
                row.appendChild(stateCell);

                var actionsCell = document.createElement("td");
                var actions = document.createElement("div");
                actions.className = "table-actions";
                var edit = document.createElement("button");
                edit.type = "button";
                edit.className = "catalog-action";
                edit.textContent = "Editar";
                edit.addEventListener("click", function () {
                    editing = { type: type, item: item };
                    typeSelect.disabled = true;
                    idInput.value = item.id;
                    nameInput.value = item.nombre;
                    cancelButton.hidden = false;
                    saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar';
                    nameInput.focus();
                    form.scrollIntoView({ behavior: "smooth", block: "center" });
                });

                var toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = "catalog-action";
                toggle.textContent = item.activo ? "Desactivar" : "Activar";
                toggle.addEventListener("click", function () {
                    guardar({
                        tipo: type,
                        accion: "toggle",
                        id: item.id,
                        activo: !item.activo
                    });
                });
                actions.append(edit, toggle);
                actionsCell.appendChild(actions);
                row.appendChild(actionsCell);
                table.appendChild(row);
            });
        }

        async function cargar() {
            setStatus("Cargando catálogos…", false);
            try {
                var response = await fetch(API_URL, { credentials: "include", cache: "no-store" });
                var result = await response.json();
                if (!response.ok || !result.ok || !result.data) {
                    throw new Error(result.error || "No se pudieron cargar los catálogos.");
                }
                csrfToken = result.csrf;
                catalogData = result.data;
                render();
                setStatus("Mostrando solo las opciones de " + labels[typeSelect.value] + ".", false);
            } catch (error) {
                console.error("Error cargando catálogos:", error);
                setStatus(error.message || "No se pudieron cargar los catálogos.", true);
                table.replaceChildren();
                var row = document.createElement("tr");
                var cell = addCell(row, "No se pudieron cargar los catálogos.");
                cell.colSpan = 4;
                table.appendChild(row);
            }
        }

        async function guardar(payload) {
            saveButton.disabled = true;
            try {
                var response = await fetch(API_URL, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken
                    },
                    body: JSON.stringify(payload)
                });
                var result = await response.json();
                if (!response.ok || !result.ok) {
                    throw new Error(result.error || "No se pudo guardar el catálogo.");
                }
                if (payload.accion !== "toggle") resetForm();
                await cargar();
                setStatus("El catálogo se guardó correctamente.", false);
            } catch (error) {
                console.error("Error guardando catálogo:", error);
                setStatus(error.message || "No se pudo guardar el catálogo.", true);
            } finally {
                saveButton.disabled = false;
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            guardar({
                tipo: editing ? editing.type : typeSelect.value,
                accion: editing ? "update" : "create",
                id: editing ? editing.item.id : null,
                nombre: nameInput.value.trim()
            });
        });

        typeSelect.addEventListener("change", function () {
            resetForm();
            render();
            setStatus("Mostrando solo las opciones de " + labels[typeSelect.value] + ".", false);
        });
        cancelButton.addEventListener("click", resetForm);
        cargar();
    });
})();
