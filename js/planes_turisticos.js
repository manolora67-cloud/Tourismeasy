// ============================================================
// planes_turisticos.js — Lógica propia de la página Planes Turísticos
// (buscador/filtro, modal de detalles y carga dinámica desde el backend)
// ============================================================

        // ── BUSCADOR / FILTRADO DE PLANES ─────────────────────────────
        (function() {
            var btnExplorar = document.getElementById('btn-explorar');
            var selectLugar = document.getElementById('filtro-lugar');
            var selectTipo = document.getElementById('filtro-tipo');
            var grid = document.querySelector('.results-grid');

            var noResults = document.createElement('p');
            noResults.id = 'no-results-msg';
            noResults.style.cssText = 'grid-column:1/-1;text-align:center;color:#7c3aed;font-family:Montserrat,sans-serif;font-weight:700;font-size:1.1rem;padding:40px 0;display:none;';
            noResults.textContent = 'No encontramos planes con esos filtros. ¡Intenta otra combinación!';
            grid.appendChild(noResults);

            function filtrar() {
                var lugar = selectLugar.value.toLowerCase().trim();
                var tipo = selectTipo.value.toLowerCase().trim();
                var visible = 0;
                var cards = grid.querySelectorAll('.card-item');
                cards.forEach(function(card) {
                    var cardLugar = (card.getAttribute('data-lugar') || '').toLowerCase();
                    var cardTipo = (card.getAttribute('data-tipo') || '').toLowerCase();
                    var matchLugar = !lugar || cardLugar.includes(lugar);
                    var matchTipo = !tipo || cardTipo.includes(tipo);
                    if (matchLugar && matchTipo) {
                        card.style.display = '';
                        visible++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                noResults.style.display = visible === 0 ? 'block' : 'none';
            }

            function resetFiltro() {
                if (!selectLugar.value && !selectTipo.value) {
                    grid.querySelectorAll('.card-item').forEach(function(c) {
                        c.style.display = '';
                    });
                    noResults.style.display = 'none';
                }
            }

            btnExplorar.addEventListener('click', filtrar);
            selectLugar.addEventListener('change', resetFiltro);
            selectTipo.addEventListener('change', resetFiltro);
        })();

        // ── MODAL VER DETALLES DE PLAN TURÍSTICO ─────────────────────
        (function() {
            var overlay = document.getElementById('plan-detalle-overlay');
            var cerrar = document.getElementById('plan-cerrar');

            document.querySelectorAll('.btn-ver-detalles').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var _s = btn.dataset.img || '';
                    document.getElementById('plan-img').src = _s ? (_s.startsWith('http') || _s.startsWith('../') ? _s : '../' + _s) : '';
                    document.getElementById('plan-titulo').textContent = btn.dataset.titulo || '';
                    document.getElementById('plan-categoria').textContent = btn.dataset.categoria || '';
                    document.getElementById('plan-ubicacion').textContent = btn.dataset.ubicacion || '';
                    document.getElementById('plan-duracion').textContent = btn.dataset.duracion || '';
                    document.getElementById('plan-incluye').textContent = btn.dataset.incluye || '';
                    document.getElementById('plan-accesibilidad').textContent = btn.dataset.accesibilidad || '';
                    document.getElementById('plan-precio').textContent = btn.dataset.precio || '';
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

        (function() {
            var grid = document.querySelector(".results-grid");
            if (!grid) return;

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
                    ' data-ubicacion="' + (item.ciudad || "") + '" data-duracion="' + (item.duracion || "—") + '"' +
                    ' data-incluye="' + (item.incluye || "—") + '" data-accesibilidad="' + (item.accesibilidad || "—") + '"' +
                    ' data-precio="' + precioDisplay + '" data-empresa="' + (item.empresa || "") + '"' +
                    ' data-img="' + (item.img_url || "") + '">Ver detalles</button>' +
                    '<button class="btn-carrito" data-id="plan-' + item.id + '" data-nombre="' + nombre + '"' +
                    ' data-tipo="Plan Turistico" data-precio="' + (item.precio || 0) + '"' +
                    ' data-icono="fa-solid fa-map-location-dot" data-img="' + (item.img_url || "") + '">' +
                    '<i class="fa-solid fa-cart-plus"></i> Añadir</button>' +
                    '</div></div>';
                card.querySelector(".btn-ver-detalles-emp-plan").addEventListener("click", function() {
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
                    overlay.removeAttribute("aria-hidden");
                    overlay.classList.add("visible");
                    document.body.style.overflow = "hidden";
                });
                grid.appendChild(card);
            }

            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:12px">Cargando planes turisticos...</p></div>';
            fetch("../planes/listar.php", {
                    credentials: "include"
                })
                .then(function(r) {
                    return r.json();
                })
                .then(function(res) {
                    grid.innerHTML = "";
                    if (!res.ok || !res.data || !res.data.length) {
                        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8"><i class="fa-solid fa-map-location-dot fa-2x"></i><p style="margin-top:12px">No hay planes turisticos disponibles por el momento.</p></div>';
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
