(function() {
    var API_BASE = window.location.origin + '/Tourismeasy/e-commerce';

    // El modo oscuro ahora lo maneja el componente compartido dark-mode-toggle.js
    // (mismo botón #darkModeToggle, misma llave 'theme' en localStorage que el resto del sitio).

    // Si admin.php nos devolvió aquí porque la sesión de PHP ya no era válida,
    // limpiamos el sessionStorage viejo del navegador. Si no hacemos esto, el
    // siguiente bloque (¿ya hay sesión activa?) seguiría viendo los datos viejos
    // y nos volvería a mandar para admin.php, armando un loop infinito de
    // redirecciones entre esta página y admin.php.
    if (new URLSearchParams(window.location.search).get('sesion_expirada') === '1') {
        sessionStorage.removeItem('te_ecommerce_session');
        // Limpiamos el parámetro de la URL para que no quede ahí si el usuario recarga
        window.history.replaceState({}, '', window.location.pathname);
    }

    // ── Si ya hay sesión activa redirigir ──
    try {
        var sess = JSON.parse(sessionStorage.getItem('te_ecommerce_session') || 'null');
        if (sess && sess.tipo === 'artesano' && sess.estado === 'ACTIVO') {
            window.location.href = '../e-commerce/admin.php';
            return;
        }
    } catch (e) {}

    // Cargar tipos de documento desde el inicio
    cargarTiposDoc();

    // ── Tabs ──
    var tabLogin = document.getElementById('tabLogin');
    var tabRegister = document.getElementById('tabRegister');
    var formLogin = document.getElementById('formLogin');
    var formRegister = document.getElementById('formRegister');

    tabLogin.addEventListener('click', function() {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.add('active');
        formRegister.classList.remove('active');
    });
    tabRegister.addEventListener('click', function() {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.classList.add('active');
        formLogin.classList.remove('active');
        cargarTiposDoc();
    });

    // ── Helpers ──
    function showMsg(id, texto, tipo) {
        var el = document.getElementById(id);
        el.textContent = texto;
        el.className = 'lec-msg ' + tipo;
    }

    function hideMsg(id) {
        document.getElementById(id).className = 'lec-msg';
    }

    // ── Cargar tipos de documento (hardcodeados de la BD) ──
    var tiposDocCargados = false;

    function cargarTiposDoc() {
        if (tiposDocCargados) return;
        var tipos = [{
            id: 1,
            nombre: 'CEDULA DE CIUDADANIA'
        }, {
            id: 2,
            nombre: 'CEDULA DE EXTRANJERIA'
        }, ];
        var sel = document.getElementById('regTipoDoc');
        tipos.forEach(function(t) {
            var opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.nombre;
            sel.appendChild(opt);
        });
        tiposDocCargados = true;
    }

    // ── LOGIN ──
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        hideMsg('loginMsg');
        var btn = document.getElementById('btnLogin');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';

        fetch(API_BASE + '/login_artesano.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: document.getElementById('loginEmail').value.trim(),
                    password: document.getElementById('loginPassword').value,
                })
            })
            .then(function(r) {
                return r.json();
            })
            .then(function(data) {
                if (!data.ok) {
                    showMsg('loginMsg', data.error || 'Error al iniciar sesión.', 'error');
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Ingresar';
                    // El login falló: aunque el CAPTCHA ya estuviera resuelto, obligamos a
                    // resolverlo de nuevo antes de permitir otro intento.
                    if (window.TeCaptcha) window.TeCaptcha.invalidateOnFailedLogin();
                    return;
                }
                // Guardar sesión artesano
                sessionStorage.setItem('te_ecommerce_session', JSON.stringify(data.session));
                window.location.href = '../e-commerce/admin.php';
            })
            .catch(function() {
                showMsg('loginMsg', 'No se pudo conectar con el servidor.', 'error');
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Ingresar';
            });
    });

    // ── REGISTRO ──
    formRegister.addEventListener('submit', function(e) {
        e.preventDefault();
        hideMsg('registerMsg');

        var pass = document.getElementById('regPassword').value;
        var pass2 = document.getElementById('regPassword2').value;

        if (pass !== pass2) {
            showMsg('registerMsg', 'Las contraseñas no coinciden.', 'error');
            return;
        }

        var btn = document.getElementById('btnRegister');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

        fetch(API_BASE + '/registro_artesano.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    documento: document.getElementById('regDocumento').value.trim(),
                    tipo_doc: parseInt(document.getElementById('regTipoDoc').value),
                    nombre: document.getElementById('regNombre').value.trim(),
                    apellido: document.getElementById('regApellido').value.trim(),
                    celular: document.getElementById('regCelular').value.trim(),
                    email: document.getElementById('regEmail').value.trim(),
                    password: pass,
                })
            })
            .then(function(r) {
                return r.json();
            })
            .then(function(data) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Enviar solicitud';
                if (!data.ok) {
                    showMsg('registerMsg', data.error || 'Error al registrar.', 'error');
                    return;
                }
                showMsg('registerMsg', '✅ ' + data.mensaje, 'success');
                formRegister.reset();
            })
            .catch(function() {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Enviar solicitud';
                showMsg('registerMsg', 'No se pudo conectar con el servidor.', 'error');
            });
    });

})();