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

// ── BUSCADOR DE HOSPEDAJE ──────────────────────────────────
(function() {
    var inputDestino = document.getElementById('input-destino');
    var inputAcces = document.getElementById('input-accesibilidad');
    var btnBuscar = document.getElementById('btn-buscar-hotel');
    var grid = document.getElementById('results-grid');
    var noResults = document.getElementById('no-results');
    var noResultsQuery = document.getElementById('no-results-query');

    // Mapa de palabras clave → municipio (normalizado sin tildes)
    var municipios = {
        'bucaramanga': 'bucaramanga',
        'bga': 'bucaramanga',
        'barichara': 'barichara',
        'giron': 'girón',
        'girón': 'girón',
        'socorro': 'socorro',
    };

    // Mapa de accesibilidad clave → texto que debe aparecer en data-accesibilidad
    var accesKeys = {
        'rampa': 'rampa',
        'habitacion': 'adaptada',
        'ascensor': 'ascensor',
    };

    function normalize(str) {
        return str.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function filtrar() {
        var query = normalize(inputDestino.value);
        var accesVal = inputAcces.value;
        var cards = grid.querySelectorAll('.card-item');
        var visible = 0;

        cards.forEach(function(card) {
            var municipio = normalize(card.getAttribute('data-municipio') || '');
            var accesText = normalize(
                card.querySelector('.btn-ver-detalles') ?
                card.querySelector('.btn-ver-detalles').getAttribute('data-accesibilidad') || '' :
                ''
            );

            // Coincidencia de destino
            var matchDestino = true;
            if (query !== '') {
                // Buscar si alguna clave del mapa está contenida en el query
                var municipioTarget = null;
                for (var k in municipios) {
                    if (query.indexOf(normalize(k)) !== -1) {
                        municipioTarget = municipios[k];
                        break;
                    }
                }
                if (municipioTarget) {
                    matchDestino = normalize(municipioTarget) === municipio;
                } else {
                    // Búsqueda libre: ver si coincide con el municipio de la tarjeta
                    matchDestino = municipio.indexOf(query) !== -1;
                }
            }

            // Coincidencia de accesibilidad
            var matchAcces = true;
            if (accesVal !== '') {
                var keyword = accesKeys[accesVal] || accesVal;
                matchAcces = accesText.indexOf(normalize(keyword)) !== -1;
            }

            if (matchDestino && matchAcces) {
                card.style.display = '';
                visible++;
            } else {
                card.style.display = 'none';
            }
        });

        if (visible === 0) {
            noResults.style.display = 'block';
            noResultsQuery.textContent = inputDestino.value || 'este destino';
        } else {
            noResults.style.display = 'none';
        }
    }

    // Buscar al hacer clic en el botón
    btnBuscar.addEventListener('click', filtrar);

    // Buscar en tiempo real mientras escribe
    inputDestino.addEventListener('input', filtrar);

    // Filtrar también al cambiar accesibilidad
    inputAcces.addEventListener('change', filtrar);

    // Buscar al presionar Enter en el input
    inputDestino.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') filtrar();
    });
})();

// ── HOSPEDAJES DINÁMICOS DESDE PANEL EMPRESA ─────────────────────────
(function() {
    var grid = document.getElementById("results-grid");
    if (!grid) return;

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
        card.setAttribute("data-municipio", ciudadTexto.toLowerCase());
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

    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:12px">Cargando hospedajes disponibles...</p></div>';
    fetch("../hospedaje/listar.php", {
            credentials: "include"
        })
        .then(function(r) {
            return r.json();
        })
        .then(function(res) {
            grid.innerHTML = "";
            if (!res.ok || !res.data || !res.data.length) {
                grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8"><i class="fa-solid fa-hotel fa-2x"></i><p style="margin-top:12px">No hay hospedajes disponibles por el momento.</p></div>';
                return;
            }
            res.data.forEach(function(item) {
                renderCard(item);
            });
        })
        .catch(function() {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#ef4444">Error al cargar. Intenta recargar la página.</div>';
        });
})();