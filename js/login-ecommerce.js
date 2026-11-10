(function() {
    var API_BASE = new URL('../e-commerce', window.location.href).href;

    // El modo oscuro ahora lo maneja el componente compartido dark-mode-toggle.js
    // (mismo botón #darkModeToggle, misma llave 'theme' en localStorage que el resto del sitio).

    // Si admin.php nos devolvió aquí porque la sesión de PHP ya no era válida,
    // limpiamos el sessionStorage viejo del navegador. Si no hacemos esto, el
    // siguiente bloque (¿ya hay sesión activa?) seguiría viendo los datos viejos
    // y nos volvería a mandar para admin.php, armando un loop infinito de
    // redirecciones entre esta página y admin.php.
    var sessionExpiredByDevice = new URLSearchParams(window.location.search).get('sesion_expirada') === '1';
    if (sessionExpiredByDevice) {
        window.TourismSession.clear();
        sessionStorage.removeItem('te_ecommerce_login_approval');
        // Limpiamos el parámetro de la URL para que no quede ahí si el usuario recarga
        window.history.replaceState({}, '', window.location.pathname);
    }

    // ── Si ya hay sesión activa redirigir ──
    try {
        var sess = window.TourismSession.get();
        if (sess && sess.tipo === 'artesano') {
            window.location.href = '../e-commerce/admin.php';
            return;
        }
    } catch (error) {
        console.error('No se pudo leer el estado de sesión del artesano.', error);
    }

    // Cargar tipos de documento desde el inicio
    cargarTiposDoc();

    // ── Toggle mostrar/ocultar contraseña ──
    document.querySelectorAll('.lec-toggle-pass').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var input = document.getElementById(btn.getAttribute('data-target'));
            var icon = btn.querySelector('i');
            if (!input) return;
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                btn.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                btn.setAttribute('aria-label', 'Mostrar contraseña');
            }
        });
    });

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

    if (sessionExpiredByDevice) {
        showMsg('loginMsg', 'La sesión de este equipo se cerró porque se autorizó el acceso desde otro dispositivo. Puedes volver a iniciar sesión aquí.', 'info');
    }

    // ── Cargar tipos de documento (hardcodeados de la BD) ──
    function cargarTiposDoc() {
        var tipos = [{
            id: 1,
            nombre: 'CEDULA DE CIUDADANIA'
        }, {
            id: 2,
            nombre: 'CEDULA DE EXTRANJERIA'
        }, ];
        var sel = document.getElementById('regTipoDoc');
        sel.replaceChildren(new Option('Selecciona', ''));
        var idsAgregados = new Set();
        tipos.forEach(function(t) {
            if (idsAgregados.has(String(t.id))) return;
            idsAgregados.add(String(t.id));
            var opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.nombre;
            sel.appendChild(opt);
        });
    }

    // ── LOGIN ──
    var approvalCodeSection = document.getElementById('approvalCodeSection');
    var approvalCodeInput = document.getElementById('approvalCode');
    var verifyApprovalButton = document.getElementById('btnVerifyApproval');
    var approvalStorageKey = 'te_ecommerce_login_approval';
    var pendingApproval = sessionStorage.getItem(approvalStorageKey) || '';
    var forgotLink = document.getElementById('forgotLink');
    var loginEmail = document.getElementById('loginEmail');
    var loginEmailMsg = document.getElementById('loginEmailMsg');
    var recoveryRequestPending = false;

    forgotLink.addEventListener('click', function(event) {
        event.preventDefault();
        var email = loginEmail.value.trim();
        hideMsg('loginMsg');
        loginEmailMsg.textContent = '';
        loginEmailMsg.className = 'lec-msg';
        if (!email) {
            loginEmailMsg.textContent = 'Escribe tu correo para enviarte el enlace de recuperación.';
            loginEmailMsg.classList.add('error');
            loginEmail.focus();
            return;
        }
        if (!loginEmail.checkValidity()) {
            loginEmailMsg.textContent = 'Revisa que el correo tenga un formato válido.';
            loginEmailMsg.classList.add('error');
            return;
        }
        if (recoveryRequestPending) return;

        recoveryRequestPending = true;
        forgotLink.setAttribute('aria-disabled', 'true');
        fetch('../recuperacion/solicitar_recuperacion.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, origen: 'ecommerce' })
        })
            .then(function(response) {
                return response.json().then(function(result) {
                    if (!response.ok || !result.success) {
                        throw new Error(result.message || 'No se pudo solicitar la recuperación.');
                    }
                    return result;
                });
            })
            .then(function() {
                return window.TEUI.alert({
                    title: 'Revisa tu correo',
                    message: 'Si ese correo está registrado, recibirás allí el enlace para recuperar tu contraseña.',
                    confirmText: 'Entendido',
                    tone: 'success'
                });
            })
            .catch(function(error) {
                showMsg('loginMsg', error.message || 'No se pudo conectar para solicitar la recuperación.', 'error');
            })
            .finally(function() {
                recoveryRequestPending = false;
                forgotLink.removeAttribute('aria-disabled');
            });
    });
    loginEmail.addEventListener('input', function() {
        loginEmailMsg.textContent = '';
        loginEmailMsg.className = 'lec-msg';
    });

    function iniciarSesion(solicitudAprobacion, codigoAprobacion) {
        hideMsg('loginMsg');
        if (!formLogin.reportValidity()) return;
        var btn = document.getElementById('btnLogin');
        btn.disabled = true;
        verifyApprovalButton.disabled = true;
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
                    solicitud_aprobacion: solicitudAprobacion || '',
                    codigo_aprobacion: codigoAprobacion || '',
                    captcha_token: !solicitudAprobacion && window.TeCaptcha ? window.TeCaptcha.getToken() : ''
                })
            })
            .then(function(response) {
                return response.json().then(function(data) {
                    return { response: response, data: data };
                });
            })
            .then(function(result) {
                var data = result.data;
                if (result.response.status === 409 && data.code === 'APROBACION_REQUERIDA') {
                    pendingApproval = data.solicitud;
                    sessionStorage.setItem(approvalStorageKey, pendingApproval);
                    approvalCodeSection.hidden = false;
                    showMsg('loginMsg', data.error, 'success');
                    approvalCodeInput.focus();
                    return;
                }
                if (!data.ok) {
                    showMsg('loginMsg', data.error || 'Error al iniciar sesión.', 'error');
                    if (!solicitudAprobacion && window.TeCaptcha) window.TeCaptcha.invalidateOnFailedLogin();
                    return;
                }
                sessionStorage.removeItem(approvalStorageKey);
                // Guardar sesión artesano
                if (!window.TourismSession.save(data.session)) {
                    throw new Error('La respuesta de sesión no es válida.');
                }
                window.location.href = '../e-commerce/admin.php';
            })
            .catch(function() {
                showMsg('loginMsg', 'No se pudo conectar con el servidor.', 'error');
            })
            .finally(function() {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Ingresar';
                verifyApprovalButton.disabled = false;
            });
    }

    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        iniciarSesion('', '');
    });
    verifyApprovalButton.addEventListener('click', function() {
        var codigo = approvalCodeInput.value.trim();
        if (!pendingApproval || !/^[0-9]{6}$/.test(codigo)) {
            showMsg('loginMsg', 'Escribe el código de 6 dígitos enviado al correo de la cuenta.', 'error');
            return;
        }
        iniciarSesion(pendingApproval, codigo);
    });
    approvalCodeInput.addEventListener('input', function() {
        approvalCodeInput.value = approvalCodeInput.value.replace(/\D/g, '').slice(0, 6);
    });
    if (pendingApproval) approvalCodeSection.hidden = false;

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