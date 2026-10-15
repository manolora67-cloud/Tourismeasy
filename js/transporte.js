// ============================================================
// transporte.js — Lógica propia de la página Transporte
// (modal de detalles, buscador y carga dinámica desde el backend)
// ============================================================


// ── MODAL VER DETALLES DE TRANSPORTE ──────────────────────────────

function formatTime24to12(t) {
    if (!t || t === "—") return t || "—";

    // Already has AM/PM — return as is
    if (t.indexOf("AM") !== -1 || t.indexOf("PM") !== -1) return t;

    var parts = t.split(":");
    if (parts.length < 2) return t;

    var h = parseInt(parts[0], 10);
    var m = parts[1];

    var ampm = h >= 12 ? "PM" : "AM";

    h = h % 12 || 12;

    return h + ":" + m + " " + ampm;
}


function formatDateLong(iso) {
    if (!iso || iso === "—") return iso || "—";

    // Already formatted (e.g. "21 de junio de 2026")
    if (iso.indexOf("-") === -1) return iso;

    var parts = iso.split("-");
    if (parts.length < 3) return iso;

    var months = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre"
    ];

    return parseInt(parts[2], 10) +
        " de " +
        months[parseInt(parts[1], 10) - 1] +
        " de " +
        parts[0];
}


// Arma el link de WhatsApp a partir de un teléfono
// (con o sin +57, espacios, guiones)
// y un mensaje precargado.
// Devuelve null si no hay teléfono válido.

function buildWhatsAppLink(telefono, mensaje) {
    var digits = (telefono || "").replace(/[^\d]/g, "");

    if (!digits) return null;

    if (digits.length === 10) {
        digits = "57" + digits;
    }

    return "https://wa.me/" +
        digits +
        (mensaje
            ? ("?text=" + encodeURIComponent(mensaje))
            : "");
}


// Actualiza (o esconde) el botón de WhatsApp del modal
// según los datos del botón clickeado

function actualizarBotonWhatsApp(btn) {
    var waBtn = document.getElementById("vd-whatsapp");

    if (!waBtn) return;

    var telefono = btn.dataset.whatsapp || "";

    var mensaje =
        "Hola, vi el transporte " +
        (btn.dataset.titulo || "") +
        " en TourismEasy y quisiera más información.";

    var link = buildWhatsAppLink(telefono, mensaje);

    if (link) {
        waBtn.href = link;
        waBtn.style.display = "";
    } else {
        waBtn.style.display = "none";
    }
}


(function () {

    var overlay = document.getElementById(
        'transporte-detalle-overlay'
    );

    var cerrar = document.getElementById('vd-cerrar');


    document.querySelectorAll('.btn-ver-detalles').forEach(function (btn) {

        btn.addEventListener('click', function () {

            document.getElementById('vd-img').src =
                btn.dataset.img || '';

            document.getElementById('vd-titulo').textContent =
                btn.dataset.titulo || '';

            document.getElementById('vd-origen').textContent =
                btn.dataset.origen || '';

            document.getElementById('vd-destino').textContent =
                btn.dataset.destino || '';

            document.getElementById('vd-fecha').textContent =
                formatDateLong(btn.dataset.fecha || '');

            document.getElementById('vd-hora').textContent =
                formatTime24to12(btn.dataset.hora || '');

            document.getElementById('vd-empresa').textContent =
                btn.dataset.empresa || '';

            document.getElementById('vd-accesibilidad').textContent =
                btn.dataset.accesibilidad || '';

            document.getElementById('vd-precio').textContent =
                btn.dataset.precio || '';


            // Mostrar clase si el HTML tiene el campo
            var detalleClase =
                document.getElementById('vd-clase');

            if (detalleClase) {
                detalleClase.textContent =
                    btn.dataset.clase || 'Sin clase';
            }


            actualizarBotonWhatsApp(btn);

            overlay.classList.add('visible');

            document.body.style.overflow = 'hidden';
        });

    });


    function cerrarModal() {

        overlay.classList.remove('visible');

        document.body.style.overflow = '';
    }


    cerrar.addEventListener('click', cerrarModal);


    overlay.addEventListener('click', function (e) {

        if (e.target === overlay) {
            cerrarModal();
        }

    });


    document.addEventListener('keydown', function (e) {

        if (e.key === 'Escape') {
            cerrarModal();
        }

    });

})();


// ── CARGAR CLASES DE TRANSPORTE DESDE LA BD ───────────────────────

function cargarClasesTransporte() {

    var select =
        document.getElementById('tClase');

    // Si este HTML todavía no tiene el selector,
    // no hacemos nada.
    if (!select) return;


    fetch('../transporte/clases.php', {
        credentials: 'include'
    })

        .then(function (r) {
            return r.json();
        })

        .then(function (res) {

            if (!res.ok || !Array.isArray(res.data)) {
                return;
            }


            select.innerHTML =
                '<option value="">Todas las clases</option>';


            res.data.forEach(function (clase) {

                var option =
                    document.createElement('option');

                option.value = clase.id;

                option.textContent = clase.nombre;

                select.appendChild(option);

            });

        })

        .catch(function (error) {

            console.error(
                'Error cargando clases de transporte:',
                error
            );

        });

}


cargarClasesTransporte();


// ── BUSCADOR DE TRANSPORTE ───────────────────────────────────────
// llama a transporte/buscar.php
// → fn_buscar_transporte

function buscarTransporte() {

    var selOrigen =
        document.getElementById('tOrigen');

    var selDestino =
        document.getElementById('tDestino');


    var origenTexto =
        selOrigen.value
            ? selOrigen.options[
                selOrigen.selectedIndex
            ].text
            : '';


    var destinoTexto =
        selDestino.value
            ? selDestino.options[
                selDestino.selectedIndex
            ].text
            : '';


    var fecha =
        document.getElementById('tFecha').value;


    // NUEVO: clase
    var selClase =
        document.getElementById('tClase');

    var clase =
        selClase
            ? selClase.value
            : '';


    var claseTexto =
        (selClase && selClase.value)
            ? selClase.options[
                selClase.selectedIndex
            ].text
            : '';


    var statusBox =
        document.getElementById(
            'transporteStatus'
        );

    var statusText =
        document.getElementById(
            'transporteStatusText'
        );

    var emptyBox =
        document.getElementById(
            'transporteEmpty'
        );

    var grid =
        window.transporteGrid ||
        document.getElementById(
            'resultsGrid'
        );


    // Si no hay ningún filtro
    if (
        !origenTexto &&
        !destinoTexto &&
        !fecha &&
        !clase
    ) {

        statusBox.style.display = 'none';

        emptyBox.style.display = 'none';


        if (window.transporteCargarTodo) {
            window.transporteCargarTodo();
        }

        return;
    }


    statusBox.style.display = 'none';

    emptyBox.style.display = 'none';


    grid.innerHTML =
        '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8">' +
        '<i class="fa-solid fa-spinner fa-spin fa-2x"></i>' +
        '<p style="margin-top:12px">Buscando rutas...</p>' +
        '</div>';


    var params =
        new URLSearchParams();


    if (origenTexto) {
        params.set(
            'origen',
            origenTexto
        );
    }


    if (destinoTexto) {
        params.set(
            'destino',
            destinoTexto
        );
    }


    if (fecha) {
        params.set(
            'fecha',
            fecha
        );
    }


    // NUEVO: enviar clase
    if (clase) {
        params.set(
            'id_clase',
            clase
        );
    }


    fetch(
        '../transporte/buscar.php?' +
        params.toString(),
        {
            credentials: 'include'
        }
    )

        .then(function (r) {
            return r.json();
        })

        .then(function (res) {

            grid.innerHTML = '';


            if (
                !res.ok ||
                !res.data ||
                !res.data.length
            ) {

                emptyBox.style.display =
                    'block';

                return;
            }


            res.data.forEach(function (item) {

                if (
                    window.transporteRenderCard
                ) {

                    window.transporteRenderCard(
                        item
                    );

                }

            });


            var msg =
                'Se encontraron <strong>' +
                res.data.length +
                ' ruta' +
                (
                    res.data.length > 1
                        ? 's'
                        : ''
                ) +
                '</strong>';


            if (origenTexto) {

                msg +=
                    ' desde <strong>' +
                    origenTexto +
                    '</strong>';

            }


            if (destinoTexto) {

                msg +=
                    ' hacia <strong>' +
                    destinoTexto +
                    '</strong>';

            }


            // NUEVO: mostrar filtro de clase
            if (claseTexto) {

                msg +=
                    ' · clase <strong>' +
                    claseTexto +
                    '</strong>';

            }


            statusText.innerHTML = msg;

            statusBox.style.display =
                'block';

        })

        .catch(function () {

            grid.innerHTML =
                '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#ef4444">' +
                'Error al buscar. Intenta de nuevo.' +
                '</div>';

        });

}


// ── RESET BUSQUEDA ───────────────────────────────────────────────

function resetBusqueda() {

    document.getElementById(
        'tOrigen'
    ).value = '';


    document.getElementById(
        'tDestino'
    ).value = '';


    document.getElementById(
        'tFecha'
    ).value = '';


    // NUEVO: limpiar clase
    var selClase =
        document.getElementById('tClase');

    if (selClase) {
        selClase.value = '';
    }


    document.getElementById(
        'transporteStatus'
    ).style.display = 'none';


    document.getElementById(
        'transporteEmpty'
    ).style.display = 'none';


    if (window.transporteCargarTodo) {
        window.transporteCargarTodo();
    }

}


document
    .getElementById(
        'btnBuscarTransporte'
    )
    .addEventListener(
        'click',
        buscarTransporte
    );


document
    .getElementById('tFecha')
    .addEventListener(
        'keydown',
        function (e) {

            if (e.key === 'Enter') {
                buscarTransporte();
            }

        }
    );


// ══════════════════════════════════════════════════════════════════
// TRANSPORTE DINÁMICO DESDE PANEL EMPRESA
// ──────────────────────────────────────────────────────────────────
// Lee los servicios de transporte creados en panel_empresa.html
// y los convierte en tarjetas visibles en esta página.
//
// ¿Cómo funciona?
//   1. panel_empresa.html guarda los servicios en localStorage.
//   2. Este script los lee al cargar la página y genera las tarjetas.
//   3. Solo muestra registros con estado "Activo" y tipo "transporte".
// ══════════════════════════════════════════════════════════════════

(function () {

    var grid =
        document.getElementById(
            "resultsGrid"
        );


    if (!grid) return;


    function slugify(str) {

        return (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            );

    }


    function addOption(
        selectEl,
        value,
        label
    ) {

        if (!selectEl) return;


        for (
            var i = 0;
            i < selectEl.options.length;
            i++
        ) {

            if (
                selectEl.options[i].value ===
                value
            ) {

                return;
            }

        }


        var opt =
            document.createElement(
                "option"
            );


        opt.value = value;

        opt.textContent = label;

        selectEl.appendChild(opt);

    }


    function renderCard(item) {

        var origenSlug =
            slugify(item.origen);


        var destinoSlug =
            slugify(item.destino);


        var selOrigen =
            document.getElementById(
                "tOrigen"
            );


        var selDestino =
            document.getElementById(
                "tDestino"
            );


        addOption(
            selOrigen,
            origenSlug,
            item.origen
        );


        addOption(
            selDestino,
            destinoSlug,
            item.destino
        );


        // Mantener disponibles las clases
        // que vienen desde la DB.
        var selClase =
            document.getElementById(
                "tClase"
            );


        if (
            selClase &&
            item.id_clase &&
            item.nombre_clase
        ) {

            addOption(
                selClase,
                String(item.id_clase),
                item.nombre_clase
            );

        }


        var precioDisplay =
            item.precio
                ? "$" +
                parseInt(
                    item.precio
                ).toLocaleString(
                    "es-CO"
                )
                : "Consultar";


        var imgHtml =
            item.img_url

                ? '<img src="' +
                (
                    item.img_url
                        ? (
                            item.img_url.startsWith(
                                "http"
                            )
                                ? item.img_url
                                : "../" +
                                item.img_url
                        )
                        : ""
                ) +
                '" class="card-banner" alt="Transporte ' +
                item.origen +
                ' - ' +
                item.destino +
                '">'

                : '<div class="card-banner" style="background:linear-gradient(135deg,#1e1b4b,#4c1d95);display:flex;align-items:center;justify-content:center;height:180px;">' +
                '<i class="fa-solid fa-bus" style="font-size:3rem;color:#a855f7;"></i>' +
                '</div>';


        var card =
            document.createElement(
                "article"
            );


        card.className =
            "card-item card-item--empresa";


        card.setAttribute(
            "data-origen",
            origenSlug
        );


        card.setAttribute(
            "data-destino",
            destinoSlug
        );


        card.innerHTML =

            imgHtml +

            '<div class="card-body">' +

            '<span class="card-tag" style="background:rgba(168,85,247,0.18);color:#a855f7;">' +
            (
                item.empresa ||
                "Empresa"
            ) +
            '</span>' +

            // Mostrar la clase en la tarjeta
            (
                item.nombre_clase
                    ? '<span class="card-tag" style="margin-left:6px;">' +
                    item.nombre_clase +
                    '</span>'
                    : ''
            ) +

            '<h3>' +
            (
                item.origen ||
                ""
            ) +
            ' → ' +
            (
                item.destino ||
                ""
            ) +
            '</h3>' +

            '<p style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;line-height:1.5;min-height:3em;">' +

            (
                item.descripcion ||

                (
                    'Salida: ' +
                    formatTime24to12(
                        item.hora_salida ||
                        ""
                    ) +
                    ' · ' +
                    (
                        item.ciudad_origen ||
                        ""
                    )
                )
            ) +

            '</p>' +

            '<div class="card-footer">' +

            '<span class="price">' +
            precioDisplay +
            '</span>' +

            '<button class="btn-reservar btn-ver-detalles-empresa"' +

            ' data-titulo="' +
            item.origen +
            ' → ' +
            item.destino +
            '"' +

            ' data-origen="' +
            (
                item.origen ||
                ""
            ) +
            '"' +

            ' data-destino="' +
            (
                item.destino ||
                ""
            ) +
            '"' +

            ' data-precio="' +
            precioDisplay +
            '"' +

            // NUEVO: clase para el modal
            ' data-clase="' +
            (
                item.nombre_clase ||
                ""
            ) +
            '"' +

            ' data-fecha="' +
            (
                item.fecha_salida ||
                "—"
            ) +
            '"' +

            ' data-hora="' +
            (
                item.hora_salida ||
                "—"
            ) +
            '"' +

            ' data-empresa="' +
            (
                item.empresa ||
                ""
            ) +
            '"' +

            ' data-accesibilidad="Servicio de transporte"' +

            ' data-whatsapp="' +
            (
                item.whatsapp ||
                item.telefono ||
                item.num_contacto_empresa ||
                ""
            ) +
            '"' +

            ' data-img="' +
            (
                item.img_url
                    ? (
                        item.img_url.startsWith(
                            "http"
                        )
                            ? item.img_url
                            : "../" +
                            item.img_url
                    )
                    : ""
            ) +
            '"' +

            '>Ver detalles</button>' +

            '</div></div>';


        card
            .querySelector(
                ".btn-ver-detalles-empresa"
            )
            .addEventListener(
                "click",
                function () {

                    var btn = this;


                    var overlay =
                        document.getElementById(
                            "transporte-detalle-overlay"
                        );


                    var imgEl =
                        document.getElementById(
                            "vd-img"
                        );


                    imgEl.src =
                        btn.dataset.img ||
                        "";


                    imgEl.style.display =
                        btn.dataset.img
                            ? ""
                            : "none";


                    document.getElementById(
                        "vd-titulo"
                    ).textContent =
                        btn.dataset.titulo ||
                        "";


                    document.getElementById(
                        "vd-origen"
                    ).textContent =
                        btn.dataset.origen ||
                        "";


                    document.getElementById(
                        "vd-destino"
                    ).textContent =
                        btn.dataset.destino ||
                        "";


                    document.getElementById(
                        "vd-fecha"
                    ).textContent =
                        formatDateLong(
                            btn.dataset.fecha ||
                            ""
                        );


                    document.getElementById(
                        "vd-hora"
                    ).textContent =
                        formatTime24to12(
                            btn.dataset.hora ||
                            ""
                        );


                    document.getElementById(
                        "vd-empresa"
                    ).textContent =
                        btn.dataset.empresa ||
                        "";


                    document.getElementById(
                        "vd-accesibilidad"
                    ).textContent =
                        btn.dataset.accesibilidad ||
                        "";


                    document.getElementById(
                        "vd-precio"
                    ).textContent =
                        btn.dataset.precio ||
                        "";


                    // Mostrar clase en detalle,
                    // solamente si el HTML ya tiene #vd-clase.
                    var detalleClase =
                        document.getElementById(
                            "vd-clase"
                        );


                    if (detalleClase) {

                        detalleClase.textContent =
                            btn.dataset.clase ||
                            "Sin clase";

                    }


                    actualizarBotonWhatsApp(
                        btn
                    );


                    overlay.classList.add(
                        "visible"
                    );


                    document.body.style.overflow =
                        "hidden";

                }
            );


        grid.appendChild(card);

    }


    // Spinner mientras carga

    grid.innerHTML =
        '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8">' +
        '<i class="fa-solid fa-spinner fa-spin fa-2x"></i>' +
        '<p style="margin-top:12px">Cargando rutas disponibles...</p>' +
        '</div>';


    function cargarTodo() {

        fetch(
            "../transporte/listar.php",
            {
                credentials: "include"
            }
        )

            .then(function (r) {
                return r.json();
            })

            .then(function (res) {

                grid.innerHTML = "";


                if (
                    !res.ok ||
                    !res.data ||
                    !res.data.length
                ) {

                    grid.innerHTML =
                        '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#94a3b8">' +
                        '<i class="fa-solid fa-bus fa-2x"></i>' +
                        '<p style="margin-top:12px">No hay rutas disponibles por el momento.</p>' +
                        '</div>';

                    return;
                }


                res.data.forEach(
                    function (item) {

                        renderCard(item);

                    }
                );

            })

            .catch(function () {

                grid.innerHTML =
                    '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#ef4444">' +
                    'Error al cargar las rutas. Intenta recargar la página.' +
                    '</div>';

            });

    }


    cargarTodo();


    // Se exponen para que el script del buscador
    // pueda renderizar resultados de búsqueda
    // y recargar el listado completo.

    window.transporteRenderCard =
        renderCard;


    window.transporteCargarTodo =
        cargarTodo;


    window.transporteGrid =
        grid;

})();