(function () {

    // ── Referencias a los elementos del HTML ──
    var anonGroup = document.getElementById("resenaAnonGroup");
    var nombreAnonimoInput = document.getElementById("resenaNombreAnonimo");
    var formBox = document.getElementById("resenaFormBox");
    var gracias = document.getElementById("resenaGracias");
    var stars = document.querySelectorAll(".resena-star");
    var textarea = document.getElementById("resenaTexto");
    var charCount = document.getElementById("resenaCharCount");
    var submitBtn = document.getElementById("resenaSubmit");
    var sliderTrack = document.getElementById("sliderTrack");
    var reviewPagination = document.getElementById("resenasPaginacion");
    var reviewSummary = document.getElementById("resenasResumen");
    var reviewPageLabel = document.getElementById("resenasPaginaActual");
    var previousReviewPage = document.getElementById("resenasAnterior");
    var nextReviewPage = document.getElementById("resenasSiguiente");
    var resenasStatus = document.createElement("p");
    var rating = 0;
    var resenasRequestId = 0;
    var resenasData = [];
    var paginaResenas = 1;
    var resenasPorPagina = reviewPagination ? 20 : Infinity;
    resenasStatus.setAttribute("role", "status");
    resenasStatus.setAttribute("aria-live", "polite");
    sliderTrack.parentNode.insertBefore(resenasStatus, sliderTrack);

    // ── Rutas a los PHP ──
    var _enHtml = window.location.pathname.includes("/html/");
    var BASE = _enHtml ? "../resenas/" : "resenas/";
    var URL_GET = BASE + "get_resenas.php";
    var URL_ACCION = BASE + "accion_resena.php";
    var adminSession = null;
    try {
        adminSession = JSON.parse(localStorage.getItem("te_session") || sessionStorage.getItem("te_session") || "null");
    } catch (error) {
        console.warn("[TourismEasy] No se pudo leer la sesión del administrador.", error);
    }
    var mostrarModeracion = window.location.pathname.split("/").pop() === "panel_admin.html"
        && adminSession
        && adminSession.tipo === "admin";

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

    if (anonGroup) anonGroup.style.display = "block";

    // Precarga en segundo plano las listas de groserías (EN+ES) para que
    // el primer envío de reseña no tenga que esperar la descarga.
    prepararFiltro();

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
        var nombre = typeof r.nombre === "string" && r.nombre.trim() ? r.nombre.trim() : "Viajero";
        var partes = nombre.split(/\s+/);
        var iniciales = (partes[0][0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
        var puedelikeear = true;
        var likesCount = parseInt(r.likes) || 0;

        // Estado real: ¿el usuario actual ya le dio like a esta reseña?
        // (viene calculado desde el backend, así se conserva al recargar)
        var yaLeDiLike = !!(parseInt(r.ya_di_like) || 0);

        // Botón de like
        var likeClass = puedelikeear ? "resena-btn-like" : "resena-btn-like disabled";
        if (yaLeDiLike) likeClass += " liked";

        var card = document.createElement("div");
        card.className = "testimonial-card resena-nueva";
        card.dataset.id = r.id;

        var author = document.createElement("div");
        author.className = "testimonial-author";
        var avatar = document.createElement("div");
        avatar.className = "author-avatar";
        avatar.textContent = iniciales;
        var authorDetails = document.createElement("div");
        var authorName = document.createElement("strong");
        authorName.textContent = nombre;
        authorDetails.appendChild(authorName);
        if (r.fecha) {
            var date = document.createElement("span");
            date.className = "resena-fecha";
            date.textContent = tiempoRelativo(r.fecha);
            authorDetails.appendChild(date);
        }
        author.appendChild(avatar);
        author.appendChild(authorDetails);
        card.appendChild(author);

        var text = document.createElement("p");
        text.className = "testimonial-text";
        text.textContent = r.texto || r.comentario || "";
        card.appendChild(text);

        var footer = document.createElement("div");
        footer.className = "resena-footer";
        var starsDisplay = document.createElement("div");
        starsDisplay.className = "resena-stars-display";
        var score = r.rating || r.puntuacion;
        for (var i = 1; i <= 5; i++) {
            var star = document.createElement("span");
            star.style.color = i <= score ? "#f59e0b" : "#cbd5e1";
            star.textContent = "★";
            starsDisplay.appendChild(star);
        }
        footer.appendChild(starsDisplay);

        var actions = document.createElement("div");
        actions.className = "resena-actions";
        var btnLike = document.createElement("button");
        btnLike.className = likeClass;
        btnLike.dataset.id = r.id;
        btnLike.dataset.liked = yaLeDiLike ? "1" : "0";
        btnLike.title = "¿Te gustó esta reseña?";
        var likeIcon = document.createElement("span");
        likeIcon.className = "like-icon";
        likeIcon.textContent = yaLeDiLike ? "♥" : "♡";
        var likeCount = document.createElement("span");
        likeCount.className = "like-count";
        likeCount.textContent = likesCount;
        btnLike.appendChild(likeIcon);
        btnLike.appendChild(likeCount);
        actions.appendChild(btnLike);

        if (mostrarModeracion) {
            var btnDelete = document.createElement("button");
            btnDelete.className = "resena-btn-delete";
            btnDelete.type = "button";
            btnDelete.title = "Eliminar reseña";
            btnDelete.setAttribute("aria-label", "Eliminar reseña");
            btnDelete.dataset.id = r.id;
            var deleteIcon = document.createElement("i");
            deleteIcon.className = "fa-solid fa-trash";
            deleteIcon.setAttribute("aria-hidden", "true");
            btnDelete.appendChild(deleteIcon);
            btnDelete.appendChild(document.createTextNode(" Eliminar"));
            actions.appendChild(btnDelete);
        }
        footer.appendChild(actions);
        card.appendChild(footer);

        var btnDelete = card.querySelector(".resena-btn-delete");
        if (btnDelete) {
            btnDelete.addEventListener("click", function () {
                borrarResena(r.id, btnDelete);
            });
        }

        // ── Evento: Like / Unlike ──
        var btnLike = card.querySelector(".resena-btn-like");
        if (btnLike && puedelikeear) {
            btnLike.addEventListener("click", function () {
                var id = +this.dataset.id;
                var yaLiked = this.dataset.liked === "1";
                var accion = yaLiked ? "UNLIKE" : "LIKE";
                var btn = this;

                var body = { accion: accion, id_resena: id, visitor_id: getVisitorId() };

                btn.disabled = true;

                fetch(URL_ACCION, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                })
                    .then(function (r) {
                        if (!r.ok) throw new Error("No se pudo actualizar el me gusta.");
                        return r.json();
                    })
                    .then(function (res) {
                        if (!res.ok) throw new Error(res.error || "No se pudo actualizar el me gusta.");
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
                    .catch(function (error) {
                        window.TEUI.toast(error.message || "No se pudo actualizar el me gusta.", "error");
                    })
                    .finally(function () {
                        btn.disabled = false;
                    });
            });
        }

        return card;
    }

    async function borrarResena(id, button) {
        if (!await window.TEUI.confirm({
            title: "Eliminar reseña",
            message: "¿Quieres eliminar esta reseña? Esta acción no se puede deshacer.",
            confirmText: "Sí, eliminar"
        })) return;

        button.disabled = true;
        try {
            var response = await fetch(URL_ACCION, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accion: "BORRAR", id_resena: id })
            });
            var result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(result.error || "No se pudo eliminar la reseña.");
            }

            cargarResenas();
            window.dispatchEvent(new Event("teResenasActualizadas"));
            window.TEUI.toast("Reseña eliminada correctamente.");
        } catch (error) {
            button.disabled = false;
            window.TEUI.toast(error.message || "No se pudo eliminar la reseña. Intenta de nuevo.", "error");
        }
    }

    // ── Cargar reseñas desde la BD ────────────────────────────────────────

    function renderizarResenas() {
        var totalPaginas = resenasPorPagina === Infinity ? 1 : Math.ceil(resenasData.length / resenasPorPagina);
        paginaResenas = Math.max(1, Math.min(paginaResenas, totalPaginas));
        var inicio = resenasPorPagina === Infinity ? 0 : (paginaResenas - 1) * resenasPorPagina;
        var resenasVisibles = resenasData.slice(inicio, inicio + resenasPorPagina);
        sliderTrack.replaceChildren();
        resenasVisibles.forEach(function (resena) {
            sliderTrack.appendChild(buildCard(resena));
        });
        if (reviewPagination) {
            reviewPagination.hidden = resenasData.length <= resenasPorPagina;
            reviewSummary.textContent = resenasData.length
                ? "Mostrando " + (inicio + 1) + "–" + Math.min(inicio + resenasPorPagina, resenasData.length) +
                    " de " + resenasData.length + " reseñas"
                : "Sin reseñas";
            reviewPageLabel.textContent = "Página " + (resenasData.length ? paginaResenas : 0) +
                " de " + (resenasData.length ? totalPaginas : 0);
            previousReviewPage.disabled = paginaResenas <= 1;
            nextReviewPage.disabled = paginaResenas >= totalPaginas;
        }
        resenasStatus.textContent = resenasData.length ? "" : "Aún no hay reseñas.";
        window.dispatchEvent(new Event("resenasListas"));
    }

    function cargarResenas() {
        var requestId = ++resenasRequestId;
        var params = new URLSearchParams();
        params.set("visitor_id", getVisitorId());
        var url = URL_GET + "?" + params.toString();

        sliderTrack.setAttribute("aria-busy", "true");
        sliderTrack.replaceChildren();
        resenasStatus.textContent = "Cargando reseñas…";

        fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error("No se pudieron cargar las reseñas.");
                return r.json();
            })
            .then(function (data) {
                if (requestId !== resenasRequestId) return;
                if (!data.ok || !Array.isArray(data.data)) {
                    throw new Error(data.error || "El servidor devolvió una respuesta inválida.");
                }
                resenasData = data.data;
                paginaResenas = 1;
                renderizarResenas();
            })
            .catch(function (error) {
                if (requestId !== resenasRequestId) return;
                console.error("[TourismEasy] No se pudieron cargar las reseñas:", error);
                resenasData = [];
                sliderTrack.replaceChildren();
                if (reviewPagination) reviewPagination.hidden = true;
                resenasStatus.textContent = "No se pudieron cargar las reseñas. Intenta recargar la página.";
                window.dispatchEvent(new Event("resenasListas"));
            })
            .finally(function () {
                if (requestId === resenasRequestId) {
                    sliderTrack.removeAttribute("aria-busy");
                }
            });
    }

    if (previousReviewPage) previousReviewPage.addEventListener("click", function () {
        if (paginaResenas <= 1) return;
        paginaResenas--;
        renderizarResenas();
    });
    if (nextReviewPage) nextReviewPage.addEventListener("click", function () {
        var totalPaginas = Math.ceil(resenasData.length / resenasPorPagina);
        if (paginaResenas >= totalPaginas) return;
        paginaResenas++;
        renderizarResenas();
    });

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

    submitBtn.addEventListener("click", async function () {
        var nombreAnonimo = nombreAnonimoInput ? nombreAnonimoInput.value.trim() : "";

        if (!nombreAnonimo) {
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
            window.TEUI.toast("El comentario debe tener al menos 10 caracteres.", "error");
            textarea.focus();
            return;
        }

        // Aplicamos el filtro de censura (inglés + español) antes de armar el envío
        submitBtn.disabled = true;
        var ratingEnviado = rating;
        var nombreParaMostrar = nombreAnonimo;
        try {
            var texto = await limpiarTexto(textoOriginal);
            var response = await fetch(URL_ACCION, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accion: "CREAR",
                    rating: ratingEnviado,
                    texto: texto,
                    nombre_anonimo: nombreParaMostrar
                })
            });
            if (!response.ok) throw new Error("No se pudo publicar la reseña.");
            var res = await response.json();
            if (!res.ok) throw new Error(res.error || "No se pudo publicar la reseña.");

            var nueva = {
                id: res.id_resena,
                nombre: nombreParaMostrar,
                rating: ratingEnviado,
                texto: texto,
                fecha: res.fecha || new Date().toISOString(),
                likes: 0
            };
            window.TEUI.toast("Reseña publicada correctamente.");
            resenasRequestId++;
            sliderTrack.removeAttribute("aria-busy");
            resenasData.unshift(nueva);
            paginaResenas = 1;
            renderizarResenas();

            textarea.value = "";
            charCount.textContent = "0 / 140";
            rating = 0;
            stars.forEach(function (s) { s.classList.remove("selected", "hovered"); });

            formBox.style.display = "none";
            gracias.style.display = "flex";
            document.getElementById("resenaNombreGracias").textContent =
                nombreParaMostrar.split(" ")[0];
            setTimeout(function () {
                gracias.style.display = "none";
                formBox.style.display = "block";
            }, 4000);
        } catch (error) {
            window.TEUI.toast(error.message || "Error de conexión. Intenta de nuevo.", "error");
        } finally {
            submitBtn.disabled = false;
        }
    });

})();