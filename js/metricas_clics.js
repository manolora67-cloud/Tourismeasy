(function () {
    var dashboard = document.querySelector("[data-clicks-dashboard]");
    if (!dashboard) return;

    var endpoint = "../login/get_estadisticas_clicks.php";
    var paginaActual = 1;
    var paginasTotales = 1;
    var solicitudActual = 0;
    var recientesBody = dashboard.querySelector("[data-clicks-recent]");
    var recentBlock = recientesBody.closest(".click-metrics__block");
    var paginacion = document.createElement("nav");
    paginacion.className = "click-metrics__pagination";
    paginacion.setAttribute("aria-label", "Paginación de clics registrados");
    paginacion.hidden = true;

    var anterior = document.createElement("button");
    anterior.type = "button";
    anterior.textContent = "Anterior";
    var resumenPagina = document.createElement("span");
    resumenPagina.setAttribute("aria-live", "polite");
    var siguiente = document.createElement("button");
    siguiente.type = "button";
    siguiente.textContent = "Siguiente";
    paginacion.append(anterior, resumenPagina, siguiente);
    recentBlock.appendChild(paginacion);

    function appendCell(row, value) {
        var cell = document.createElement("td");
        cell.textContent = value == null || value === "" ? "—" : String(value);
        row.appendChild(cell);
    }

    function showRows(tbody, rows, columns, emptyMessage) {
        tbody.replaceChildren();
        if (!rows.length) {
            var row = document.createElement("tr");
            var cell = document.createElement("td");
            cell.colSpan = columns.length;
            cell.className = "click-metrics__empty";
            cell.textContent = emptyMessage;
            row.appendChild(cell);
            tbody.appendChild(row);
            return;
        }

        rows.forEach(function (item) {
            var row = document.createElement("tr");
            columns.forEach(function (column) {
                var value = item[column.key];
                if (column.format) value = column.format(value);
                appendCell(row, value);
            });
            tbody.appendChild(row);
        });
    }

    function formatDate(value) {
        if (!value) return "—";
        var date = new Date(value);
        return Number.isNaN(date.getTime())
            ? String(value)
            : date.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
    }

    function render(data) {
        document.querySelector("[data-clicks-total]").textContent =
            Number(data.resumen.total).toLocaleString("es-CO");
        dashboard.querySelector("[data-clicks-30-days]").textContent =
            Number(data.resumen.ultimos_30_dias).toLocaleString("es-CO");

        var isAdmin = data.rol === "admin";
        var breakdownHeading = dashboard.querySelector("[data-clicks-breakdown-heading]");
        if (breakdownHeading) {
            breakdownHeading.textContent = isAdmin ? "Clics por categoría" : "Clics por producto";
        }
        var breakdownColumn = dashboard.querySelector("[data-clicks-breakdown-column]");
        if (breakdownColumn) {
            breakdownColumn.textContent = isAdmin ? "Categoría" : "Producto";
        }
        showRows(
            dashboard.querySelector("[data-clicks-categories]"),
            isAdmin ? data.por_categoria : data.por_producto,
            [
                { key: isAdmin ? "categoria" : "producto" },
                { key: "cantidad", format: function (value) { return Number(value).toLocaleString("es-CO"); } },
            ],
            "Aún no hay clics registrados."
        );
        var recentColumns = isAdmin
            ? [
                { key: "fecha_hora", format: formatDate },
                { key: "empresa" },
                { key: "categoria" },
                { key: "producto" },
                { key: "dispositivo" },
            ]
            : [
                { key: "fecha_hora", format: formatDate },
                { key: "producto" },
                { key: "dispositivo" },
            ];
        showRows(
            recientesBody,
            data.recientes,
            recentColumns,
            "Aún no hay clics registrados."
        );
        paginaActual = data.pagina;
        paginasTotales = Math.max(1, Math.ceil(data.total / data.por_pagina));
        paginacion.hidden = paginasTotales <= 1;
        anterior.disabled = paginaActual <= 1;
        siguiente.disabled = paginaActual >= paginasTotales;
        resumenPagina.textContent = data.total
            ? "Mostrando " + ((paginaActual - 1) * data.por_pagina + 1) + "–" +
                Math.min(paginaActual * data.por_pagina, data.total) + " de " +
                data.total.toLocaleString("es-CO") + " clics · Página " +
                paginaActual + " de " + paginasTotales
            : "No hay clics registrados.";

        var businessSection = dashboard.querySelector("[data-clicks-business-section]");
        if (businessSection) {
            businessSection.hidden = data.rol !== "admin";
            showRows(
                businessSection.querySelector("[data-clicks-business]"),
                data.por_empresa,
                [
                    { key: "empresa" },
                    { key: "cantidad", format: function (value) { return Number(value).toLocaleString("es-CO"); } },
                ],
                "Aún no hay clics asociados a empresas."
            );
        }

        var status = dashboard.querySelector("[data-clicks-status]");
        status.textContent = "";
        status.removeAttribute("role");
    }

    function load(page) {
        var requestId = ++solicitudActual;
        var requestedPage = page || 1;
        var status = dashboard.querySelector("[data-clicks-status]");
        var total = document.querySelector("[data-clicks-total]");
        var last30Days = dashboard.querySelector("[data-clicks-30-days]");
        if (total && paginaActual === 1) total.textContent = "Cargando…";
        if (last30Days && paginaActual === 1) last30Days.textContent = "Cargando…";
        status.textContent = "Cargando estadísticas de clics…";
        status.removeAttribute("role");
        paginacion.querySelectorAll("button").forEach(function (button) {
            button.disabled = true;
        });
        var loadingRow = document.createElement("tr");
        var loadingCell = document.createElement("td");
        loadingCell.colSpan = recientesBody.closest("table").tHead.rows[0].cells.length;
        loadingCell.className = "click-metrics__empty";
        loadingCell.textContent = "Cargando clics…";
        loadingRow.appendChild(loadingCell);
        recientesBody.replaceChildren(loadingRow);

        fetch(endpoint + "?pagina=" + encodeURIComponent(requestedPage), {
            credentials: "include",
            cache: "no-store"
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || "No se pudieron cargar las estadísticas.");
                    }
                    return data;
                });
            })
            .then(function (data) {
                if (requestId !== solicitudActual) return;
                render(data);
            })
            .catch(function (error) {
                if (requestId !== solicitudActual) return;
                console.error("No se pudieron cargar las estadísticas de clics.", error);
                if (total) total.textContent = "No disponible";
                if (last30Days) last30Days.textContent = "No disponible";
                recientesBody.replaceChildren();
                paginacion.hidden = true;
                status.textContent = error.message || "No se pudieron cargar las estadísticas de clics.";
                status.setAttribute("role", "alert");
            });
    }

    anterior.addEventListener("click", function () {
        if (paginaActual > 1) load(paginaActual - 1);
    });
    siguiente.addEventListener("click", function () {
        if (paginaActual < paginasTotales) load(paginaActual + 1);
    });

    load(1);
    var reloadButton = dashboard.querySelector("[data-clicks-reload]");
    if (reloadButton) reloadButton.addEventListener("click", function () {
        load(paginaActual);
    });
})();
