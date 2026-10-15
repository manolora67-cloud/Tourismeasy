(function () {

    // ── Referencias a los elementos del HTML ──
    var anonGroup = document.getElementById("resenaAnonGroup");
    var nombreAnonimoInput = document.getElementById("resenaNombreAnonimo");
    var formBox = document.getElementById("resenaFormBox");
    var gracias = document.getElementById("resenaGracias");
    var loginBtn = document.getElementById("resenaLoginBtn");
    var stars = document.querySelectorAll(".resena-star");
    var textarea = document.getElementById("resenaTexto");
    var charCount = document.getElementById("resenaCharCount");
    var submitBtn = document.getElementById("resenaSubmit");
    var sliderTrack = document.getElementById("sliderTrack");
    var rating = 0;

    // ── Rutas a los PHP ──
    var _enHtml = window.location.pathname.includes("/html/");
    var BASE = _enHtml ? "../resenas/" : "resenas/";
    var URL_GET = BASE + "get_resenas.php";
    var URL_ACCION = BASE + "accion_resena.php";

    // ── Lee la sesión activa ──
    function getSess() {
        return JSON.parse(sessionStorage.getItem("te_session") || "null") ||
            JSON.parse(localStorage.getItem("te_session") || "null");
    }

    // ── Identificador de visitante (para dar like sin cuenta) ──
    // Se genera una sola vez por navegador y se guarda en localStorage,
    // así el "ya le di like" se conserva aunque recargue la página.
    function getVisitorId() {
        var KEY = "te_visitor_id";
        var id = localStorage.getItem(KEY);
        if (!id) {
            id = "v_" + Date.now().toString(36) + "_" +
                Math.random().toString(36).slice(2) +
                Math.random().toString(36).slice(2);
            localStorage.setItem(KEY, id);
        }
        return id;
    }

    // ── Muestra el campo "Tu nombre" solo si no hay sesión de viajero ──
    // (el formulario en sí ahora está siempre visible: cualquiera puede
    // publicar, con cuenta o sin ella)
    function checkSession() {
        var sess = getSess();
        var esViajero = sess && sess.tipo === "viajero" && (sess.nombre || sess.name);
        if (anonGroup) anonGroup.style.display = esViajero ? "none" : "block";
    }
    checkSession();

    // Precarga en segundo plano las listas de groserías (EN+ES) para que
    // el primer envío de reseña no tenga que esperar la descarga.
    prepararFiltro();

    // Re-chequea si el usuario cierra el modal de login
    document.addEventListener("click", function (e) {
        var overlay = document.getElementById("authDialog") ||
            document.getElementById("loginModal") ||
            document.getElementById("loginOverlay");
        if (overlay && (e.target === overlay || e.target.classList.contains("modal-close"))) {
            setTimeout(checkSession, 200);
        }
    });

    window.addEventListener("storage", function (e) {
        if (e.key === "te_session") checkSession();
    });

    setInterval(function () {
        var sess = getSess();
        if (sess && sess.tipo === "viajero" && anonGroup && anonGroup.style.display !== "none") checkSession();
    }, 800);

    // (Antes este botón abría el modal flotante de login con
    // window.TourismAuth.open(). Ahora se deja que el <a> navegue
    // normalmente a login.html, igual que el resto de enlaces de login.)

    // ── Interactividad de estrellas ──
    stars.forEach(function (star) {
        star.addEventListener("mouseover", function () {
            var val = +this.dataset.val;
            stars.forEach(function (s) { s.classList.toggle("hovered", +s.dataset.val <= val); });
        });
        star.addEventListener("mouseout", function () {
            stars.forEach(function (s) { s.classList.remove("hovered"); });
        });
        star.addEventListener("click", function () {
            rating = +this.dataset.val;
            stars.forEach(function (s) { s.classList.toggle("selected", +s.dataset.val <= rating); });
        });
    });

    textarea.addEventListener("input", function () {
        charCount.textContent = this.value.length + " / 140";
    });

    // ── Helpers ──────────────────────────────────────────────────────────

    function buildStarsHtml(val) {
        var h = "";
        for (var i = 1; i <= 5; i++)
            h += '<span style="color:' + (i <= val ? "#f59e0b" : "#cbd5e1") + '">&#9733;</span>';
        return h;
    }

    /**
     * Convierte una fecha ISO en texto relativo: "hace 2 días", "hace 1 mes", etc.
     */
    function tiempoRelativo(fechaStr) {
        if (!fechaStr) return "";
        var ahora = Date.now();
        var entonces = new Date(fechaStr).getTime();
        var diff = Math.max(0, ahora - entonces); // ms
        var mins = Math.floor(diff / 60000);
        var horas = Math.floor(diff / 3600000);
        var dias = Math.floor(diff / 86400000);
        var meses = Math.floor(dias / 30);
        var anos = Math.floor(dias / 365);

        if (mins < 1) return "Ahora mismo";
        if (mins < 60) return "Hace " + mins + (mins === 1 ? " minuto" : " minutos");
        if (horas < 24) return "Hace " + horas + (horas === 1 ? " hora" : " horas");
        if (dias < 30) return "Hace " + dias + (dias === 1 ? " día" : " días");
        if (meses < 12) return "Hace " + meses + (meses === 1 ? " mes" : " meses");
        return "Hace " + anos + (anos === 1 ? " año" : " años");
    }

    /**
     * Filtro de groserías en inglés + español.
     *
     * Ya no depende 100% de que la librería externa "bad-words" (window.Filter)
     * esté bien cargada -- si está disponible la usa, pero si no (por ejemplo
     * porque el CDN cambió de ruta, como pasó), se arma un filtro propio con
     * las mismas listas de palabras, así nunca se queda sin funcionar.
     *
     * Las listas de palabras (inglés y español) vienen de la librería pública
     * "naughty-words" (LDNOOBW), descargadas una sola vez y cacheadas.
     */
    var _filterListo = null; // Promise que resuelve cuando el filtro ya tiene las listas cargadas

    // Filtro propio, sin dependencias externas: reemplaza palabra por palabra
    // (respetando límites de palabra) por "$" repetido.
    function crearFiltroPropio(palabras) {
        var set = new Set(
            palabras.filter(Boolean).map(function (w) { return String(w).toLowerCase(); })
        );
        return {
            clean: function (texto) {
                return String(texto).replace(/[\p{L}\p{N}'’]+/gu, function (match) {
                    return set.has(match.toLowerCase()) ? "$".repeat(match.length) : match;
                });
            }
        };
    }

    function prepararFiltro() {
        if (_filterListo) return _filterListo;

        _filterListo = (async function () {
            // Palabras propias que sí o sí queremos cubrir en español colombiano,
            // por si la lista pública no las trae o vienen sin tildes/variantes.
            var palabras = [
                "mierda", "puto", "puta", "malparido", "malparida", "hijueputa", "hijueputas", "gonorrea", "perra", "sapoperrohijueputa", "sapoperrohijueputas", "marica", "maricon", "maricón",
                "pendejo", "pendeja", "verga", "coño", "cabrón", "cabróna", "cabrónas", "culiado", "culiada", "culiadas", "culiados", "zorra", "zorras", "chucha", "perrohijueputa", "perro",
                "perrahijueputa", "perrahijueputas", "hijueputo", "hijueputos", "malparidos", "malparidas", "Pirobo", "Pirobos", "Piroba", "Pirobas", "Carechimba", "Carechimbas", "Sapoperro",
                "Sapoperros", "Sapoperra", "Sapoperras", "Culicagado", "Culicagados", "Culicagada", "Culicagadas", "Churria", "Maricona", "Mariconas", "Maricones", "Pendejos", "Pendejas", "Verga",
                "Vergas", "Coños", "Vagina", "Vaginas", "Culo", "Culos", "Cacorro", "Cacorros", "Cacorra", "Cacorras", "Monda", "Pene", "Penes", "Sapo", "Sapos", "Sapa", "Sapas", "Pichurria",
                "Pichurrias", "Putamadre", "Putamadres", "Perras", "Caremonda", "Perros", "Sapahijueputa", "Sapohijueputa"
            ];

            try {
                var [en, es] = await Promise.all([
                    fetch("https://cdn.jsdelivr.net/npm/naughty-words@1.2.0/en.json").then(function (r) { return r.json(); }),
                    fetch("https://cdn.jsdelivr.net/npm/naughty-words@1.2.0/es.json").then(function (r) { return r.json(); })
                ]);
                palabras = palabras.concat(en, es);
            } catch (e) {
                console.warn("[TourismEasy] No se pudo cargar la lista extendida de groserías, se usa solo la lista básica.", e);
            }

            // Si la librería externa bad-words sí está disponible, se usa
            // (mantiene el mismo comportamiento de antes en los equipos donde
            // sí carga bien).
            if (window.Filter) {
                try {
                    var filter = new window.Filter({ placeHolder: "$" });
                    filter.addWords.apply(filter, palabras);
                    return filter;
                } catch (e) {
                    console.warn("[TourismEasy] Falló bad-words, se usa el filtro propio.", e);
                }
            }

            // Filtro propio (sin dependencias externas)
            return crearFiltroPropio(palabras);
        })();

        return _filterListo;
    }

    /**
     * Pasa el texto por el filtro (inglés + español).
     */
    async function limpiarTexto(texto) {
        var filter = await prepararFiltro();
        if (!filter) return texto;
        try {
            return filter.clean(texto);
        } catch (e) {
            console.error("Error en filtro de palabras:", e);
            return texto;
        }
    }

    // ── Construir tarjeta ─────────────────────────────────────────────────

    function buildCard(r) {
        var partes = (r.nombre || "Viajero").trim().split(" ");
        var iniciales = (partes[0][0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
        var sessMine = getSess();
        var esMia = sessMine && sessMine.id && String(sessMine.id) === String(r.id_persona);
        var esViajero = sessMine && sessMine.tipo === "viajero";

        // No puede dar like a su propia reseña (solo se puede probar la
        // autoría cuando hay cuenta; una reseña anónima no se puede "autolikear"
        // porque no hay forma de saber si el visitante es el mismo autor)
        var puedelikeear = !esMia;
        var likesCount = parseInt(r.likes) || 0;

        // Estado real: ¿el usuario actual ya le dio like a esta reseña?
        // (viene calculado desde el backend, así se conserva al recargar)
        var yaLeDiLike = !!(parseInt(r.ya_di_like) || 0);

        // Botones de editar / borrar solo en reseñas propias
        var acciones = "";
        if (esMia) {
            acciones =
                '<div class="resena-acciones">' +
                '<button class="resena-btn-editar" data-id="' + r.id + '" title="Editar"> Editar</button>' +
                '<button class="resena-btn-borrar" data-id="' + r.id + '" title="Borrar"> Borrar</button>' +
                '</div>';
        }

        // Botón de like
        var likeClass = puedelikeear ? "resena-btn-like" : "resena-btn-like disabled";
        if (yaLeDiLike) likeClass += " liked";
        var likeTitle = puedelikeear ?
            "¿Te gustó esta reseña?" :
            "No puedes dar like a tu propia reseña";

        var likeHtml =
            '<button class="' + likeClass + '" data-id="' + r.id + '" ' +
            'data-liked="' + (yaLeDiLike ? "1" : "0") + '" title="' + likeTitle + '">' +
            '<span class="like-icon">' + (yaLeDiLike ? "♥" : "♡") + '</span>' +
            '<span class="like-count">' + likesCount + '</span>' +
            '</button>';

        var card = document.createElement("div");
        card.className = "testimonial-card resena-nueva";
        card.dataset.id = r.id;
        card.innerHTML =
            '<div class="testimonial-author">' +
            '<div class="author-avatar">' + iniciales + '</div>' +
            '<div>' +
            '<strong>' + r.nombre + '</strong>' +
            (r.fecha ? '<span class="resena-fecha">' + tiempoRelativo(r.fecha) + '</span>' : '') +
            '</div>' +
            '</div>' +
            '<p class="testimonial-text">' + (r.texto || r.comentario || "").replace(/</g, "&lt;") + '</p>' +
            '<div class="resena-footer">' +
            '<div class="resena-stars-display">' + buildStarsHtml(r.rating || r.puntuacion) + '</div>' +
            likeHtml +
            '</div>' +
            acciones;

        // ── Evento: Editar ──
        var btnEditar = card.querySelector(".resena-btn-editar");
        if (btnEditar) btnEditar.addEventListener("click", function () {
            var id = +this.dataset.id;
            var cardEl = sliderTrack.querySelector('[data-id="' + id + '"]');
            if (!cardEl) return;
            var textoActual = cardEl.querySelector(".testimonial-text").textContent;
            var ratingActual = cardEl.querySelectorAll('.resena-stars-display span[style*="f59e0b"]').length;
            textarea.value = textoActual;
            charCount.textContent = textoActual.length + " / 140";
            rating = ratingActual;
            stars.forEach(function (s) { s.classList.toggle("selected", +s.dataset.val <= rating); });
            editandoId = id;
            submitBtn.textContent = "Guardar cambios";
            formBox.scrollIntoView({ behavior: "smooth", block: "center" });
            textarea.focus();
        });

        // ── Evento: Borrar ──
        var btnBorrar = card.querySelector(".resena-btn-borrar");
        if (btnBorrar) btnBorrar.addEventListener("click", function () {
            var id = +this.dataset.id;
            if (!confirm("¿Seguro que quieres borrar esta reseña?")) return;
            var sess = getSess();
            fetch(URL_ACCION, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "BORRAR", id_persona: sess.id, id_resena: id })
            })
                .then(function (r) { return r.json(); })
                .then(function (res) {
                    if (!res.ok) { alert(res.error || "Error al borrar"); return; }
                    var cardEl = sliderTrack.querySelector('[data-id="' + id + '"]');
                    if (cardEl) cardEl.remove();
                    window.dispatchEvent(new Event("resenasListas"));
                })
                .catch(function () { alert("Error de conexión al borrar."); });
        });

        // ── Evento: Like / Unlike ──
        var btnLike = card.querySelector(".resena-btn-like");
        if (btnLike && puedelikeear) {
            btnLike.addEventListener("click", function () {
                var sess = getSess();
                var esViajeroLike = !!(sess && sess.tipo === "viajero");

                var id = +this.dataset.id;
                var yaLiked = this.dataset.liked === "1";
                var accion = yaLiked ? "UNLIKE" : "LIKE";
                var btn = this;

                var body = { accion: accion, id_resena: id };
                if (esViajeroLike) {
                    body.id_persona = sess.id;
                } else {
                    body.visitor_id = getVisitorId();
                }

                btn.disabled = true;

                fetch(URL_ACCION, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                })
                    .then(function (r) { return r.json(); })
                    .then(function (res) {
                        btn.disabled = false;
                        if (!res.ok) { return; }
                        var nuevoLiked = !yaLiked;
                        btn.dataset.liked = nuevoLiked ? "1" : "0";
                        btn.querySelector(".like-icon").textContent = nuevoLiked ? "♥" : "♡";
                        btn.querySelector(".like-count").textContent = res.likes;
                        if (nuevoLiked) {
                            btn.classList.add("liked");
                        } else {
                            btn.classList.remove("liked");
                        }
                    })
                    .catch(function () { btn.disabled = false; });
            });
        }

        return card;
    }

    // ── Cargar reseñas desde la BD ────────────────────────────────────────

    function cargarResenas() {
        var sess = getSess();
        var params = new URLSearchParams();
        if (sess && sess.id) params.set("id_persona", sess.id);
        params.set("visitor_id", getVisitorId());
        var url = URL_GET + "?" + params.toString();

        fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (!data.ok) return;
                sliderTrack.innerHTML = "";
                data.data.forEach(function (r) {
                    sliderTrack.appendChild(buildCard(r));
                });
                window.dispatchEvent(new Event("resenasListas"));
            })
            .catch(function () {
                console.warn("[TourismEasy] No se pudieron cargar las reseñas.");
            });
    }

    cargarResenas();

    // ── Carrusel: puntos de navegación + desplazamiento ────────────────────
    // (Esta parte faltaba: las tarjetas se agregaban al DOM pero nada movía
    // el track ni armaba los puntos, así que solo se veían las que entraban
    // en el ancho visible -- el resto quedaba recortado por overflow-x:clip.)

    var sliderWrapperEl = document.querySelector(".slider-wrapper");
    var slideIndex = 0;
    var autoplayTimer = null;

    function cardsPerView() {
        if (!sliderTrack.children.length || !sliderWrapperEl) return 1;
        var wrapperWidth = sliderWrapperEl.clientWidth;
        var cardWidth = sliderTrack.children[0].getBoundingClientRect().width + 24; // + gap
        return Math.max(1, Math.round(wrapperWidth / cardWidth));
    }

    function totalSlides() {
        return Math.max(1, Math.ceil(sliderTrack.children.length / cardsPerView()));
    }

    function renderDots() {
        if (!sliderDots) return;
        var total = totalSlides();
        sliderDots.innerHTML = "";
        for (var i = 0; i < total; i++) {
            (function (idx) {
                var b = document.createElement("button");
                b.className = "dot" + (idx === slideIndex ? " active" : "");
                b.type = "button";
                b.addEventListener("click", function () {
                    stopAutoplay();
                    goToSlide(idx);
                    startAutoplay();
                });
                sliderDots.appendChild(b);
            })(i);
        }
    }

    function goToSlide(i) {
        var total = totalSlides();
        slideIndex = ((i % total) + total) % total;
        var wrapperWidth = sliderWrapperEl ? sliderWrapperEl.clientWidth : 0;
        sliderTrack.style.transform = "translateX(-" + (slideIndex * wrapperWidth) + "px)";
        renderDots();
    }

    function startAutoplay() {
        stopAutoplay();
        if (totalSlides() <= 1) return;
        autoplayTimer = setInterval(function () { goToSlide(slideIndex + 1); }, 6000);
    }

    function stopAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
    }

    function initSlider() {
        slideIndex = 0;
        goToSlide(0);
        startAutoplay();
    }

    window.addEventListener("resenasListas", initSlider);

    var _resizeT;
    window.addEventListener("resize", function () {
        clearTimeout(_resizeT);
        _resizeT = setTimeout(initSlider, 200);
    });

    if (sliderWrapperEl) {
        sliderWrapperEl.addEventListener("mouseenter", stopAutoplay);
        sliderWrapperEl.addEventListener("mouseleave", startAutoplay);
    }

    // ── Publicar / Editar reseña ──────────────────────────────────────────

    var editandoId = null;

    submitBtn.addEventListener("click", async function () {
        var sess = getSess();
        var esViajero = !!(sess && sess.tipo === "viajero");
        var nombreAnonimo = nombreAnonimoInput ? nombreAnonimoInput.value.trim() : "";

        // Si está editando, sí o sí necesita sesión (solo se llega aquí
        // desde el botón "Editar", que solo aparece en reseñas propias).
        if (editandoId && !esViajero) { checkSession(); return; }

        // Si no hay sesión, necesita al menos un nombre para publicar
        if (!esViajero && !nombreAnonimo) {
            nombreAnonimoInput.focus();
            nombreAnonimoInput.style.animation = "shake 0.3s";
            setTimeout(function () { nombreAnonimoInput.style.animation = ""; }, 400);
            return;
        }

        var textoOriginal = textarea.value.trim();
        if (!textoOriginal) { textarea.focus(); return; }
        if (rating === 0) {
            stars[0].style.animation = "shake 0.3s";
            setTimeout(function () { stars[0].style.animation = ""; }, 400);
            return;
        }
        if (textoOriginal.length < 10) {
            alert("El comentario debe tener al menos 10 caracteres.");
            textarea.focus();
            return;
        }

        // Aplicamos el filtro de censura (inglés + español) antes de armar el envío
        submitBtn.disabled = true;
        var texto = await limpiarTexto(textoOriginal);

        var accion = editandoId ? "EDITAR" : "CREAR";
        var body = { accion: accion, rating: rating, texto: texto };
        if (esViajero) {
            body.id_persona = sess.id;
        } else {
            body.nombre_anonimo = nombreAnonimo;
        }
        if (editandoId) body.id_resena = editandoId;

        var nombreParaMostrar = esViajero ? (sess.nombre || "Viajero") : nombreAnonimo;

        fetch(URL_ACCION, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
            .then(function (r) { return r.json(); })
            .then(function (res) {
                submitBtn.disabled = false;
                if (!res.ok) { alert(res.error || "Error al publicar reseña."); return; }

                if (editandoId) {
                    cargarResenas();
                    editandoId = null;
                    submitBtn.textContent = "Publicar reseña";
                } else {
                    var nueva = {
                        id: res.id_resena,
                        id_persona: esViajero ? sess.id : null,
                        nombre: nombreParaMostrar,
                        rating: rating,
                        texto: texto,
                        fecha: res.fecha || new Date().toISOString(),
                        likes: 0
                    };
                    sliderTrack.insertBefore(buildCard(nueva), sliderTrack.firstChild);
                    window.dispatchEvent(new Event("resenasListas"));
                }

                // Resetear formulario
                textarea.value = "";
                charCount.textContent = "0 / 140";
                rating = 0;
                stars.forEach(function (s) { s.classList.remove("selected", "hovered"); });

                // Mensaje de agradecimiento
                formBox.style.display = "none";
                gracias.style.display = "flex";
                document.getElementById("resenaNombreGracias").textContent =
                    nombreParaMostrar.split(" ")[0];
                setTimeout(function () {
                    gracias.style.display = "none";
                    formBox.style.display = "block";
                }, 4000);
            })
            .catch(function () {
                submitBtn.disabled = false;
                alert("Error de conexión. Intenta de nuevo.");
            });
    });

})();