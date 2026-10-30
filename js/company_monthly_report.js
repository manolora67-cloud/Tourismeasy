(function () {
    var report = document.querySelector("[data-company-monthly-report]");
    if (!report) return;

    var monthInput = report.querySelector("#companyReportMonth");
    var generateButton = report.querySelector("[data-company-report-generate]");
    var status = report.querySelector("[data-company-report-status]");
    var endpoint = "../login/get_informe_mensual_empresa.php";

    function latestCompleteMonth() {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    function monthValue(date) {
        return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
    }

    var latestMonth = monthValue(latestCompleteMonth());
    monthInput.max = latestMonth;
    monthInput.value = latestMonth;

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            }[char];
        });
    }

    function formatMonth(value) {
        return new Date(value + "-02T12:00:00").toLocaleDateString("es-CO", {
            month: "long",
            year: "numeric",
        });
    }

    function variation(value) {
        if (value === null || value === undefined) return "Sin base de comparación";
        return (value > 0 ? "+" : "") + value + "%";
    }

    function publicationRows(items) {
        if (!Array.isArray(items) || !items.length) {
            return '<tr><td colspan="4">No se registraron clics a publicaciones este mes.</td></tr>';
        }

        return items.map(function (item, index) {
            return "<tr><td>" + (index + 1) + "</td><td>" + escapeHtml(item.publicacion) +
                "</td><td>" + escapeHtml(item.clics_mes) +
                "</td><td>" + escapeHtml(item.clics_totales) + "</td></tr>";
        }).join("");
    }

    function printReport(informe, printWindow) {
        var clicks = informe.clics_whatsapp || {};
        var top = Array.isArray(informe.publicaciones_mas_contactadas)
            ? informe.publicaciones_mas_contactadas[0]
            : null;
        var topName = top ? escapeHtml(top.publicacion) : "Sin publicaciones contactadas";
        var topMonthClicks = top ? escapeHtml(top.clics_mes) : "0";
        var topTotalClicks = top ? escapeHtml(top.clics_totales) : "0";

        printWindow.document.open();
        printWindow.document.write(
            '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Boletín TourismEasy · ' +
            escapeHtml(formatMonth(informe.mes)) + '</title><style>' +
            'body{font-family:Arial,sans-serif;color:#1e293b;margin:36px;font-size:12px;line-height:1.5}' +
            'header{border-bottom:3px solid #7c3aed;padding-bottom:16px;margin-bottom:24px}' +
            'h1{font-size:24px;margin:0 0 6px}h2{font-size:16px;margin:24px 0 10px;color:#5b21b6}' +
            '.muted{color:#64748b}.period{text-transform:capitalize}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}' +
            '.metric{border:1px solid #cbd5e1;border-radius:8px;padding:14px}.metric strong{display:block;font-size:20px;margin:5px 0}' +
            'table{width:100%;border-collapse:collapse;margin:8px 0 20px}th,td{text-align:left;padding:9px;border-bottom:1px solid #cbd5e1}' +
            'th{background:#f1f5f9}.note{margin-top:24px;padding:12px;border-left:3px solid #7c3aed;background:#f5f3ff}' +
            '.actions{margin-bottom:20px}.actions button{background:#7c3aed;color:white;border:0;border-radius:6px;padding:10px 16px;font-weight:bold;cursor:pointer}' +
            '@media print{body{margin:15mm}.actions{display:none}h2{break-after:avoid}table{break-inside:avoid}}' +
            '</style></head><body>' +
            '<div class="actions"><button onclick="window.print()">Guardar como PDF / Imprimir</button>' +
            '<span class="muted"> En el diálogo, selecciona «Guardar como PDF».</span></div>' +
            '<header><h1>TourismEasy · Boletín mensual</h1><div><strong>' +
            escapeHtml(informe.empresa) + '</strong></div><div class="period">' +
            escapeHtml(formatMonth(informe.mes)) + '</div><div class="muted">Comparado con ' +
            escapeHtml(formatMonth(informe.mes_anterior)) + '</div></header>' +
            '<h2>Resumen de contactos</h2><div class="grid">' +
            '<div class="metric">Clics de WhatsApp en el mes<strong>' + escapeHtml(clicks.mes || 0) +
            '</strong><span class="muted">Mes anterior: ' + escapeHtml(clicks.mes_anterior || 0) +
            ' · Variación: ' + escapeHtml(variation(clicks.variacion_porcentual)) + '</span></div>' +
            '<div class="metric">Publicación más contactada<strong>' + topName +
            '</strong><span class="muted">' + topMonthClicks + ' clics este mes · ' +
            topTotalClicks + ' clics acumulados</span></div></div>' +
            '<h2>Publicaciones más contactadas</h2><table><thead><tr><th>#</th><th>Publicación</th>' +
            '<th>Clics del mes</th><th>Clics acumulados</th></tr></thead><tbody>' +
            publicationRows(informe.publicaciones_mas_contactadas) + '</tbody></table>' +
            '<p class="note"><strong>Cómo leer esta métrica:</strong> se cuentan las veces que los visitantes iniciaron un contacto por WhatsApp desde una publicación. No representa vistas de página.</p>' +
            '<p class="muted">Fuente: registros transaccionales de TourismEasy (OLTP).</p>' +
            '</body></html>'
        );
        printWindow.document.close();
        window.setTimeout(function () {
            printWindow.focus();
            printWindow.print();
        }, 300);
    }

    function setStatus(message, state) {
        status.textContent = message;
        if (state) status.dataset.state = state;
        else delete status.dataset.state;
    }

    generateButton.addEventListener("click", function () {
        if (!monthInput.value) {
            setStatus("Selecciona un mes para continuar.", "error");
            monthInput.focus();
            return;
        }
        if (monthInput.value > latestMonth) {
            setStatus("Solo puedes generar boletines de meses completos.", "error");
            monthInput.focus();
            return;
        }

        var printWindow = window.open("", "_blank");
        if (!printWindow) {
            setStatus("Permite las ventanas emergentes para generar el boletín.", "error");
            return;
        }

        generateButton.disabled = true;
        setStatus("Estamos preparando tu boletín…", "loading");
        fetch(endpoint + "?mes=" + encodeURIComponent(monthInput.value), {
            credentials: "include",
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    if (!response.ok || !data.ok) {
                        throw new Error(data.error || "No se pudo generar el boletín.");
                    }
                    return data.informe;
                });
            })
            .then(function (informe) {
                printReport(informe, printWindow);
                setStatus("Boletín listo. Selecciona «Guardar como PDF» en el diálogo de impresión.", "success");
            })
            .catch(function (error) {
                printWindow.close();
                setStatus(error.message || "No se pudo generar el boletín.", "error");
            })
            .finally(function () {
                generateButton.disabled = false;
            });
    });
})();
