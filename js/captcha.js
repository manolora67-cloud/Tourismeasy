(function() {
    'use strict'; //use strict para evitar errores comunes y malas prácticas

    // Detecta si la página actual está dentro de la carpeta /html/ (como ya
    // se hace en resenas.js) para armar la ruta correcta a las imágenes,
    // sea que la página esté en la raíz del proyecto o en /html/.
    var _enHtml = window.location.pathname.includes('/html/');
    // Si la página anfitriona define window.TE_CAPTCHA_IMG_BASE ANTES de cargar este script,
    // se usa esa ruta tal cual. Esto es necesario para módulos que no viven en la estructura
    // estándar de TourismEasy (raíz / html/), como el login del e-commerce.
    var BASE_PATH = window.TE_CAPTCHA_IMG_BASE || (_enHtml ? '../img/' : 'img/');

    var CHALLENGES = [ //creacion dependiendo del tema
        {
            label: 'aventura',
            instruction: 'Selecciona todas las imágenes de <strong>aventura</strong>',
            images: [
                BASE_PATH + 'aventura/aventura1.jpg',
                BASE_PATH + 'aventura/aventura2.jpg',
                BASE_PATH + 'aventura/aventura3.jpg',
                BASE_PATH + 'aventura/aventura4.jpg',
            ]
        },
        {
            label: 'cascadas',
            instruction: 'Selecciona todas las imágenes de <strong>cascadas</strong>',
            images: [
                BASE_PATH + 'cascadas/cascada1.jpg',
                BASE_PATH + 'cascadas/cascada2.jpg',
                BASE_PATH + 'cascadas/cascada3.jpg',
                BASE_PATH + 'cascadas/cascada4.jpg',
            ]
        },
        {
            label: 'naturaleza',
            instruction: 'Selecciona todas las imágenes de <strong>naturaleza</strong>',
            images: [
                BASE_PATH + 'naturaleza/naturaleza1.jpg',
                BASE_PATH + 'naturaleza/naturaleza2.jpg',
                BASE_PATH + 'naturaleza/naturaleza3.jpg',
                BASE_PATH + 'naturaleza/naturaleza4.jpg',
            ]
        },
        {
            label: 'pueblos',
            instruction: 'Selecciona todas las imágenes de <strong>pueblos</strong>',
            images: [
                BASE_PATH + 'pueblos/pueblo1.png',
                BASE_PATH + 'pueblos/pueblo2.png',
                BASE_PATH + 'pueblos/pueblo3.png',
                BASE_PATH + 'pueblos/pueblo4.png',
            ]
        },
    ];

    var DISTRACTORS = [
        BASE_PATH + 'distractores/distractor1.jpg',
        BASE_PATH + 'distractores/distractor2.jpg',
        BASE_PATH + 'distractores/distractor3.jpg',
        BASE_PATH + 'distractores/distractor4.jpg',
        BASE_PATH + 'distractores/distractor5.jpg',
    ];

    function shuffle(arr) { //esta función mezcla un arreglo de forma aleatoria 
        var a = arr.slice(); // se crea una copia del arreglo original para no modificarlo
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1)); // se genera un índice aleatorio entre 0 e i
            var t = a[i];
            a[i] = a[j];
            a[j] = t; // se intercambian los elementos en las posiciones i y j
        }
        return a;
    }

    var state = {
        verified: false,
        correct: [], // índices de las imágenes correctas en la cuadrícula actual
        selected: [], // índices de las imágenes que el usuario ha seleccionado
        attempts: 0,
        loading: false
    };

    function buildWidget() { //esta función crea el contenedor principal del captcha y le asigna el html base
        var wrap = document.createElement('div');
        wrap.id = 'te-captcha-wrap';
        wrap.className = 'te-captcha-wrap';
        wrap.innerHTML = renderShell(); // Inserta el HTML base del CAPTCHA
        return wrap;
    }

    function renderShell() { //devuelve el html base
        return (
            '<div class="te-captcha-box" id="teCaptchaBox">' +
            '<div class="te-cap-header" id="teCapHeader">' +
            '<div class="te-cap-logo"><i class="fa-solid fa-shield-halved"></i></div>' +
            '<div class="te-cap-title-wrap">' +
            '<span class="te-cap-title">Verificación de seguridad</span>' +
            '<span class="te-cap-sub">Selecciona las imágenes correctas</span>' +
            '</div></div>' +
            '<div class="te-cap-progress"><div class="te-cap-progress-bar" id="teCapProgressBar"></div></div>' +
            '<div class="te-cap-instruction" id="teCapInstruction">Cargando desafío...</div>' +
            // aquí se insertarán las 9 imágenes dependiendo del desafío seleccionado
            '<div class="te-cap-grid" id="teCapGrid"></div>' +
            '<div class="te-cap-footer">' +
            '<button class="te-cap-refresh" id="teCapRefresh" type="button" title="Nuevo desafío">' +
            '<i class="fa-solid fa-rotate"></i></button>' +
            '<button class="te-cap-verify" id="teCapVerify" type="button" disabled>Verificar</button>' +
            '</div>' +
            '<div class="te-cap-msg" id="teCapMsg"></div>' +
            // Cuadro compacto que reemplaza visualmente a todo lo demás cuando el CAPTCHA ya fue verificado
            '<div class="te-cap-success-box" id="teCapSuccessBox">' +
            '<i class="fa-solid fa-circle-check"></i>' +
            '<span>Verificación completada</span>' +
            '</div>' +
            '</div>'
        );
    }

    // creacion de un nuevo captcha cada vez que se carga el widget o se falla un intento, se resetea todo
    function loadChallenge(wrap) {
        if (state.loading) return; //no cargar si ya está cargando
        state.loading = true;
        state.selected = [];
        state.correct = [];
        state.verified = false;

        // referencias a elementos del DOM dentro del widget
        var box = wrap.querySelector('#teCaptchaBox');
        var header = wrap.querySelector('#teCapHeader');
        var instr = wrap.querySelector('#teCapInstruction');
        var grid = wrap.querySelector('#teCapGrid'); //insertacion de las imágenes en esta sección
        var verifyBtn = wrap.querySelector('#teCapVerify');
        var msg = wrap.querySelector('#teCapMsg');
        var progressBar = wrap.querySelector('#teCapProgressBar');

        // se resetean estilos y mensajes de intentos anteriores
        box.classList.remove('te-cap-success', 'te-cap-shake', 'te-cap-collapsed');
        header.classList.remove('te-cap-header--ok');
        msg.className = 'te-cap-msg';
        msg.innerHTML = '';
        verifyBtn.disabled = true; // el btn de verificar se deshabilita hasta que todas las imágenes carguen
        progressBar.style.width = '0%';

        // se elige un nuevo captcha al azar de la lista de desafíos
        var ch = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
        instr.innerHTML = ch.instruction; // se muestra la instrucción correspondiente

        var correctImgs = shuffle(ch.images).slice(0, 4);

        var distImgs = shuffle(DISTRACTORS).slice(0, 5);

        // 4 correctas + 5 distractores = 9 imágenes totales para la cuadrícula
        var allImgs = correctImgs.concat(distImgs);
        var correctSet = correctImgs.slice(); //las img correctas se guardan para comparar luego con la selección del usuario
        allImgs = shuffle(allImgs); //se mexclan las imágenes para que no siempre estén en la misma posición

        state.correct = allImgs.reduce(function(acc, src, idx) { // se recorren las imágenes mezcladas y se guarda el índice de las correctas
            if (correctSet.indexOf(src) !== -1) acc.push(idx);
            return acc;
        }, []);

        // ── Construimos la cuadrícula de 9 celdas ──
        grid.innerHTML = '';
        var loadedCount = 0; // Contador de imágenes que ya cargaron

        allImgs.forEach(function(src, idx) {
            var cell = document.createElement('div');
            cell.className = 'te-cap-cell te-cap-cell--loading'; // Clase de "cargando"
            cell.dataset.idx = idx;
            // Accesibilidad: la celda actúa como checkbox
            cell.setAttribute('role', 'checkbox');
            cell.setAttribute('aria-checked', 'false');
            cell.setAttribute('tabindex', '0');

            // Spinner de carga mientras la imagen no ha llegado
            var spinner = document.createElement('div');
            spinner.className = 'te-cap-spinner';
            cell.appendChild(spinner);
            grid.appendChild(cell);

            var img = new Image(); // Creamos un objeto imagen para cargarla

            // ── Función que se ejecuta cuando la imagen termina de cargar ──
            var finalize = function() {
                cell.innerHTML = '';
                cell.classList.remove('te-cap-cell--loading');
                // Estilos para que la imagen llene la celda sin deformarse
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;transition:filter .15s;';
                cell.appendChild(img);

                // Ícono de ✓ que se muestra cuando la celda está seleccionada
                var check = document.createElement('div');
                check.className = 'te-cap-check';
                check.innerHTML = '<i class="fa-solid fa-check"></i>';
                cell.appendChild(check);

                loadedCount++;
                // Actualizamos la barra de progreso
                progressBar.style.width = Math.round(loadedCount / 9 * 100) + '%';

                if (loadedCount === 9) {
                    // Todas las imágenes cargaron → habilitamos el botón Verificar
                    verifyBtn.disabled = false;
                    state.loading = false;
                    setTimeout(function() { progressBar.style.width = '0%'; }, 400);
                }
            };

            img.onload = finalize;

            // ── Si la imagen no existe o no carga ──
            img.onerror = function() {
                // Mostramos una celda gris con ícono de imagen rota
                cell.innerHTML = '';
                cell.classList.remove('te-cap-cell--loading');
                cell.style.cssText = 'background:#f3f4f6;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4px;';
                cell.innerHTML = '<i class="fa-solid fa-image" style="color:#9ca3af;font-size:1.4rem;"></i>' +
                    '<span style="font-size:0.6rem;color:#9ca3af;">sin imagen</span>';

                // Igual añadimos el check para no romper la lógica de selección
                var check = document.createElement('div');
                check.className = 'te-cap-check';
                check.innerHTML = '<i class="fa-solid fa-check"></i>';
                cell.appendChild(check);

                loadedCount++;
                progressBar.style.width = Math.round(loadedCount / 9 * 100) + '%';
                if (loadedCount === 9) {
                    verifyBtn.disabled = false;
                    state.loading = false;
                    setTimeout(function() { progressBar.style.width = '0%'; }, 400);
                }
            };

            img.src = src; // Esto dispara la carga de la imagen

            // ── Al hacer clic en una celda: seleccionarla o deseleccionarla ──
            cell.addEventListener('click', function() {
                if (state.verified || state.loading) return; // Ignorar si ya está verificado o cargando

                var cidx = parseInt(this.dataset.idx);
                var pos = state.selected.indexOf(cidx);

                if (pos === -1) {
                    // No estaba seleccionada → la añadimos
                    state.selected.push(cidx);
                    this.classList.add('selected');
                    this.setAttribute('aria-checked', 'true');
                } else {
                    // Ya estaba seleccionada → la deseleccionamos
                    state.selected.splice(pos, 1);
                    this.classList.remove('selected');
                    this.setAttribute('aria-checked', 'false');
                }

                // Limpiamos mensajes de error anteriores al cambiar la selección
                var m = wrap.querySelector('#teCapMsg');
                m.className = 'te-cap-msg';
                m.innerHTML = '';
            });

            // Soporte de teclado: Space y Enter activan la celda (accesibilidad)
            cell.addEventListener('keydown', function(e) {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }

    // ── Muestra el estado de éxito cuando el usuario acertó ──
    function showSuccess(wrap) {
        state.verified = true;
        var box = wrap.querySelector('#teCaptchaBox');
        box.classList.add('te-cap-success');
        wrap.querySelector('#teCapHeader').classList.add('te-cap-header--ok');
        wrap.querySelector('#teCapVerify').disabled = true;

        var msg = wrap.querySelector('#teCapMsg');
        msg.className = 'te-cap-msg te-cap-msg--ok';
        msg.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verificación completada';

        // Marcamos las celdas correctas como "confirmadas"
        wrap.querySelectorAll('.te-cap-cell.selected').forEach(function(c) { c.classList.add('confirmed'); });

        // Colapsamos el widget: se oculta la cuadrícula/instrucción/footer y se muestra
        // únicamente el cuadro compacto verde "Verificación completada".
        box.classList.add('te-cap-collapsed');

        // Disparamos un evento personalizado para que login.js sepa que el CAPTCHA fue resuelto
        wrap.dispatchEvent(new CustomEvent('captcha:verified', { bubbles: true }));
    }

    // ── Muestra el error y recarga un nuevo desafío automáticamente ──
    function showError(wrap) {
        state.attempts++;
        var box = wrap.querySelector('#teCaptchaBox');
        // Animación de "sacudida" para indicar error
        box.classList.add('te-cap-shake');
        setTimeout(function() { box.classList.remove('te-cap-shake'); }, 600);

        var msg = wrap.querySelector('#teCapMsg');
        msg.className = 'te-cap-msg te-cap-msg--err';
        msg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Selección incorrecta, intenta de nuevo';

        // Después de 1.2 segundos cargamos un nuevo desafío
        setTimeout(function() { loadChallenge(wrap); }, 1200);
    }

    // ── Muestra aviso cuando el usuario intenta enviar el form sin completar el CAPTCHA ──
    function showCaptchaRequired(wrap) {
        var msg = wrap.querySelector('#teCapMsg');
        if (!msg) return;
        msg.className = 'te-cap-msg te-cap-msg--warn';
        msg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Debes completar el CAPTCHA para continuar';
        var box = wrap.querySelector('#teCaptchaBox');
        if (box) {
            box.classList.add('te-cap-shake');
            setTimeout(function() { box.classList.remove('te-cap-shake'); }, 600);
        }
    }

    // ── Asigna los eventos a los botones del widget ──
    function initEvents(wrap) {
        // Botón "Verificar": compara la selección del usuario con las respuestas correctas
        wrap.querySelector('#teCapVerify').addEventListener('click', function() {
            if (state.verified || state.loading) return;
            // Ordenamos ambos arreglos y los convertimos a string para comparar fácilmente
            var sel = state.selected.slice().sort().join(',');
            var cor = state.correct.slice().sort().join(',');
            if (sel === cor) { showSuccess(wrap); } else { showError(wrap); }
        });

        // Botón de refresh (↺): carga un nuevo desafío diferente
        wrap.querySelector('#teCapRefresh').addEventListener('click', function() {
            loadChallenge(wrap);
        });
    }

    // ── API pública: otros scripts pueden usar estas funciones ──
    window.TeCaptcha = {
        isVerified: function() { return state.verified; }, // ¿Fue verificado?
        showRequired: function() { var w = document.getElementById('te-captcha-wrap'); if (w) showCaptchaRequired(w); }, // Mostrar aviso
        reset: function() { var w = document.getElementById('te-captcha-wrap'); if (w) loadChallenge(w); }, // Resetear (nuevo desafío + quita el colapso verde)
        // Se debe llamar cuando el backend responde que el login fue inválido (usuario/clave incorrectos).
        // Esto obliga a resolver el CAPTCHA de nuevo antes de poder reintentar, aunque ya estuviera verificado.
        invalidateOnFailedLogin: function() {
            var w = document.getElementById('te-captcha-wrap');
            if (w) loadChallenge(w);
        }
    };

    // Alternativa desacoplada: si login.js no quiere importar/llamar directamente a TeCaptcha,
    // puede simplemente disparar este evento en el document cuando el login falle:
    //   document.dispatchEvent(new CustomEvent('te-login-failed'));
    document.addEventListener('te-login-failed', function() {
        var w = document.getElementById('te-captcha-wrap');
        if (w) loadChallenge(w);
    });

    // ── Inyecta el widget dentro del formulario de login ──
    function inject() {
        // Buscamos el formulario de login por varios selectores posibles
        var loginForm =
            document.getElementById('formLogin') ||
            document.querySelector('.auth-form.active') ||
            document.querySelector('#tabLogin') ||
            document.querySelector('[data-form="login"]') ||
            document.querySelector('.auth-form');

        // Si no hay formulario o ya se inyectó el CAPTCHA, no hacemos nada
        if (!loginForm || document.getElementById('te-captcha-wrap')) return;

        var widget = buildWidget();
        initEvents(widget);

        // Buscamos el botón de submit del form para insertar el CAPTCHA justo antes
        var submitBtn =
            loginForm.querySelector('.btn-auth') ||
            loginForm.querySelector('button[type="submit"]') ||
            loginForm.querySelector('button');

        if (submitBtn) { loginForm.insertBefore(widget, submitBtn); } else { loginForm.appendChild(widget); }

        loadChallenge(widget); // Cargamos el primer desafío

        if (submitBtn) {
            // Reemplazamos el botón para poder interceptar su clic ANTES que otros eventos
            var newBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newBtn, submitBtn);
            newBtn.addEventListener('click', function(e) {
                if (!state.verified) {
                    // Si el CAPTCHA no está resuelto, bloqueamos el envío
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    showCaptchaRequired(widget);
                    return false;
                }
            }, true); // true = captura el evento antes que otros listeners
        }

        // Segunda línea de defensa: también interceptamos el submit del form
        loginForm.addEventListener('submit', function(e) {
            if (!state.verified) {
                e.preventDefault();
                showCaptchaRequired(widget);
            }
        }, true);
    }

    // ── Inyecta el CAPTCHA y observa cambios en el DOM ──
    // Necesario porque el modal de login se inserta dinámicamente por login.js
    function waitAndInject() {
        inject();
        // MutationObserver detecta cuando aparecen nuevos elementos en la página
        var observer = new MutationObserver(function() {
            // Si el CAPTCHA fue eliminado del DOM (ej: modal cerrado y reabierto), lo volvemos a inyectar
            if (!document.getElementById('te-captcha-wrap')) inject();
        });
        // Observamos cambios en todo el body: hijos nuevos, subárbol, atributos de clase
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    // Esperamos a que el DOM esté listo antes de intentar inyectar
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', waitAndInject); } else { waitAndInject(); }

})();