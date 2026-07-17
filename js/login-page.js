(function() {

    /* ── Si ya hay sesión activa, redirigir al inicio directamente ── */
    try {
        var session = JSON.parse(sessionStorage.getItem('te_session'));
        if (session && session.tipo) {
            window._loginSuccess = true;
            if (session.tipo === 'admin') {
                window.location.href = 'panel_admin.html';
            } else if (session.tipo === 'empresa') {
                var _sess = JSON.parse(sessionStorage.getItem('te_session') || 'null');
                var _pm = { transporte: 'panel_transporte.html', hospedaje: 'panel_hospedaje.html', planes: 'panel_planes.html', auxiliar: 'panel_auxiliar.html', personal_auxiliar: 'panel_auxiliar.html' };
                window.location.href = _pm[(_sess && _sess.tipoServicio || '').toLowerCase()] || 'panel_transporte.html';
            } else {
                window.location.href = 'index.html';
            }
            // Detener la ejecución del resto del script
            return;
        }
    } catch (e) {}

    /* ── Dark mode ──────────────────────────────────────── */
    var darkBtn = document.getElementById('darkModeToggle');
    var icon = darkBtn ? darkBtn.querySelector('i') : null;

    function applyTheme(dark) {
        document.body.classList.toggle('dark-mode', dark);
        if (icon) icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    }

    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved ? saved === 'dark' : prefersDark);

    if (darkBtn) {
        darkBtn.addEventListener('click', function() {
            applyTheme(!document.body.classList.contains('dark-mode'));
        });
    }

    /* ── Confirmación al cerrar/recargar la pestaña (X del navegador) ── */
    window.addEventListener('beforeunload', function(e) {
        if (!window._loginSuccess) {
            e.preventDefault();
            e.returnValue = '¿Seguro que quieres salir? Perderás el progreso del formulario.';
            return e.returnValue;
        }
    });

    /* ── Confirmación al pulsar la flecha ← Volver al inicio ── */
    var btnBack = document.querySelector('.btn-back-home');
    if (btnBack) {
        btnBack.addEventListener('click', function(e) {
            e.preventDefault();

            var confirmed = window.confirm(
                '¿Seguro que deseas salir?\nPerderás el progreso del formulario.'
            );

            if (confirmed) {
                window._loginSuccess = true;
                window.history.back();
            }
        });
    }

    /* ── Montar el formulario en la página ──────────────── */
    function mountLoginInPage() {
        var overlay = document.getElementById('authOverlay');
        var card = document.getElementById('loginPageCard');

        if (!overlay || !card) {
            return setTimeout(mountLoginInPage, 50);
        }

        var authBox = document.getElementById('authBox');
        if (authBox) {
            card.appendChild(authBox);
        }

        // Eliminar el overlay vacío del DOM
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }

        // Mostrar el formulario de login por defecto
        var formLogin = document.getElementById('formLogin');
        if (formLogin) formLogin.classList.add('active');

        // Al completar login / cerrar: volver al inicio SIN mostrar confirmación
        if (window.TourismAuth) {
            window.TourismAuth.close = function() {
                window._loginSuccess = true;
                window.history.back();
            };
        }
    }

    mountLoginInPage();

})();