// ============================================================
// hospedaje.js — Lógica propia de la página Hospedaje
// (modal de detalles, buscador/filtro y carga dinámica desde el backend)
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
    var waBtn = document.getElementById("hosp-whatsapp");
    if (!waBtn) return;
    var telefono = btn.dataset.whatsapp || "";
    var mensaje = "Hola, vi " + (btn.dataset.titulo || "este hospedaje") + " en TourismEasy y quisiera más información.";
    var link = buildWhatsAppLink(telefono, mensaje);
    if (link) {
        waBtn.href = link;
        waBtn.style.display = "";
    } else {
        waBtn.style.display = "none";
    }
}

// ── MODAL VER DETALLES DE HOSPEDAJE ──────────────────────────
(function() {
    var overlay = document.getElementById('hosp-detalle-overlay');
    var cerrar = document.getElementById('hosp-cerrar');

    document.querySelectorAll('.btn-ver-detalles').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var _s = btn.dataset.img || '';
            document.getElementById('hosp-img').src = _s ? (_s.startsWith('http') || _s.startsWith('../') ? _s : '../' + _s) : '';
            document.getElementById('hosp-titulo').textContent = btn.dataset.titulo || '';
            document.getElementById('hosp-tipo').textContent = btn.dataset.tipo || '';
            document.getElementById('hosp-ubicacion').textContent = btn.dataset.ubicacion || '';
            document.getElementById('hosp-capacidad').textContent = btn.dataset.capacidad || '';
            document.getElementById('hosp-servicios').textContent = btn.dataset.servicios || '';
            document.getElementById('hosp-accesibilidad').textContent = btn.dataset.accesibilidad || '';
            document.getElementById('hosp-precio').textContent = btn.dataset.precio || '';
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
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) cerrarModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') cerrarModal();
    });
})();

// ── HOSPEDAJES DINÁMICOS DESDE PANEL EMPRESA ─────────────────────────
(function() {
    var grid = document.getElementById("results-grid");
    if (!grid) return;
    var inputDestino = document.getElementById("input-destino");
    var inputAccesibilidad = document.getElementById("input-accesibilidad");
    var inputAdultos = document.getElementById("input-adultos");
    var inputNinos = document.getElementById("input-ninos");
    var noResults = document.getElementById("no-results");
    var noResultsQuery = document.getElementById("no-results-query");
    var searchStatus = document.getElementById("hosp-search-status");
    var pagination = document.getElementById("hosp-pagination");
    var pageSummary = document.getElementById("hosp-page-summary");
    var previousPage = document.getElementById("hosp-previous-page");
    var nextPage = document.getElementById("hosp-next-page");
    var currentPage = 1;
    var pageSize = 6;
    var requestId = 0;

    function normalize(value) {
        return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    }

    function setSearchStatus(message, error) {
        searchStatus.textContent = message;
        searchStatus.classList.toggle("error", Boolean(error));
    }

    function populateFilterOptions(items) {
        var destinations = new Map();
        items.forEach(function(item) {
            var id = String(item.id_ciudad || "").trim();
            var name = String(item.ciudad || "").trim();
            if (id && name) destinations.set(id, name);
        });
        Array.from(destinations.entries()).sort(function(a, b) {
            return a[1].localeCompare(b[1], "es");
        }).forEach(function(entry) {
            var option = document.createElement("option");
            option.value = entry[0];
            option.textContent = entry[1];
            inputDestino.appendChild(option);
        });

        var accessibilityOptions = Array.from(new Set(items.map(function(item) {
            return String(item.accesibilidad || "").trim();
        }).filter(Boolean))).sort(function(a, b) {
            return a.localeCompare(b, "es");
        });
        accessibilityOptions.forEach(function(accessibility) {
            var option = document.createElement("option");
            option.value = accessibility;
            option.textContent = accessibility;
            inputAccesibilidad.appendChild(option);
        });
    }

    function renderPage(matches) {
        var cards = Array.from(grid.querySelectorAll(".card-item"));
        var pageCount = Math.ceil(matches.length / pageSize);
        currentPage = Math.max(1, Math.min(currentPage, pageCount || 1));
        if (!matches.length) {
            cards.forEach(function(card) {
                card.hidden = true;
            });
            pagination.hidden = true;
            return;
        }

        var start = (currentPage - 1) * pageSize;
        var end = Math.min(start + pageSize, matches.length);
        var visibleCards = new Set(matches.slice(start, end));
        cards.forEach(function(card) {
            card.hidden = !visibleCards.has(card);
        });

        pageSummary.textContent = "Mostrando " + (start + 1) + "–" + end + " de " + matches.length +
            " hospedajes · Página " + currentPage + " de " + pageCount;
        previousPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === pageCount;
        pagination.hidden = matches.length <= pageSize;
    }

    function filterHospedajes() {
        var adults = inputAdultos.valueAsNumber;
        var children = inputNinos.valueAsNumber;
        if (!inputAdultos.validity.valid || !inputNinos.validity.valid ||
            !Number.isInteger(adults) || !Number.isInteger(children)) {
            setSearchStatus("Indica una cantidad válida de adultos y niños.", true);
            return;
        }

        var params = new URLSearchParams();
        if (inputDestino.value) params.set("id_ciudad", inputDestino.value);
        if (inputAccesibilidad.value) params.set("accesibilidad", inputAccesibilidad.value);
        params.set("capacidad", String(adults + children));
        var currentRequest = ++requestId;
        pagination.hidden = true;
        noResults.style.display = "none";
        setSearchStatus("Buscando hospedajes…");
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:12px">Buscando hospedajes…</p></div>';

        fetch("../hospedaje/buscar.php?" + params.toString(), { credentials: "include" })
            .then(function(response) {
                if (!response.ok) throw new Error("No se pudo buscar hospedajes.");
                return response.json();
            })
            .then(function(result) {
                if (currentRequest !== requestId) return;
                if (!result.ok || !Array.isArray(result.data)) {
                    throw new Error(result.error || "El servidor devolvió una respuesta inválida.");
                }
                grid.innerHTML = "";
                result.data.forEach(renderCard);
                var matches = Array.from(grid.querySelectorAll(".card-item"));
                currentPage = 1;
                noResults.style.display = matches.length ? "none" : "block";
                noResultsQuery.textContent = inputDestino.value
                    ? inputDestino.selectedOptions[0].textContent
                    : "los filtros seleccionados";
                renderPage(matches);
                setSearchStatus(matches.length + (matches.length === 1 ? " hospedaje coincide." : " hospedajes coinciden."));
            })
            .catch(function(error) {
                if (currentRequest !== requestId) return;
                grid.replaceChildren();
                pagination.hidden = true;
                noResults.style.display = "none";
                setSearchStatus(error.message || "Error al buscar hospedajes.", true);
            });
    }

    inputDestino.addEventListener("change", filterHospedajes);
    inputAccesibilidad.addEventListener("change", filterHospedajes);
    inputAdultos.addEventListener("input", filterHospedajes);
    inputNinos.addEventListener("input", filterHospedajes);
    document.getElementById("btn-buscar-hotel").addEventListener("click", filterHospedajes);
    document.getElementById("btn-limpiar-hospedaje").addEventListener("click", function() {
        inputDestino.value = "";
        inputAccesibilidad.value = "";
        inputAdultos.value = "1";
        inputNinos.value = "0";
        filterHospedajes();
    });
    previousPage.addEventListener("click", function() {
        if (currentPage > 1) {
            currentPage--;
            renderPage(Array.from(grid.querySelectorAll(".card-item")));
        }
    });
    nextPage.addEventListener("click", function() {
        currentPage++;
        renderPage(Array.from(grid.querySelectorAll(".card-item")));
    });
    document.querySelectorAll(".search-container input, .search-container select").forEach(function(control) {
        control.addEventListener("keydown", function(event) {
            if (event.key === "Enter" && control.type !== "number") {
                event.preventDefault();
                filterHospedajes();
            }
        });
    });

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>\"']/g, function(char) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
        });
    }

    function safeImageUrl(value) {
        var url = String(value || "").trim();
        if (/^https?:\/\//i.test(url)) return url;
        return /^[a-z0-9_./%() -]+$/i.test(url) && !url.startsWith("//") ? "../" + url : "";
    }

    function renderCard(item) {
        var nombre = escapeHtml(item.nombre || "Sin nombre");
        var tipo = escapeHtml(item.tipo || "Hospedaje");
        var ciudadTexto = item.ciudad || "";
        var accesibilidadTexto = item.accesibilidad || "";
        var ciudad = escapeHtml(ciudadTexto);
        var accesibilidad = escapeHtml(accesibilidadTexto);
        var descripcion = escapeHtml(item.descripcion || ciudadTexto + " · " + accesibilidadTexto);
        var servicios = escapeHtml(item.servicios_txt || "—");
        var empresa = escapeHtml(item.empresa || "");
        var whatsapp = escapeHtml(item.whatsapp || item.telefono || item.num_contacto_empresa || "");
        var imagen = escapeHtml(safeImageUrl(item.img_url));
        var precioDisplay = item.precio_noche ? "$" + parseInt(item.precio_noche).toLocaleString("es-CO") + " / noche" : "Consultar";
        var imgHtml = imagen ?
            '<img src="' + imagen + '" class="card-banner" alt="' + nombre + '">' :
            '<div class="card-banner" style="background:linear-gradient(135deg,#1e1b4b,#4c1d95);display:flex;align-items:center;justify-content:center;height:200px;"><i class="fa-solid fa-hotel" style="font-size:3rem;color:#a855f7;"></i></div>';
        var card = document.createElement("article");
        card.className = "card-item card-item--empresa";
        card.dataset.idCiudad = item.id_ciudad || "";
        card.dataset.nombre = item.nombre || "";
        card.dataset.accesibilidad = accesibilidadTexto;
        card.dataset.capacidad = String(Number(item.capacidad_max) || 0);
        card.innerHTML = imgHtml +
            '<div class="card-body">' +
            '<span class="card-tag" style="background:rgba(168,85,247,0.18);color:#a855f7;">' + tipo + '</span>' +
            '<h3>' + nombre + '</h3>' +
            '<p style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">' +
            descripcion + '</p>' +
            '<div class="card-footer">' +
            '<span class="price">' + precioDisplay + '</span>' +
            '<button class="btn-reservar btn-ver-detalles btn-ver-detalles-empresa"' +
            ' data-titulo="' + nombre + '" data-tipo="' + escapeHtml(item.tipo || "") + '"' +
            ' data-ubicacion="' + ciudad + '" data-capacidad="' + escapeHtml(item.capacidad_max || "—") + '"' +
            ' data-servicios="' + servicios + '" data-accesibilidad="' + (accesibilidad || "—") + '"' +
            ' data-precio="' + escapeHtml(precioDisplay) + '" data-empresa="' + empresa + '"' +
            ' data-whatsapp="' + whatsapp + '" data-img="' + imagen + '">Ver detalles</button>' +
            '</div></div>';
        card.querySelector(".btn-ver-detalles-empresa").addEventListener("click", function() {
            var btn = this;
            var overlay = document.getElementById("hosp-detalle-overlay");
            var _s = btn.dataset.img || "";
            document.getElementById("hosp-img").src = _s ? (_s.startsWith("http") || _s.startsWith("../") ? _s : "../" + _s) : "";
            document.getElementById("hosp-titulo").textContent = btn.dataset.titulo || "";
            document.getElementById("hosp-tipo").textContent = btn.dataset.tipo || "";
            document.getElementById("hosp-ubicacion").textContent = btn.dataset.ubicacion || "";
            document.getElementById("hosp-capacidad").textContent = btn.dataset.capacidad || "";
            document.getElementById("hosp-servicios").textContent = btn.dataset.servicios || "";
            document.getElementById("hosp-accesibilidad").textContent = btn.dataset.accesibilidad || "";
            document.getElementById("hosp-precio").textContent = btn.dataset.precio || "";
            actualizarBotonWhatsApp(btn);
            overlay.removeAttribute("aria-hidden");
            overlay.classList.add("visible");
            document.body.style.overflow = "hidden";
        });
        grid.appendChild(card);
    }

    function cargarHospedajes() {
        var currentRequest = ++requestId;
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:12px">Cargando hospedajes disponibles...</p></div>';
        fetch("../hospedaje/buscar.php", { credentials: "include" })
            .then(function(response) {
                if (!response.ok) throw new Error("No se pudieron cargar los hospedajes.");
                return response.json();
            })
            .then(function(result) {
                if (currentRequest !== requestId) return;
                if (!result.ok || !Array.isArray(result.data)) {
                    throw new Error(result.error || "El servidor devolvió una respuesta inválida.");
                }
                grid.innerHTML = "";
                populateFilterOptions(result.data);
                result.data.forEach(renderCard);
                var cards = Array.from(grid.querySelectorAll(".card-item"));
                renderPage(cards);
                noResults.style.display = cards.length ? "none" : "block";
                setSearchStatus(cards.length + (cards.length === 1 ? " hospedaje publicado." : " hospedajes publicados."));
            })
            .catch(function(error) {
                if (currentRequest !== requestId) return;
                grid.replaceChildren();
                setSearchStatus(error.message || "Error al cargar hospedajes.", true);
            });
    }

    cargarHospedajes();
})();