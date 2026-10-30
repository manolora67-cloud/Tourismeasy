(function () {
    var dashboard = document.querySelector("[data-clicks-dashboard]");
    if (!dashboard) return;

    var endpoint = "../login/get_estadisticas_clicks.php";

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
                { key: "id_producto" },
                { key: "ciudad" },
                { key: "dispositivo" },
            ]
            : [
                { key: "fecha_hora", format: formatDate },
                { key: "producto" },
                { key: "ciudad" },
            ];
        showRows(
            dashboard.querySelector("[data-clicks-recent]"),
            data.recientes,
            recentColumns,
            "Aún no hay clics registrados."
        );

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

    function load() {
        var status = dashboard.querySelector("[data-clicks-status]");
        status.textContent = "Cargando estadísticas de clics…";
        fetch(endpoint, { credentials: "include" })
            .then(function (response) {
                return response.json().then(function (data) {
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || "No se pudieron cargar las estadísticas.");
                    }
                    return data;
                });
            })
            .then(render)
            .catch(function (error) {
                console.error("No se pudieron cargar las estadísticas de clics.", error);
                status.textContent = error.message || "No se pudieron cargar las estadísticas de clics.";
                status.setAttribute("role", "alert");
            });
    }

    load();
    var reloadButton = dashboard.querySelector("[data-clicks-reload]");
    if (reloadButton) reloadButton.addEventListener("click", load);
})();
