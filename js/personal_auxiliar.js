// ============================================================
// personal_auxiliar.js — Lógica propia de la página Personal Auxiliar
// (modal de detalles, buscador y carga dinámica desde el backend)
// ============================================================

        // ── MODAL VER DETALLES DE PERSONAL AUXILIAR ──────────────────
        // Usa delegación de eventos para capturar botones dinámicos del fetch
        (function() {
            var overlay = document.getElementById('pa-detalle-overlay');
            var cerrar = document.getElementById('pa-cerrar');

            document.body.addEventListener('click', function(e) {
                var btn = e.target.closest('.btn-ver-detalles');
                if (!btn) return;
                document.getElementById('pa-img').src = btn.dataset.img || '';
                document.getElementById('pa-titulo').textContent = btn.dataset.titulo || '';
                document.getElementById('pa-disponibilidad').textContent = btn.dataset.disponibilidad || '';
                document.getElementById('pa-experiencia').textContent = btn.dataset.experiencia || '';
                document.getElementById('pa-especialidad').textContent = btn.dataset.especialidad || '';
                document.getElementById('pa-accesibilidad').textContent = btn.dataset.accesibilidad || '';
                var _certEl = document.getElementById('pa-certificaciones');
                if (_certEl) _certEl.textContent = btn.dataset.certificaciones || '';
                var precioRaw = btn.dataset.precio || '';
                var precioNum = parseInt(precioRaw.replace(/[^0-9]/g, ''), 10);
                document.getElementById('pa-precio').textContent = !isNaN(precioNum) ?
                    '$' + precioNum.toLocaleString('es-CO') + ' / Día' :
                    precioRaw;
                overlay.classList.add('visible');
                document.body.style.overflow = 'hidden';
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

        // ── BUSCADOR DE PERSONAL AUXILIAR ──────────────────────────
        (function() {
            var btnBuscar = document.getElementById('btn-buscar-auxiliar');
            var selectTipo = document.getElementById('select-tipo-apoyo');
            var grid = document.getElementById('results-grid-aux');
            var msgSinResultados = document.getElementById('msg-sin-resultados');

            function filtrar() {
                var tipoSeleccionado = (selectTipo.value || '').toLowerCase();
                var visibles = 0;
                // Leer cards dinámicamente para incluir las del fetch
                var cards = grid ? grid.querySelectorAll('.card-item') : [];
                cards.forEach(function(card) {
                    var tipoCard = (card.getAttribute('data-tipo') || '').toLowerCase();
                    if (!tipoSeleccionado || tipoCard.includes(tipoSeleccionado)) {
                        card.style.display = '';
                        visibles++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                if (msgSinResultados) msgSinResultados.style.display = visibles === 0 ? 'block' : 'none';
            }

            if (btnBuscar) btnBuscar.addEventListener('click', filtrar);
            if (selectTipo) selectTipo.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') filtrar();
            });
        })();

        (function() {
            var grid = document.getElementById("results-grid-aux");
            if (!grid) return;

            function renderCard(item) {
                var nombre = item.nombre || "Sin nombre";
                var cargo = item.cargo || "Personal Auxiliar";
                var ciudad = item.ciudad || "";
                var tarifa = item.tarifa_hora ? "$" + parseInt(item.tarifa_hora).toLocaleString("es-CO") + " / Día" : "Consultar";
                var imgHtml = item.img_url ?
                    '<img src="' + (item.img_url ? (item.img_url.startsWith("http") ? item.img_url : "../" + item.img_url) : "") + '" class="card-img" alt="' + nombre + '" style="width:100%;height:200px;object-fit:cover;border-radius:12px 12px 0 0;">' :
                    '<div style="background:linear-gradient(135deg,#1e1b4b,#4c1d95);display:flex;align-items:center;justify-content:center;height:200px;border-radius:12px 12px 0 0;"><i class="fa-solid fa-person-cane" style="font-size:3rem;color:#a855f7;"></i></div>';

                var card = document.createElement("article");
                card.className = "card-item";
                card.setAttribute("data-tipo", cargo);
                card.innerHTML =
                    imgHtml +
                    '<div class="card-body">' +
                    '<span class="card-tag">' + cargo + '</span>' +
                    '<h3>' + nombre + '</h3>' +
                    '<p>' + (item.especialidad || "") + '</p>' +
                    '<p><i class="fa-solid fa-location-dot"></i> ' + ciudad + '</p>' +
                    '<div class="card-footer">' +
                    '<span class="price">' + tarifa + '</span>' +
                    '<button class="btn-reservar btn-ver-detalles"' +
                    ' data-titulo="' + nombre + ' — ' + cargo + '"' +
                    ' data-especialidad="' + (item.especialidad || "") + '"' +
                    ' data-disponibilidad="' + ciudad + '"' +
                    ' data-experiencia="' + (item.empresa || "") + '"' +
                    ' data-accesibilidad="' + (item.accesibilidad || "Atencion general") + '"' +
                    ' data-precio="' + (item.tarifa_hora || 0) + '"' +
                    ' data-img="' + (item.img_url ? (item.img_url.startsWith("http") ? item.img_url : "../" + item.img_url) : "") + '"' +
                    '>Ver detalles</button>' +
                    '<button class="btn-carrito"' +
                    ' data-id="aux-' + item.id + '" data-nombre="' + nombre + '"' +
                    ' data-tipo="Personal Auxiliar" data-precio="' + (item.tarifa_hora || 0) + '"' +
                    ' data-icono="fa-solid fa-person-cane" data-img="' + (item.img_url || "") + '">' +
                    '<i class="fa-solid fa-cart-plus"></i> Contratar</button>' +
                    '</div></div>';

                // Conectar al modal existente pa-detalle-overlay
                card.querySelector(".btn-ver-detalles").addEventListener("click", function() {
                    var btn = this;
                    var overlay = document.getElementById("pa-detalle-overlay");
                    if (!overlay) return;
                    document.getElementById("pa-img").src = btn.dataset.img || "";
                    document.getElementById("pa-titulo").textContent = btn.dataset.titulo || "";
                    document.getElementById("pa-disponibilidad").textContent = btn.dataset.disponibilidad || "";
                    document.getElementById("pa-experiencia").textContent = btn.dataset.experiencia || "";
                    document.getElementById("pa-especialidad").textContent = btn.dataset.especialidad || "";
                    document.getElementById("pa-accesibilidad").textContent = btn.dataset.accesibilidad || "";
                    var precioNum = parseInt((btn.dataset.precio || "").replace(/[^0-9]/g, ""), 10);
                    document.getElementById("pa-precio").textContent = !isNaN(precioNum) ? "$" + precioNum.toLocaleString("es-CO") + " / Día" : (btn.dataset.precio || "");
                    overlay.classList.add("visible");
                    document.body.style.overflow = "hidden";
                });

                grid.appendChild(card);
            }

            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:12px">Cargando personal auxiliar disponible...</p></div>';
            fetch("../auxiliar/listar.php", {
                    credentials: "include"
                })
                .then(function(r) {
                    return r.json();
                })
                .then(function(res) {
                    grid.innerHTML = "";
                    if (!res.ok || !res.data || !res.data.length) {
                        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8"><i class="fa-solid fa-person-cane fa-2x"></i><p style="margin-top:12px">No hay personal auxiliar disponible por el momento.</p></div>';
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
