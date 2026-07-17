(function() {
    'use strict';

    // ── VERIFICACIÓN DE SESIÓN ──
    // Lo primero es revisar si hay sesión activa en sessionStorage
    var sess = sessionStorage.getItem('te_session');
    if (!sess) { window.location.href = '../index.html'; return; } // Sin sesión → al inicio

    var user = JSON.parse(sess);
    // Si el usuario no es de tipo 'viajero' (ej: es admin o empresa) → al inicio
    if (user.tipo !== 'viajero') { window.location.href = '../index.html'; return; }

    // ── AVATAR ──
    // Si el usuario tiene un avatar guardado lo usamos; si no, generamos las iniciales del nombre
    // Ej: "Carlos Rueda" → "CR"
    var av = user.avatar ||
        (user.nombre ?
            user.nombre.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase() :
            'V'); // 'V' por defecto si no hay nombre

    var nm = user.nombre || 'Mi Cuenta'; // Nombre a mostrar

    // ── Helper para actualizar texto de elementos por ID ──
    function setEl(id, val) { var e = document.getElementById(id); if (e) e.textContent = val; }

    // Rellenamos todos los lugares donde aparece el nombre y avatar del usuario
    setEl('sidebarAvatar', av);
    setEl('sidebarNombre', nm);
    setEl('perfilAvatar', av);
    setEl('perfilNombre', nm);
    setEl('infoNombre', nm);

    // Si hay correo en la sesión, lo mostramos también
    if (user.email) {
        setEl('configEmail', user.email);
        var emailEl = document.getElementById('perfilEmail');
        if (emailEl) emailEl.innerHTML = '<i class="fa-solid fa-envelope"></i> ' + user.email;
    }

    // ── MODO OSCURO ──
    // El botón de la navbar (#darkModeToggle) ya lo gestiona por completo el
    // componente dark-mode-toggle.js (aplica el tema al cargar y su propio
    // listener de clic). Aquí solo mantenemos sincronizado el switch de la
    // página de Configuración con el tema activo, sin volver a enganchar el
    // botón de la navbar (eso duplicaría el toggle, como pasaba con el widget
    // de sesión).
    function applyTheme(dark) {
        document.body.classList.toggle('dark-mode', dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        var dmBtnIcon = document.getElementById('darkModeToggle');
        dmBtnIcon = dmBtnIcon ? dmBtnIcon.querySelector('i') : null;
        if (dmBtnIcon) dmBtnIcon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        var tt = document.getElementById('themeToggle');
        if (tt) tt.checked = dark;
    }
    window.applyTheme = applyTheme; // usado por config_viajero.html al guardar preferencias

    // ── CHECKBOX DE TEMA EN PÁGINA DE CONFIGURACIÓN ──
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = document.body.classList.contains('dark-mode');
        themeToggle.addEventListener('change', function() { applyTheme(this.checked); });
    }

    // ── LOGOUT DESDE EL SIDEBAR ──
    var logoutEl = document.getElementById('sidebarLogout');
    if (logoutEl) logoutEl.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('te_session'); // Borramos la sesión
        window.location.href = '../index.html'; // Redirigimos al inicio
    });

    // (El widget de sesión de la navbar -avatar, nombre, dropdown- ya no se
    // construye aquí: lo arma login.js/applySession() automáticamente, igual
    // que en el resto del sitio, siempre que login.js esté cargado en la página.)

    // ── FILTROS DE RESERVAS ──
    // Botones para filtrar por estado (Todas, Activas, Completadas, etc.)
    document.querySelectorAll('.pu-filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            // Quitamos 'active' de todos los botones y se la ponemos solo al que se hizo clic
            document.querySelectorAll('.pu-filter-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });
    });

    // ══════════════════════════════════════════════════════
    //  HISTORIAL DE RESERVAS — carga desde la BD
    // ══════════════════════════════════════════════════════
    var API_RESERVAS = window.location.origin + '/Tourismeasy/reservas/get_reservas.php';

    var METODOS_LABEL = {
        'CARD': { label: 'Tarjeta (crédito/débito)', icon: 'fa-credit-card' },
        'PSE':  { label: 'PSE',                      icon: 'fa-university' },
        'NEQUI':{ label: 'Nequi',                    icon: 'fa-mobile-alt' },
        'BANCOLOMBIA_TRANSFER': { label: 'Bancolombia', icon: 'fa-university' },
        'DAVIPLATA': { label: 'Daviplata',            icon: 'fa-mobile-alt' },
    };

    function fmtCOP(n) { return '$' + Number(n || 0).toLocaleString('es-CO'); }

    window.TECargarHistorial = function() {
        var sess = sessionStorage.getItem('te_session');
        if (!sess) return;
        var user;
        try { user = JSON.parse(sess); } catch(e) { return; }

        var tbody = document.querySelector('.pu-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1.5rem;opacity:.6">' +
            '<i class="fa-solid fa-spinner fa-spin"></i> Cargando reservas...</td></tr>';

        fetch(API_RESERVAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: user.id })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.ok || !data.reservas || !data.reservas.length) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1.5rem;opacity:.6">' +
                    'No tienes reservas aún.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            data.reservas.forEach(function(r) {
                var metodo  = (r.metodo_pago || '').toUpperCase();
                var mInfo   = METODOS_LABEL[metodo] || { label: metodo || 'Wompi', icon: 'fa-credit-card' };
                var estado  = (r.estado || '').toUpperCase();
                var estadoMap = {
                    'ACTIVA':     ['ACTIVA',      'estado-activo'],
                    'EN_CURSO':   ['EN CURSO',     'estado-en-curso'],
                    'COMPLETADA': ['COMPLETADA',   'estado-completado'],
                    'CANCELADA':  ['CANCELADA',    'estado-cancelado'],
                };
                var eInfo = estadoMap[estado] || [estado, 'estado-cancelado'];
                var fecha = (r.fecha_reserva || '').split('T')[0];
                var nombre = (r.nom_servicio || r.tipo_servicio || 'Servicio').toUpperCase();
                var total  = parseInt(r.monto_pesos || 0);

                var tr = document.createElement('tr');
                tr.className = 'pu-table__row';

                // ── Data-attributes para abrirRecibo() ──
                tr.dataset.idReserva          = r.id_reserva           || '';
                tr.dataset.epaycoRefPayco      = r.epayco_ref_payco     || '';
                tr.dataset.epaycoTransactionId = r.epayco_transaction_id|| '';
                tr.dataset.referencia          = r.referencia           || '';
                tr.dataset.montoPesos          = r.monto_pesos          || 0;
                tr.dataset.moneda              = r.moneda               || 'COP';
                tr.dataset.estadoEpayco        = r.estado_epayco        || r.estado_pago || '';
                tr.dataset.metodoPago          = r.metodo_pago          || '';
                tr.dataset.fechaCreacion       = (r.fecha_creacion || '').split('T')[0];
                tr.dataset.idCiudad            = '68001';
                tr.dataset.precioUnitario      = r.monto_pesos          || 0;
                tr.dataset.subtotal            = r.monto_pesos          || 0;
                tr.dataset.descuento           = 0;
                tr.dataset.iva                 = 0;
                tr.dataset.valorTotal          = r.monto_pesos          || 0;
                tr.dataset.servicio            = nombre;

                tr.innerHTML =
                    '<td class="pu-table__td pu-table__td--fecha">' + fecha + '</td>' +
                    '<td class="pu-table__td">' +
                        '<strong class="pu-table__servicio-nombre">' + nombre + '</strong>' +
                        '<small><i class="fa-solid ' + mInfo.icon + '"></i> ' + mInfo.label + '</small>' +
                    '</td>' +
                    '<td class="pu-table__td">' +
                        '<span class="' + eInfo[1] + '">' + eInfo[0] + '</span>' +
                    '</td>' +
                    '<td class="pu-table__td pu-table__td--total">' + fmtCOP(total) + '</td>' +
                    '<td class="pu-table__td pu-table__td--center">' +
                        '<button class="pu-btn-secondary te-btn-recibo" title="Ver recibo">' +
                            '<i class="fa-solid fa-file-pdf"></i>' +
                        '</button>' +
                    '</td>';

                // Evento al botón PDF
                tbody.appendChild(tr);
                var btnPDF = tr.querySelector('.te-btn-recibo');
                if (btnPDF) btnPDF.addEventListener('click', function() {
                    if (window.teAbrirRecibo) window.teAbrirRecibo(tr);
                });
            });
        })
        .catch(function() {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:#f87171">' +
                'Error al cargar reservas.</td></tr>';
        });
    };

    // Llamar al cargar la página si estamos en reservas_viajero
    if (window.location.pathname.includes('reservas_viajero')) {
        // Esperar a que carrito.js también haya cargado
        document.addEventListener('DOMContentLoaded', function() {
            window.TECargarHistorial();
        });
    }

})(); // Fin del IIFE principal