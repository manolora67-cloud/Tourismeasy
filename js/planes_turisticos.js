// ============================================================
// planes_turisticos.js — Lógica propia de la página Planes Turísticos
// (buscador/filtro, modal de detalles y carga dinámica desde el backend)
// ============================================================

// Arma el link de WhatsApp a partir de un teléfono (con o sin +57, espacios, guiones)
// y un mensaje precargado. Devuelve null si no hay teléfono válido.
function buildWhatsAppLink(telefono, mensaje) {
    var digits = (telefono || "").replace(/[^\d]/g, "");
    if (!digits) return null;
    if (digits.length === 10) digits = "57" + digits; // número colombiano sin indicativo
    return "https://wa.me/" + digits + (mensaje ? ("?text=" + encodeURIComponent(mensaje)) : "");
}

// Actualiza (o esconde) el botón de WhatsApp del modal según los datos del botón clickeado
function actualizarBotonWhatsApp(btn) {
    var waBtn = document.getElementById("plan-whatsapp");
    if (!waBtn) return;
    var telefono = btn.dataset.whatsapp || "";
    var mensaje = "Hola, vi el plan " + (btn.dataset.titulo || "") + " en TourismEasy y quisiera más información.";
    var link = buildWhatsAppLink(telefono, mensaje);
    waBtn.dataset.idProducto = btn.dataset.idProducto || "";
    waBtn.dataset.categoria = "Plan";
    if (link) {
        waBtn.href = link;
        waBtn.style.display = "";
    } else {
        waBtn.style.display = "none";
    }
}

// ── MODAL VER DETALLES DE PLAN TURÍSTICO ─────────────────────
(function () {
    var overlay = document.getElementById('plan-detalle-overlay');
    var cerrar = document.getElementById('plan-cerrar');

    document.querySelectorAll('.btn-ver-detalles').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var _s = btn.dataset.img || '';
            document.getElementById('plan-img').src = _s ? (_s.startsWith('http') || _s.startsWith('../') ? _s : '../' + _s) : '';
            document.getElementById('plan-titulo').textContent = btn.dataset.titulo || '';
            document.getElementById('plan-categoria').textContent = btn.dataset.categoria || '';
            document.getElementById('plan-ubicacion').textContent = btn.dataset.ubicacion || '';
            document.getElementById('plan-duracion').textContent = btn.dataset.duracion || '';
            document.getElementById('plan-incluye').textContent = btn.dataset.incluye || '';
            document.getElementById('plan-accesibilidad').textContent = btn.dataset.accesibilidad || '';
            document.getElementById('plan-precio').textContent = btn.dataset.precio || '';
            actualizarBotonWhatsApp(btn);
            overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        });
    });

    function cerrarModal() {
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    cerrar.addEventListener('click', cerrarModal);
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) cerrarModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') cerrarModal();
    });
})();

(function () {
    var grid = document.getElementById("planes-results-grid");
    if (!grid) return;
    var selectLugar = document.getElementById("filtro-lugar");
    var selectTipo = document.getElementById("filtro-tipo");
    var selectAccesibilidad = document.getElementById("filtro-accesibilidad");
    var searchStatus = document.getElementById("plan-search-status");
    var pagination = document.getElementById("plan-pagination");
    var pageSummary = document.getElementById("plan-page-summary");
    var previousPage = document.getElementById("plan-previous-page");
    var nextPage = document.getElementById("plan-next-page");
    var noResults = document.createElement("p");
    var currentPage = 1;
    var pageSize = 6;
    var requestId = 0;
    var filterOptionsLoaded = false;

    noResults.style.cssText = "grid-column:1/-1;text-align:center;color:#7c3aed;font-family:Montserrat,sans-serif;font-weight:700;font-size:1.1rem;padding:40px 0;";
    noResults.textContent = "No encontramos planes con esos filtros. ¡Intenta otra combinación!";

    function setSearchStatus(message, error) {
        searchStatus.textContent = message;
        searchStatus.classList.toggle("error", Boolean(error));
    }

    function populateFilterOptions(items) {
        var destinations = new Map();
        var types = new Map();
        items.forEach(function (item) {
            var cityId = String(item.id_ciudad || "").trim();
            var cityName = String(item.ciudad || "").trim();
            var typeId = String(item.id_tipo_plan || "").trim();
            var typeName = String(item.tipo_plan || "").trim();
            if (cityId && cityName) destinations.set(cityId, cityName);
            if (typeId && typeName) types.set(typeId, typeName);
        });

        Array.from(destinations.entries()).sort(function (a, b) {
            return a[1].localeCompare(b[1], "es");
        }).forEach(function (entry) {
            var option = document.createElement("option");
            option.value = entry[0];
            option.textContent = entry[1];
            selectLugar.appendChild(option);
        });

        Array.from(types.entries()).sort(function (a, b) {
            return a[1].localeCompare(b[1], "es");
        }).forEach(function (entry) {
            var option = document.createElement("option");
            option.value = entry[0];
            option.textContent = entry[1];
            selectTipo.appendChild(option);
        });

        Array.from(new Set(items.map(function (item) {
            return String(item.accesibilidad || "").trim();
        }).filter(Boolean))).sort(function (a, b) {
            return a.localeCompare(b, "es");
        }).forEach(function (accessibility) {
            var option = document.createElement("option");
            option.value = accessibility;
            option.textContent = accessibility;
            selectAccesibilidad.appendChild(option);
        });
    }

    function renderPage() {
        var cards = Array.from(grid.querySelectorAll(".card-item"));
        var totalPages = Math.ceil(cards.length / pageSize);
        currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));
        var start = (currentPage - 1) * pageSize;
        var end = Math.min(start + pageSize, cards.length);
        var visibleCards = new Set(cards.slice(start, end));
        cards.forEach(function (card) {
            card.hidden = !visibleCards.has(card);
        });

        if (!cards.length) {
            pagination.hidden = true;
            noResults.hidden = false;
            grid.appendChild(noResults);
            return;
        }

        noResults.remove();
        pageSummary.textContent = "Mostrando " + (start + 1) + "–" + end + " de " + cards.length +
            " planes · Página " + currentPage + " de " + totalPages;
        previousPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === totalPages;
        pagination.hidden = totalPages <= 1;
    }

    function searchPlans() {
        var params = new URLSearchParams();
        if (selectLugar.value) params.set("id_ciudad", selectLugar.value);
        if (selectTipo.value) params.set("id_tipo_plan", selectTipo.value);
        if (selectAccesibilidad.value) params.set("accesibilidad", selectAccesibilidad.value);

        var currentRequest = ++requestId;
        pagination.hidden = true;
        setSearchStatus("Buscando planes turísticos…");
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:12px">Buscando planes turísticos…</p></div>';

        fetch("../planes/buscar.php?" + params.toString(), { credentials: "include" })
            .then(function (response) {
                if (!response.ok) throw new Error("No se pudieron buscar los planes turísticos.");
                return response.json();
            })
            .then(function (result) {
                if (currentRequest !== requestId) return;
                if (!result.ok || !Array.isArray(result.data)) {
                    throw new Error(result.error || "El servidor devolvió una respuesta inválida.");
                }
                grid.innerHTML = "";
                if (!filterOptionsLoaded) {
                    populateFilterOptions(result.data);
                    filterOptionsLoaded = true;
                }
                result.data.forEach(renderCard);
                currentPage = 1;
                renderPage();
                setSearchStatus(result.data.length + (result.data.length === 1
                    ? " plan publicado."
                    : " planes publicados."));
            })
            .catch(function (error) {
                if (currentRequest !== requestId) return;
                grid.replaceChildren();
                pagination.hidden = true;
                setSearchStatus(error.message || "Error al buscar planes turísticos.", true);
            });
    }

    function renderCard(item) {
        var nombre = item.nombre || "Sin nombre";
        var precioDisplay = item.precio ? "$" + parseInt(item.precio).toLocaleString("es-CO") : "Consultar";
        var imgHtml = item.img_url ?
            '<img src="' + (item.img_url ? (item.img_url.startsWith("http") ? item.img_url : "../" + item.img_url) : "") + '" class="card-banner" alt="' + nombre + '">' :
            '<div class="card-banner" style="background:linear-gradient(135deg,#1e1b4b,#4c1d95);display:flex;align-items:center;justify-content:center;height:200px;"><i class="fa-solid fa-map-location-dot" style="font-size:3rem;color:#a855f7;"></i></div>';
        var card = document.createElement("article");
        card.className = "card-item card-item--empresa";
        card.setAttribute("data-lugar", (item.ciudad || "").toLowerCase());
        card.setAttribute("data-tipo", (item.tipo_plan || "").toLowerCase());
        card.innerHTML = imgHtml +
            '<div class="card-body">' +
            '<span class="card-tag" style="background:rgba(168,85,247,0.18);color:#a855f7;text-transform:uppercase;font-size:.75rem;font-weight:800;">' + (item.tipo_plan || "Plan") + '</span>' +
            '<h3>' + nombre + '</h3>' +
            '<p style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;line-height:1.6;flex-grow:1;margin-bottom:16px;">' +
            (item.descripcion || (item.ciudad || "") + " · " + (item.accesibilidad || "")) + '</p>' +
            '<div class="card-footer">' +
            '<span class="price">' + precioDisplay + '</span>' +
            '<button class="btn-reservar btn-ver-detalles btn-ver-detalles-emp-plan"' +
            ' data-titulo="' + nombre + '" data-categoria="' + (item.tipo_plan || "Plan turistico") + '"' +
            ' data-id-producto="' + (item.id || "") + '"' +
            ' data-ubicacion="' + (item.ciudad || "") + '" data-duracion="' + (item.duracion || "—") + '"' +
            ' data-incluye="' + (item.incluye || "—") + '" data-accesibilidad="' + (item.accesibilidad || "—") + '"' +
            ' data-precio="' + precioDisplay + '" data-empresa="' + (item.empresa || "") + '"' +
            ' data-whatsapp="' + (item.whatsapp || item.telefono || item.num_contacto_empresa || "") + '"' +
            ' data-img="' + (item.img_url || "") + '">Ver detalles</button>' +
            '</div></div>';
        card.querySelector(".btn-ver-detalles-emp-plan").addEventListener("click", function () {
            var btn = this;
            var overlay = document.getElementById("plan-detalle-overlay");
            var _s = btn.dataset.img || "";
            document.getElementById("plan-img").src = _s ? (_s.startsWith("http") || _s.startsWith("../") ? _s : "../" + _s) : "";
            document.getElementById("plan-titulo").textContent = btn.dataset.titulo || "";
            document.getElementById("plan-categoria").textContent = btn.dataset.categoria || "";
            document.getElementById("plan-ubicacion").textContent = btn.dataset.ubicacion || "";
            document.getElementById("plan-duracion").textContent = btn.dataset.duracion || "";
            document.getElementById("plan-incluye").textContent = btn.dataset.incluye || "";
            document.getElementById("plan-accesibilidad").textContent = btn.dataset.accesibilidad || "";
            document.getElementById("plan-precio").textContent = btn.dataset.precio || "";
            actualizarBotonWhatsApp(btn);
            overlay.removeAttribute("aria-hidden");
            overlay.classList.add("visible");
            document.body.style.overflow = "hidden";
        });
        grid.appendChild(card);
    }

    document.getElementById("btn-explorar").addEventListener("click", function () {
        searchPlans();
    });
    document.getElementById("btn-limpiar-planes").addEventListener("click", function () {
        selectLugar.value = "";
        selectTipo.value = "";
        selectAccesibilidad.value = "";
        searchPlans();
    });
    [selectLugar, selectTipo, selectAccesibilidad].forEach(function (select) {
        select.addEventListener("change", function () {
            searchPlans();
        });
    });
    previousPage.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    });
    nextPage.addEventListener("click", function () {
        currentPage++;
        renderPage();
    });

    searchPlans();
})();
