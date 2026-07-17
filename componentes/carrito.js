(function() {
    "use strict";

    var STORAGE_KEY = "te_carrito";

    // ── CARRITO ──
    function getCarrito() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveCarrito(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function sesionActiva() {
        var s = sessionStorage.getItem("te_session");
        if (!s) return null;
        try {
            var u = JSON.parse(s);
            return u.tipo === "viajero" ? u : null;
        } catch (e) {
            return null;
        }
    }

    function agregarItem(item) {
        var c = getCarrito();
        if (c.find(function(x) { return x.id === item.id; })) return false;
        c.push(item);
        saveCarrito(c);
        return true;
    }

    function quitarItem(id) {
        var c = getCarrito().filter(function(x) { return x.id !== id; });
        saveCarrito(c);
    }

    function estaEnCarrito(id) {
        return getCarrito().some(function(x) { return x.id === id; });
    }

    function actualizarBadge() {
        var badge = document.getElementById("te-cart-badge");
        if (!badge) return;
        var n = getCarrito().length;
        badge.textContent = n;
        badge.style.display = n > 0 ? "flex" : "none";
    }

    function inyectarBtnCarrito() {
        var navSlot = document.querySelector(".nav-slot") || document.querySelector(".nav-container");
        if (!navSlot) return;
        if (document.getElementById("te-cart-btn")) return;

        var btn = document.createElement("a");
        btn.id = "te-cart-btn";
        btn.href = "#";
        btn.className = "te-cart-nav-btn";
        btn.title = "Ver mi carrito de reservas";
        btn.innerHTML =
            '<i class="fa-solid fa-cart-shopping"></i>' +
            '<span class="te-cart-badge" id="te-cart-badge" style="display:none">0</span>';

        btn.addEventListener("click", function(e) {
            e.preventDefault();
            var user = sesionActiva();
            if (user) {
                window.location.href = "reservas_viajero.html";
            } else {
                abrirLoginRequerido();
            }
        });

        // Referenciamos el CONTENEDOR del componente (#dark-mode-toggle), que sí es
        // hijo directo de navSlot. El botón #darkModeToggle real vive anidado adentro
        // de ese contenedor (lo inyecta dark-mode-toggle.js), así que insertBefore
        // fallaría si lo usáramos directamente a él.
        var darkMount = document.getElementById("dark-mode-toggle");
        if (darkMount) { navSlot.insertBefore(btn, darkMount); } else { navSlot.appendChild(btn); }

        actualizarBadge();
    }

    function abrirLoginRequerido() {
        mostrarToast("Inicia sesión para ver tus reservas y pagar.", "info");
        var btnAcceder = document.getElementById("btnAccederNav") || document.querySelector(".btn-acceder");
        if (btnAcceder) {
            setTimeout(function() { btnAcceder.click(); }, 700);
        } else {
            setTimeout(function() { window.location.href = "html/login.html"; }, 1200);
        }
    }

    function mostrarToast(msg, tipo) {
        var t = document.getElementById("te-toast");
        if (!t) {
            t = document.createElement("div");
            t.id = "te-toast";
            document.body.appendChild(t);
        }
        t.className = "te-toast te-toast--" + (tipo || "info");
        t.innerHTML =
            '<i class="fa-solid ' +
            (tipo === "success" ? "fa-circle-check" : "fa-circle-info") +
            '"></i> ' +
            msg;
        t.classList.add("te-toast--show");

        clearTimeout(t._timeout);
        t._timeout = setTimeout(function() {
            t.classList.remove("te-toast--show");
        }, 3000);
    }

    // ── RENDER PANEL CARRITO (CON DELEGACIÓN DE EVENTOS) ──
    function renderPanelCarrito() {
        var panel = document.getElementById("te-carrito-panel");
        if (!panel) return;

        var items = getCarrito();

        if (items.length === 0) {
            panel.innerHTML =
                '<p class="te-cart-empty"><i class="fa-solid fa-cart-shopping"></i><br>Tu carrito está vacío.<br>Añade transporte, hospedaje o servicios desde las secciones correspondientes.</p>';
            return;
        }

        var total = items.reduce(function(s, x) { return s + (x.precio || 0); }, 0);

        var html = '<ul class="te-cart-list">';
        items.forEach(function(item) {
            html +=
                '<li class="te-cart-item">' +
                '<div class="te-cart-item-icon">' +
                (item.img ?
                    '<img src="' + item.img + '" alt="' + item.nombre + '" class="te-cart-item-img" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                    '<i class="' + (item.icono || "fa-solid fa-tag") + '" style="display:none"></i>' :
                    '<i class="' + (item.icono || "fa-solid fa-tag") + '"></i>') +
                '</div>' +
                '<div class="te-cart-item-info">' +
                '<span class="te-cart-item-nombre">' + item.nombre + "</span>" +
                '<span class="te-cart-item-tipo">' + item.tipo + "</span>" +
                (item.precio ? '<span class="te-cart-item-precio">$' + item.precio.toLocaleString("es-CO") + "</span>" : "") +
                "</div>" +
                '<button class="te-cart-item-remove" data-id="' + item.id + '" title="Quitar">' +
                '<i class="fa-solid fa-xmark"></i>' +
                "</button>" +
                "</li>";
        });
        html += "</ul>";

        html +=
            '<div class="te-cart-total">' +
            "<span>Total estimado</span>" +
            "<strong>$" + total.toLocaleString("es-CO") + "</strong>" +
            "</div>" +
            '<button class="te-cart-confirmar" id="te-cart-confirmar">' +
            '<i class="fa-solid fa-check"></i> Confirmar Reservas' +
            "</button>" +
            '<button class="te-cart-vaciar" id="te-cart-vaciar">' +
            '<i class="fa-solid fa-trash"></i> Vaciar carrito' +
            "</button>";

        panel.innerHTML = html;
    }

    // ── INICIALIZAR EVENTOS DEL PANEL (CON DELEGACIÓN) ──
    function initPanelEvents() {
        var panel = document.getElementById("te-carrito-panel");
        if (!panel) return;

        // ── Eliminar ítem ──
        panel.addEventListener('click', function(e) {
            var btn = e.target.closest('.te-cart-item-remove');
            if (!btn) return;
            quitarItem(btn.getAttribute("data-id"));
            renderPanelCarrito();
            actualizarBadge();
        });

        // ── CONFIRMAR RESERVAS ──
        panel.addEventListener('click', function(e) {
            var btn = e.target.closest('#te-cart-confirmar');
            if (!btn) return;

            console.log('🔵 Confirmar Reservas clickeado');

            var user = sesionActiva();
            if (!user) {
                abrirLoginRequerido();
                return;
            }
            var items = getCarrito();
            if (items.length === 0) {
                mostrarToast("El carrito está vacío.", "info");
                return;
            }
            console.log('🛒 Items en carrito:', items);
            mostrarModalDatosComunes(items);
        });

        // ── Vaciar carrito ──
        panel.addEventListener('click', function(e) {
            var btn = e.target.closest('#te-cart-vaciar');
            if (!btn) return;
            if (confirm("¿Seguro que quieres vaciar el carrito?")) {
                saveCarrito([]);
                renderPanelCarrito();
                actualizarBadge();
            }
        });
    }


    // ── MODAL DE DATOS COMUNES ──
    function mostrarModalDatosComunes(items) {
        console.log('🔵 mostrando modal datos comunes');

        var modal = document.getElementById('modalDatosComunes');
        if (!modal) {
            console.log('🟡 Creando modal...');
            modal = document.createElement('div');
            modal.id = 'modalDatosComunes';
            modal.className = 'dc-modal-overlay';
            modal.innerHTML = `
                <div class="dc-modal-box">
                    <span class="dc-modal-close" id="dc-close">&times;</span>
                    <h2><i class="fa-solid fa-calendar-check"></i> Datos del viaje</h2>
                    <p class="dc-subtitle">Completa la información general para todas tus reservas</p>
                    
                    <div class="dc-form">
                        <div class="dc-field">
                            <label>Fecha del viaje / Check-in <span class="dc-req">*</span></label>
                            <input type="date" id="dc-fecha" required>
                        </div>
                        
                        <div class="dc-field">
                            <label>Número de adultos <span class="dc-req">*</span></label>
                            <input type="number" id="dc-adultos" min="1" value="1" required>
                        </div>
                        
                        <div class="dc-field dc-field-inline">
                            <label>
                                <input type="checkbox" id="dc-tiene-menores">
                                Viajan menores de edad
                            </label>
                        </div>
                        
                        <div class="dc-field" id="dc-grupo-menores" style="display:none">
                            <label>¿Cuántos menores?</label>
                            <input type="number" id="dc-num-menores" min="0" value="0">
                        </div>
                        
                        <div class="dc-field">
                            <label>Observaciones</label>
                            <textarea id="dc-obs" rows="3" placeholder="Necesidades especiales, accesibilidad, requisitos específicos..."></textarea>
                        </div>
                    </div>
                    
                    <div class="dc-actions">
                        <button class="dc-btn-secondary" id="dc-cancelar">Cancelar</button>
                        <button class="dc-btn-primary" id="dc-confirmar">
                            <i class="fa-solid fa-arrow-right"></i> Continuar al pago
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('dc-close').addEventListener('click', function() {
                modal.classList.remove('dc-visible');
            });

            document.getElementById('dc-tiene-menores').addEventListener('change', function() {
                document.getElementById('dc-grupo-menores').style.display = this.checked ? 'block' : 'none';
            });

            document.getElementById('dc-cancelar').addEventListener('click', function() {
                modal.classList.remove('dc-visible');
            });

            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('dc-visible');
                }
            });
        }

        modal.classList.add('dc-visible');

        document.getElementById('dc-fecha').value = '';
        document.getElementById('dc-adultos').value = 1;
        document.getElementById('dc-tiene-menores').checked = false;
        document.getElementById('dc-grupo-menores').style.display = 'none';
        document.getElementById('dc-num-menores').value = 0;
        document.getElementById('dc-obs').value = '';

        document.getElementById('dc-confirmar').onclick = function() {
            var fecha = document.getElementById('dc-fecha').value;
            var adultos = parseInt(document.getElementById('dc-adultos').value) || 1;
            var tieneMenores = document.getElementById('dc-tiene-menores').checked;
            var numMenores = parseInt(document.getElementById('dc-num-menores').value) || 0;
            var obs = document.getElementById('dc-obs').value;

            if (!fecha) {
                alert('Por favor selecciona una fecha.');
                return;
            }

            var datosComunes = {
                fecha: fecha,
                adultos: adultos,
                menores: tieneMenores,
                num_menores: numMenores,
                observaciones: obs
            };

            modal.classList.remove('dc-visible');

            console.log('🔵 Iniciando checkout con:', items, datosComunes);

            if (window.TECheckout) {
                window.TECheckout.iniciar(items, datosComunes);
            } else {
                console.error('❌ TECheckout no está definido');
                mostrarToast('Error al iniciar el pago. Recarga la página.', 'info');
            }
        };
    }

    // ── PROCESAR BOTONES CON DELEGACIÓN ──
    function procesarBotonesCarrito() {
        document.addEventListener('click', function(e) {
            var btn = e.target.closest('.btn-carrito');
            if (!btn) return;

            var id = btn.getAttribute("data-id");
            var nombre = btn.getAttribute("data-nombre");
            var tipo = btn.getAttribute("data-tipo");
            var precio = parseInt(btn.getAttribute("data-precio") || "0", 10);
            var icono = btn.getAttribute("data-icono") || "fa-solid fa-tag";
            var img = btn.getAttribute("data-img") || "";

            if (!id || !nombre || !tipo) {
                console.warn('Botón carrito sin datos:', btn);
                return;
            }

            var user = sesionActiva();
            if (!user) {
                abrirLoginRequerido();
                return;
            }

            if (estaEnCarrito(id)) {
                mostrarToast('"' + nombre + '" ya está en tu carrito.', "info");
                return;
            }

            var ok = agregarItem({ id, nombre, tipo, precio, icono, img });
            if (ok) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Añadido';
                btn.classList.add("btn-carrito--added");
                actualizarBadge();
                mostrarToast('"' + nombre + '" añadido al carrito.', "success");
                // Re-renderizar panel
                renderPanelCarrito();
            }
        });
    }

    // ── INICIALIZACIÓN ──
    var _listenersRegistrados = false;

    // Sincronizar estados de reservas según fecha (solo en reservas_viajero.html)
    if (window.location.pathname.includes('reservas_viajero')) {
        fetch(window.location.origin + '/Tourismeasy/api/actualizar_estados.php', { method: 'POST' })
            .catch(function() { /* silencioso */ });
    }

    function init() {
        console.log('🔵 Inicializando carrito...');

        inyectarBtnCarrito();

        // Registrar listeners globales una sola vez
        if (!_listenersRegistrados) {
            procesarBotonesCarrito();
            initPanelEvents();
            _listenersRegistrados = true;
        }

        var user = sesionActiva();
        if (user) {
            renderPanelCarrito();
            if (window.TECargarHistorial) window.TECargarHistorial();
            var wrapper = document.getElementById("te-carrito-wrapper");
            if (wrapper) wrapper.style.display = "";
        } else {
            var wrapper = document.getElementById("te-carrito-wrapper");
            if (wrapper) wrapper.style.display = "none";
        }
    }

    document.addEventListener("DOMContentLoaded", init);
    window.addEventListener("te:login", init);
    window.addEventListener("te:logout", init);

    window.addEventListener("storage", function(e) {
        if (e.key === STORAGE_KEY) {
            actualizarBadge();
            renderPanelCarrito();
        }
        if (e.key === "te_session") { init(); }
    });

    window.TECarrito = {
        agregar: agregarItem,
        quitar: quitarItem,
        esta: estaEnCarrito,
        get: getCarrito,
        toast: mostrarToast,
        init: init,
    };

})();


/* ═══════════════════════════════════════════════════════════════
   MÓDULO 2 — TECheckout (NO TOCAR, igual que antes)
═══════════════════════════════════════════════════════════════ */
(function() {
    "use strict";

    var API_BASE = window.location.origin + '/Tourismeasy/api';
    var CARRITO_KEY = "te_carrito";

    // ── Estilos ──
    (function() {
        if (document.getElementById("te-validation-styles")) return;
        var s = document.createElement("style");
        s.id = "te-validation-styles";
        s.textContent =
            ".te-cart-item-img{width:100%;height:100%;object-fit:cover;border-radius:inherit}" +
            ".chk-field-error{display:block;color:#f87171;font-size:.72rem;margin-top:4px;font-weight:500;animation:chk-shake .2s ease}" +
            "@keyframes chk-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}" +
            ".chk-input--error{border-color:#f87171 !important;box-shadow:0 0 0 2px rgba(248,113,113,.25) !important}";
        document.head.appendChild(s);
    })();

    function fmt(n) { return "$" + Number(n).toLocaleString("es-CO"); }

    function hoy() {
        var d = new Date();
        var meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return d.getDate() + " " + meses[d.getMonth()] + " " + d.getFullYear();
    }

    var METODOS_PAGO = [
        { id: "CARD", label: "Tarjeta (crédito/débito)", icon: "fa-credit-card", color: "#7c3aed" },
        { id: "PSE", label: "PSE", icon: "fa-building-columns", color: "#0ea5e9" },
        { id: "NEQUI", label: "Nequi", icon: "fa-mobile-screen", color: "#7c3aed" },
        { id: "BANCOLOMBIA_TRANSFER", label: "Bancolombia Transfer", icon: "fa-building-columns", color: "#f59e0b" },
    ];

    var state = {
        items: [],
        itemIdx: 0,
        fase: "pago",
        datosRecopilados: [],
        metodoPago: null,
        datosComunes: null,
    };

    function overlay() { return document.getElementById("checkoutModal"); }
    function body() { return document.getElementById("chk-body"); }
    function tituloEl() { return document.getElementById("chk-titulo"); }
    function stepsEl() { return document.getElementById("chk-steps"); }
    function btnNext() { return document.getElementById("chk-next"); }
    function btnBack() { return document.getElementById("chk-back"); }

    function abrirOverlay() {
        overlay().classList.add("chk-visible");
        overlay().removeAttribute("aria-hidden");
        document.body.style.overflow = "hidden";
    }

    function cerrarOverlay() {
        overlay().classList.remove("chk-visible");
        overlay().setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function renderSteps() {
        var html = "";
        state.items.forEach(function(item, i) {
            var done = i < state.itemIdx || state.fase === "resumen";
            var activo = i === state.itemIdx && state.fase !== "resumen";
            html +=
                '<div class="chk-step-dot ' +
                (done ? "chk-step-dot--done" : activo ? "chk-step-dot--active" : "") +
                '" title="' + item.nombre + '">' +
                (done ? '<i class="fa-solid fa-check"></i>' : i + 1) +
                "</div>";
        });
        html += '<div class="chk-step-dot ' + (state.fase === "resumen" ? "chk-step-dot--active" : "") +
            '" title="Resumen"><i class="fa-solid fa-flag-checkered"></i></div>';
        stepsEl().innerHTML = html;
    }

    function renderFormPago(metodo, prev) {
        if (!metodo) return '<p class="chk-pago-hint"><i class="fa-solid fa-hand-pointer"></i> Selecciona un método de pago</p>';
        var html = "";
        if (metodo === "CARD") {
            html +=
                '<div class="chk-field chk-field--full"><label class="chk-label">Número de tarjeta <span class="chk-req">*</span></label>' +
                '<input class="chk-input" id="pg-num" type="text" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456" data-validate="tarjeta-num" autocomplete="cc-number" value="' + (prev["pg-num"] || "") + '"></div>' +
                '<div class="chk-field"><label class="chk-label">Vencimiento <span class="chk-req">*</span></label>' +
                '<input class="chk-input" id="pg-exp" type="text" inputmode="numeric" maxlength="5" placeholder="MM/AA" data-validate="tarjeta-exp" autocomplete="cc-exp" value="' + (prev["pg-exp"] || "") + '"></div>' +
                '<div class="chk-field"><label class="chk-label">CVV <span class="chk-req">*</span></label>' +
                '<input class="chk-input" id="pg-cvv" type="text" inputmode="numeric" maxlength="4" placeholder="123" data-validate="tarjeta-cvv" autocomplete="cc-csc" value="' + (prev["pg-cvv"] || "") + '"></div>' +
                '<div class="chk-field chk-field--full"><label class="chk-label">Nombre en la tarjeta <span class="chk-req">*</span></label>' +
                '<input class="chk-input" id="pg-tit" type="text" inputmode="text" placeholder="Como aparece en la tarjeta" data-validate="nombre-tarjeta" autocomplete="cc-name" value="' + (prev["pg-tit"] || "") + '"></div>';
        } else if (metodo === "NEQUI") {
            html +=
                '<div class="chk-section-label" style="margin-top:0"><i class="fa-solid fa-circle-info"></i> Pago por Nequi</div>' +
                '<div class="chk-banco-info"><div class="chk-banco-row"><span>Recibirás una notificación en tu app Nequi para aprobar el pago.</span></div></div>' +
                '<div class="chk-field chk-field--full"><label class="chk-label">Número de celular Nequi <span class="chk-req">*</span></label>' +
                '<input class="chk-input" id="pg-cel" type="tel" inputmode="numeric" maxlength="10" placeholder="3XX XXX XXXX" data-validate="celular-co" autocomplete="tel" value="' + (prev["pg-cel"] || "") + '"></div>';
        } else if (metodo === "PSE") {
            html +=
                '<div class="chk-field chk-field--full"><label class="chk-label">Banco <span class="chk-req">*</span></label>' +
                '<select class="chk-input" id="pg-banco">' + ["Bancolombia", "Banco de Bogotá", "Davivienda", "BBVA", "Banco Popular", "Banco de Occidente", "Banco Caja Social", "Banco Agrario", "Banco Falabella", "Nequi PSE"].map(function(b) {
                    return '<option' + (prev["pg-banco"] === b ? " selected" : "") + '>' + b + '</option>';
                }).join("") +
                '</select></div>' +
                '<div class="chk-field chk-field--full"><label class="chk-label">Tipo de persona <span class="chk-req">*</span></label>' +
                '<select class="chk-input" id="pg-tipo-persona">' +
                '<option' + (prev["pg-tipo-persona"] === "Natural" ? " selected" : "") + '>Natural</option>' +
                '<option' + (prev["pg-tipo-persona"] === "Jurídica" ? " selected" : "") + '>Jurídica</option>' +
                '</select></div>' +
                '<div class="chk-field chk-field--full"><label class="chk-label">Número de documento <span class="chk-req">*</span></label>' +
                '<input class="chk-input" id="pg-doc-pse" type="text" inputmode="numeric" placeholder="Cédula o NIT" data-validate="comprobante" value="' + (prev["pg-doc-pse"] || "") + '"></div>';
        } else if (metodo === "BANCOLOMBIA_TRANSFER") {
            html +=
                '<div class="chk-section-label" style="margin-top:0"><i class="fa-solid fa-circle-info"></i> Datos para transferencia</div>' +
                '<div class="chk-banco-info">' +
                '<div class="chk-banco-row"><span>Banco</span><strong>Bancolombia</strong></div>' +
                '<div class="chk-banco-row"><span>Tipo de cuenta</span><strong>Ahorros</strong></div>' +
                '<div class="chk-banco-row"><span>Número</span><strong>69812345678</strong></div>' +
                '<div class="chk-banco-row"><span>Titular</span><strong>TourismEasy S.A.S.</strong></div>' +
                '</div>' +
                '<div class="chk-field chk-field--full"><label class="chk-label">N.° de comprobante <span class="chk-req">*</span></label>' +
                '<input class="chk-input" id="pg-comp" type="text" inputmode="numeric" placeholder="Número de transacción Bancolombia" data-validate="comprobante" value="' + (prev["pg-comp"] || "") + '"></div>';
        }
        return html;
    }

    function renderPago() {
        var item = state.items[state.itemIdx];
        tituloEl().innerHTML =
            '<span class="chk-item-badge">' + (state.itemIdx + 1) + " de " + state.items.length + "</span> " + item.nombre;

        // Mostrar resumen del ítem y aviso de que el pago se completa en ePayco
        var html =
            '<div class="chk-item-resumen" style="margin-bottom:1rem">' +
            '<span>Total a pagar</span><strong>' + fmt(item.precio) + "</strong></div>" +
            '<p style="color:var(--text-secondary,#888);font-size:.85rem;margin:0 0 .5rem">' +
            '<i class="fa-solid fa-shield-halved" style="color:#7c3aed"></i> ' +
            'Al hacer clic en <strong>Pagar</strong> se abrirá la pasarela segura de ePayco donde podrás elegir tarjeta, PSE, Nequi u otros métodos.</p>';

        body().innerHTML = html;

        btnNext().innerHTML = 'Pagar <i class="fa-solid fa-lock"></i>';
        btnBack().style.display = "none";
    }

    function renderResumen() {
        console.log('🔵 renderResumen llamado, fase actual:', state.fase);
        tituloEl().innerHTML = '<i class="fa-solid fa-circle-check" style="color:#22c55e"></i> ¡Reservas completadas!';

        var total = state.datosRecopilados.reduce(function(s, d) { return s + (d.item.precio || 0); }, 0);
        var html = '<div class="chk-resumen-lista">';

        state.datosRecopilados.forEach(function(d) {
            var m = METODOS_PAGO.find(function(x) { return x.id === d.metodo; }) || { label: d.metodo, icon: "fa-credit-card" };
            html +=
                '<div class="chk-resumen-item">' +
                '<div class="chk-resumen-icon"><i class="fa-solid ' + (d.item.icono || "fa-tag") + '"></i></div>' +
                '<div class="chk-resumen-info"><strong>' + d.item.nombre + "</strong>" +
                "<span>" + d.item.tipo + ' · <i class="fa-solid ' + m.icon + '"></i> ' + m.label + "</span></div>" +
                '<span class="chk-resumen-precio">' + fmt(d.item.precio) + "</span>" +
                "</div>";
        });
        html +=
            '</div><div class="chk-resumen-total"><span>Total pagado</span><strong>' + fmt(total) + "</strong></div>" +
            '<p class="chk-resumen-msg"><i class="fa-solid fa-envelope"></i> Recibirás un correo de confirmación por cada reserva. Las reservas ya aparecen en tu historial.</p>';

        body().innerHTML = html;
        if (btnNext()) {
            btnNext().innerHTML = '<i class="fa-solid fa-xmark"></i> Cerrar';
            btnNext().disabled = false;
        }
        if (btnBack()) btnBack().style.display = "none";
    }

    var RE_SOLO_LETRAS = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/u;

    function setError(el, msg) {
        el.classList.add("chk-input--error");
        var err = el.parentNode.querySelector(".chk-field-error");
        if (!err) {
            err = document.createElement("span");
            err.className = "chk-field-error";
            el.parentNode.appendChild(err);
        }
        err.textContent = msg;
    }

    function clearError(el) {
        el.classList.remove("chk-input--error");
        var err = el.parentNode && el.parentNode.querySelector(".chk-field-error");
        if (err) err.textContent = "";
    }

    function validarPago() {
        if (!state.metodoPago) { alert("Selecciona un método de pago."); return false; }
        var ok = true;
        if (state.metodoPago === "CARD") {
            var numEl = document.getElementById("pg-num");
            if (numEl) {
                var digits = numEl.value.replace(/\s/g, "");
                if (!/^\d{16}$/.test(digits)) { setError(numEl, "Ingresa los 16 dígitos de la tarjeta.");
                    ok = false; } else { clearError(numEl); }
            }
            var expEl = document.getElementById("pg-exp");
            if (expEl) {
                if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expEl.value)) { setError(expEl, "Formato MM/AA inválido.");
                    ok = false; } else { clearError(expEl); }
            }
            var cvvEl = document.getElementById("pg-cvv");
            if (cvvEl) {
                if (!/^\d{3,4}$/.test(cvvEl.value.trim())) { setError(cvvEl, "CVV debe tener 3 o 4 dígitos.");
                    ok = false; } else { clearError(cvvEl); }
            }
            var titEl = document.getElementById("pg-tit");
            if (titEl) {
                var titVal = titEl.value.trim();
                if (!titVal || !RE_SOLO_LETRAS.test(titVal) || titVal.length < 3) { setError(titEl, "Ingresa el nombre tal como aparece en la tarjeta (solo letras).");
                    ok = false; } else { clearError(titEl); }
            }
        }
        if (state.metodoPago === "NEQUI") {
            var celEl = document.getElementById("pg-cel");
            if (celEl) {
                var celVal = celEl.value.replace(/\s/g, "");
                if (!/^3\d{9}$/.test(celVal)) { setError(celEl, "Número colombiano inválido: 10 dígitos, empieza por 3.");
                    ok = false; } else { clearError(celEl); }
            }
        }
        if (state.metodoPago === "PSE") {
            var bancoEl = document.getElementById("pg-banco");
            if (bancoEl && !bancoEl.value) { setError(bancoEl, "Selecciona tu banco.");
                ok = false; } else if (bancoEl) { clearError(bancoEl); }
            var docEl = document.getElementById("pg-doc-pse");
            if (docEl) {
                if (!docEl.value.trim() || !/^\d{5,15}$/.test(docEl.value.trim())) { setError(docEl, "Ingresa un número de documento válido.");
                    ok = false; } else { clearError(docEl); }
            }
        }
        if (state.metodoPago === "BANCOLOMBIA_TRANSFER") {
            var compEl = document.getElementById("pg-comp");
            if (compEl) {
                var compVal = compEl.value.trim();
                if (!compVal || !/^\d{4,20}$/.test(compVal)) { setError(compEl, "Ingresa el número de comprobante (4-20 dígitos).");
                    ok = false; } else { clearError(compEl); }
            }
        }
        return ok;
    }

    function recopilarPago() {
        var d = {};
        body().querySelectorAll(".chk-pago-form .chk-input, .chk-pago-form input, .chk-pago-form select").forEach(function(el) {
            if (el.id) d[el.id] = el.value;
        });
        return d;
    }

    var CIUDAD_DEFAULT = "68001";

    function agregarFilaHistorial(d) {
        // Recargar historial desde la BD vía función global
        if (typeof window.TECargarHistorial === 'function') window.TECargarHistorial();
    }

    // procesarResultado fue reemplazada por el listener de window 'message'
    // que recibe el postMessage de ePayco cuando external=false

    function avanzar() {
        console.log('🔵 avanzar() fase:', state.fase);
        if (state.fase === "pago") {
            var nb = btnNext();
            if (nb) { nb.disabled = true;
                nb.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando con ePayco...'; }

            var item = state.items[state.itemIdx];
            var montoPesos = Math.round(item.precio || 0);

            var user = null;
            try {
                var s = sessionStorage.getItem('te_session');
                if (s) user = JSON.parse(s);
            } catch (e) { /* ignore */ }

            if (!user) {
                alert('Debes iniciar sesión para pagar.');
                if (nb) { nb.disabled = false;
                    nb.innerHTML = 'Pagar <i class="fa-solid fa-lock"></i>'; }
                return;
            }

            if (!state.datosRecopilados[state.itemIdx]) state.datosRecopilados[state.itemIdx] = {};
            state.datosRecopilados[state.itemIdx].item = item;

            // Construir lista de items con datos de formulario
            var itemsConDatos = state.items.map(function(it) {
                var datosItem = {};
                if (state.datosComunes) {
                    datosItem = {
                        'ch-fecha'    : state.datosComunes.fecha,
                        'ch-personas' : state.datosComunes.adultos,
                        'ch-menores'  : state.datosComunes.num_menores,
                        'ch-obs'      : state.datosComunes.observaciones,
                    };
                }
                return { id: it.id, nombre: it.nombre, tipo: it.tipo,
                         precio: it.precio, icono: it.icono, img: it.img, datos: datosItem };
            });

            // ── Paso 1: Obtener referencia del servidor ──
            fetch(API_BASE + '/crear_transaccion.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ monto_pesos: montoPesos })
                })
                .then(function(r) {
                    if (!r.ok) return r.text().then(function(t) { throw new Error('HTTP ' + r.status + ': ' + t); });
                    return r.json();
                })
                .then(function(txData) {
                    console.log('[ePayco] crear_transaccion respuesta:', txData);
                    if (!txData.ok) {
                        alert('Error al crear la transacción: ' + (txData.error || 'Intenta de nuevo.'));
                        if (nb) { nb.disabled = false;
                            nb.innerHTML = 'Pagar <i class="fa-solid fa-lock"></i>'; }
                        return;
                    }

                    // ── Guardar contexto en sessionStorage antes de salir ──
                    sessionStorage.setItem('te_epayco_ctx', JSON.stringify({
                        referencia   : txData.referencia,
                        monto_pesos  : txData.monto_pesos,
                        items        : itemsConDatos,
                        origen_url   : window.location.href,   // ← para el botón "Volver"
                        datos_reserva: state.datosComunes ? {
                            fecha        : state.datosComunes.fecha,
                            personas     : state.datosComunes.adultos,
                            menores      : state.datosComunes.menores,
                            num_menores  : state.datosComunes.num_menores,
                            observaciones: state.datosComunes.observaciones,
                        } : null,
                    }));

                    // ── Paso 2: Abrir checkout de ePayco ──
                    var handler = ePayco.checkout.configure({
                        key: txData.public_key,
                        test: txData.test
                    });

                    var data = {
                        name        : item.nombre,
                        description : 'Reserva TourismEasy - ' + item.nombre,
                        invoice     : txData.referencia,
                        currency    : 'cop',
                        amount      : String(montoPesos),
                        tax_base    : '0',
                        tax         : '0',
                        country     : 'co',
                        lang        : 'es',

                        // external: true → redirige al usuario a response URL al terminar
                        external    : 'true',

                        // Datos del comprador
                        name_billing        : user.nombre   || '',
                        email_billing       : user.email    || '',
                        type_doc_billing    : 'CC',
                        number_doc_billing  : user.id       || '',
                        mobilephone_billing : user.celular  || '',

                        // URL de respuesta (redirige al usuario)
                        response    : window.location.origin + '/Tourismeasy/html/pago_resultado.html?ref_payco={ref_payco}',
                        // URL de confirmación server-to-server (ePayco llama a tu servidor)
                        confirmation: window.location.origin + '/Tourismeasy/api/pago_resultado.php',
                    };

                    handler.open(data);

                    if (nb) { nb.disabled = false;
                        nb.innerHTML = 'Pagar <i class="fa-solid fa-lock"></i>'; }
                })
                .catch(function(err) {
                    console.error('[ePayco] Error:', err);
                    alert('No se pudo conectar con el servidor. Intenta de nuevo.');
                    if (nb) { nb.disabled = false;
                        nb.innerHTML = 'Pagar <i class="fa-solid fa-lock"></i>'; }
                });

            return;

        } else if (state.fase === "resumen") {
            console.log('🔵 Cerrando desde resumen');
            cerrarOverlay();
            return;
        }
    }

    // Nota: con external:true ePayco redirige al usuario a pago_resultado.html
    // El contexto (items, referencia, datos_reserva) viaja en sessionStorage 'te_epayco_ctx'

    function iniciar(items, datosComunes) {
        console.log('🔵 TECheckout.iniciar() llamado con:', items, datosComunes);

        if (!items || items.length === 0) {
            console.warn('⚠️ No hay items en el carrito');
            return;
        }

        state.items = items;
        state.itemIdx = 0;
        state.metodoPago = null;
        state.datosComunes = datosComunes || null;
        state.fase = "pago";
        state.datosRecopilados = items.map(function(item) {
            return {
                datos: datosComunes ? {
                    'ch-fecha': datosComunes.fecha,
                    'ch-personas': datosComunes.adultos,
                    'ch-menores': datosComunes.num_menores,
                    'ch-obs': datosComunes.observaciones,
                } : {},
                item: item
            };
        });

        console.log('🔵 Abriendo overlay...');
        abrirOverlay();
        renderSteps();
        renderPago();
        console.log('🔵 Checkout abierto correctamente');
    }

    // ── EVENTOS ──
    document.addEventListener("DOMContentLoaded", function() {
        var btnN = document.getElementById("chk-next");
        var btnC = document.getElementById("chk-close");
        var ov = document.getElementById("checkoutModal");

        console.log('🔵 Checkout modal:', ov);

        if (btnN) btnN.addEventListener("click", avanzar);

        if (btnC) btnC.addEventListener("click", function() {
            if (state.fase === "resumen" || confirm("¿Cancelar el proceso de reserva?"))
                cerrarOverlay();
        });

        if (ov) ov.addEventListener("click", function(e) {
            if (e.target === ov && (state.fase === "resumen" || confirm("¿Cancelar el proceso de reserva?")))
                cerrarOverlay();
        });

        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && ov && ov.classList.contains("chk-visible") &&
                (state.fase === "resumen" || confirm("¿Cancelar el proceso de reserva?")))
                cerrarOverlay();
        });

        // ── Formateo automático de campos ──
        document.addEventListener("input", function(e) {
            var t = e.target;
            if (!t) return;

            if (t.id === "pg-num") {
                var digits = t.value.replace(/\D/g, "").substring(0, 16);
                t.value = digits.replace(/(.{4})/g, "$1 ").trim();
                return;
            }
            if (t.id === "pg-exp") {
                var v2 = t.value.replace(/\D/g, "").substring(0, 4);
                if (v2.length >= 3) v2 = v2.substring(0, 2) + "/" + v2.substring(2);
                t.value = v2;
                return;
            }
            if (t.id === "pg-cvv") {
                t.value = t.value.replace(/\D/g, "").substring(0, 4);
                return;
            }
            if (t.id === "pg-tit") {
                t.value = t.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]/gu, "");
                return;
            }
            if (t.id === "pg-cel") {
                var celRaw = t.value.replace(/\D/g, "");
                if (celRaw.length > 0 && celRaw[0] !== "3") celRaw = celRaw.substring(1);
                t.value = celRaw.substring(0, 10);
                return;
            }
            if (t.id === "pg-comp") {
                t.value = t.value.replace(/\D/g, "").substring(0, 20);
                return;
            }
        });

        // ── Validación en blur ──
        document.addEventListener("blur", function(e) {
            var t = e.target;
            if (!t || !t.classList.contains("chk-input")) return;

            if (t.id === "pg-num") {
                var d = t.value.replace(/\s/g, "");
                if (d && d.length !== 16) setError(t, "Ingresa los 16 dígitos de la tarjeta.");
                else clearError(t);
            } else if (t.id === "pg-exp") {
                if (t.value && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(t.value)) setError(t, "Formato MM/AA inválido.");
                else clearError(t);
            } else if (t.id === "pg-cvv") {
                if (t.value && !/^\d{3,4}$/.test(t.value)) setError(t, "CVV debe tener 3 o 4 dígitos.");
                else clearError(t);
            } else if (t.id === "pg-tit") {
                var titV = t.value.trim();
                if (titV && (!RE_SOLO_LETRAS.test(titV) || titV.length < 3)) setError(t, "Solo letras, mínimo 3 caracteres.");
                else clearError(t);
            } else if (t.id === "pg-cel") {
                var celV = t.value.replace(/\s/g, "");
                if (celV && !/^3\d{9}$/.test(celV)) setError(t, "Número colombiano inválido: 10 dígitos, empieza por 3.");
                else clearError(t);
            } else if (t.id === "pg-comp") {
                var cV = t.value.trim();
                if (cV && !/^\d{4,20}$/.test(cV)) setError(t, "Solo números, entre 4 y 20 dígitos.");
                else clearError(t);
            }
        }, true);
    });

    window.TECheckout = { iniciar: iniciar };
})();