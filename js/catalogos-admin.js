(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("catalogoForm");
        var table = document.getElementById("catalogosTabla");
        var status = document.getElementById("catalogosEstado");
        if (!form || !table || !status) return;

        var API_URL = "../admin/catalogos.php?admin=1";
        var csrfToken = "";
        var editing = null;
        var typeSelect = document.getElementById("catalogoTipo");
        var codeField = document.getElementById("catalogoCodigoField");
        var codeInput = document.getElementById("catalogoCodigo");
        var nameInput = document.getElementById("catalogoNombre");
        var idInput = document.getElementById("catalogoId");
        var saveButton = document.getElementById("catalogoGuardar");
        var cancelButton = document.getElementById("catalogoCancelar");
        var labels = {
            tipos_plan: "Tipos de plan",
            tipos_hospedaje: "Tipos de hospedaje",
            categorias_artesania: "Categorías artesanales",
            servicios_hospedaje: "Servicios de hospedaje",
            clases_transporte: "Clases de transporte"
        };

        function setStatus(message, isError) {
            status.textContent = message;
            status.classList.toggle("is-error", Boolean(isError));
        }

        function syncFormType() {
            var isCategory = typeSelect.value === "categorias_artesania" && !editing;
            codeField.hidden = !isCategory;
            codeInput.required = isCategory;
        }

        function resetForm() {
            editing = null;
            form.reset();
            idInput.value = "";
            typeSelect.disabled = false;
            cancelButton.hidden = true;
            saveButton.innerHTML = '<i class="fa-solid fa-plus"></i> Agregar';
            syncFormType();
        }

        function addCell(row, value) {
            var cell = document.createElement("td");
            cell.textContent = value == null ? "" : String(value);
            row.appendChild(cell);
            return cell;
        }

        function render(data) {
            var rows = [];
            Object.keys(labels).forEach(function (type) {
                (Array.isArray(data[type]) ? data[type] : []).forEach(function (item) {
                    rows.push({ type: type, item: item });
                });
            });
            rows.sort(function (a, b) {
                return labels[a.type].localeCompare(labels[b.type], "es") ||
                    String(a.item.nombre).localeCompare(String(b.item.nombre), "es");
            });

            table.replaceChildren();
            if (!rows.length) {
                var empty = document.createElement("tr");
                var emptyCell = addCell(empty, "No hay opciones registradas.");
                emptyCell.colSpan = 5;
                emptyCell.className = "catalog-empty";
                table.appendChild(empty);
                return;
            }

            rows.forEach(function (entry) {
                var item = entry.item;
                var row = document.createElement("tr");
                addCell(row, labels[entry.type]);
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
                    editing = { type: entry.type, item: item };
                    typeSelect.value = entry.type;
                    typeSelect.disabled = true;
                    idInput.value = item.id;
                    nameInput.value = item.nombre;
                    codeInput.value = item.codigo || "";
                    cancelButton.hidden = false;
                    saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar';
                    syncFormType();
                    nameInput.focus();
                    form.scrollIntoView({ behavior: "smooth", block: "center" });
                });
                var toggle = document.createElement("button");
                toggle.type = "button";
                toggle.className = "catalog-action";
                toggle.textContent = item.activo ? "Desactivar" : "Activar";
                toggle.addEventListener("click", function () {
                    guardar({
                        tipo: entry.type,
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
                render(result.data);
                setStatus("Puedes agregar, editar o desactivar opciones. Los registros existentes no se eliminan.", false);
            } catch (error) {
                console.error("Error cargando catálogos:", error);
                setStatus(error.message || "No se pudieron cargar los catálogos.", true);
                table.replaceChildren();
                var row = document.createElement("tr");
                var cell = addCell(row, "No se pudieron cargar los catálogos.");
                cell.colSpan = 5;
                table.appendChild(row);
            }
        }

        async function guardar(payload) {
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
                setStatus("El catálogo se guardó correctamente.", false);
                await cargar();
            } catch (error) {
                console.error("Error guardando catálogo:", error);
                setStatus(error.message || "No se pudo guardar el catálogo.", true);
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var payload = {
                tipo: editing ? editing.type : typeSelect.value,
                accion: editing ? "update" : "create",
                id: editing ? editing.item.id : null,
                codigo: !editing && typeSelect.value === "categorias_artesania" ? codeInput.value.trim() : null,
                nombre: nameInput.value.trim()
            };
            guardar(payload);
        });

        typeSelect.addEventListener("change", syncFormType);
        cancelButton.addEventListener("click", resetForm);
        syncFormType();
        cargar();
    });
})();
