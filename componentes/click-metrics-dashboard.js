(function () {
    "use strict";

    function element(tagName, className, text) {
        var node = document.createElement(tagName);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function createTable(headers, bodyAttribute) {
        var wrapper = element("div", "panel-table-wrap");
        var table = element("table", "panel-table");
        var head = document.createElement("thead");
        var headerRow = document.createElement("tr");
        headers.forEach(function (header) {
            var cell = element("th", "", header.label);
            if (header.attribute) cell.setAttribute(header.attribute, "");
            headerRow.appendChild(cell);
        });
        head.appendChild(headerRow);

        var body = document.createElement("tbody");
        body.setAttribute(bodyAttribute, "");
        table.append(head, body);
        wrapper.appendChild(table);
        return wrapper;
    }

    document.querySelectorAll("[data-clicks-dashboard-template]").forEach(function (dashboard) {
        var heading = element("div", "click-metrics__heading");
        var headingContent = document.createElement("div");
        var title = element("h2", "", dashboard.dataset.title || "Contactos por WhatsApp");
        var icon = element("i", "fa-brands fa-whatsapp");
        icon.setAttribute("aria-hidden", "true");
        title.prepend(icon, document.createTextNode(" "));
        headingContent.append(
            title,
            element("p", "", dashboard.dataset.description || "Solo se muestran los clics de tus productos y servicios.")
        );
        var reload = element("button", "click-metrics__reload");
        var reloadIcon = element("i", "fa-solid fa-rotate");
        reloadIcon.setAttribute("aria-hidden", "true");
        reload.append(reloadIcon, document.createTextNode(" Actualizar"));
        reload.type = "button";
        reload.setAttribute("data-clicks-reload", "");
        heading.append(headingContent, reload);

        var summary = element("div", "click-metrics__summary");
        var summaryCard = element("div", "click-metrics__card");
        summaryCard.append(
            element("span", "", "Últimos 30 días"),
            element("strong", "", "Cargando…")
        );
        summaryCard.lastElementChild.setAttribute("data-clicks-30-days", "");
        summary.appendChild(summaryCard);

        var status = element("p", "click-metrics__status", "Cargando estadísticas…");
        status.setAttribute("data-clicks-status", "");
        status.setAttribute("aria-live", "polite");

        var breakdown = element("div", "click-metrics__block");
        breakdown.append(
            element("h3", "", "Clics por producto"),
            createTable([
                { label: "Producto", attribute: "data-clicks-breakdown-column" },
                { label: "Clics" }
            ], "data-clicks-categories")
        );
        breakdown.querySelector("h3").setAttribute("data-clicks-breakdown-heading", "");

        var recent = element("div", "click-metrics__block");
        recent.append(
            element("h3", "", "Últimos clics"),
            createTable([
                { label: "Fecha" },
                { label: dashboard.dataset.recentItemLabel || "Producto", attribute: "data-clicks-recent-item-column" },
                { label: "Dispositivo" }
            ], "data-clicks-recent")
        );

        dashboard.replaceChildren(heading, summary, status, breakdown, recent);
    });
})();
