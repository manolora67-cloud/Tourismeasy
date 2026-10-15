(function () {
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
            user.nombre.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase() :
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
        themeToggle.addEventListener('change', function () { applyTheme(this.checked); });
    }

    // ── LOGOUT DESDE EL SIDEBAR ──
    var logoutEl = document.getElementById('sidebarLogout');
    if (logoutEl) logoutEl.addEventListener('click', function (e) {
        e.preventDefault();
        sessionStorage.removeItem('te_session'); // Borramos la sesión
        window.location.href = '../index.html'; // Redirigimos al inicio
    });

    // (El widget de sesión de la navbar -avatar, nombre, dropdown- ya no se
    // construye aquí: lo arma login.js/applySession() automáticamente, igual
    // que en el resto del sitio, siempre que login.js esté cargado en la página.)

})(); // Fin del IIFE principal