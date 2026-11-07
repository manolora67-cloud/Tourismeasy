(function () {
    var contenedores = document.querySelectorAll("[data-company-recent-activity]");
    if (!contenedores.length) return;

    function mostrarMensaje(contenedor, mensaje) {
        contenedor.replaceChildren();
        var item = document.createElement("div");
        item.className = "pe-actividad-item";
        var texto = document.createElement("p");
        texto.className = "pe-actividad-titulo";
        texto.textContent = mensaje;
        item.appendChild(texto);
        contenedor.appendChild(item);
    }

    function fechaActividad(fecha) {
        var valor = String(fecha || "").replace(" ", "T");
        var date = new Date(valor);
        if (Number.isNaN(date.getTime())) return "Fecha no disponible";
        return new Intl.DateTimeFormat("es-CO", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit"
        }).format(date);
    }

    function renderizarActividad(contenedor, actividad) {
        contenedor.replaceChildren();
        var iconos = {
            Transporte: "fa-bus",
            Hospedaje: "fa-hotel",
            Plan: "fa-map-location-dot"
        };
        actividad.slice(0, 2).forEach(function (registro) {
            var item = document.createElement("div");
            item.className = "pe-actividad-item";

            var iconoContenedor = document.createElement("div");
            iconoContenedor.className = "pe-actividad-icon pe-actividad-icon--purple";
            var icono = document.createElement("i");
            icono.className = "fa-solid " + (iconos[registro.categoria] || "fa-arrow-up-right-from-square");
            iconoContenedor.appendChild(icono);

            var detalle = document.createElement("div");
            var titulo = document.createElement("p");
            titulo.className = "pe-actividad-titulo";
            titulo.textContent = "Clic en WhatsApp · " + (registro.producto || "Servicio");
            var fecha = document.createElement("p");
            fecha.className = "pe-actividad-hora";
            fecha.textContent = fechaActividad(registro.fecha_hora);
            detalle.appendChild(titulo);
            detalle.appendChild(fecha);
            item.appendChild(iconoContenedor);
            item.appendChild(detalle);
            contenedor.appendChild(item);
        });

        if (!actividad.length) mostrarMensaje(contenedor, "Aún no hay clics de WhatsApp registrados.");
    }

    fetch(new URL("../login/get_estadisticas_clicks.php?pagina=1", window.location.href), {
        credentials: "include",
        cache: "no-store"
    })
        .then(function (response) {
            if (!response.ok) throw new Error("El servidor respondió con HTTP " + response.status);
            return response.json();
        })
        .then(function (data) {
            if (!data.ok || !Array.isArray(data.recientes)) {
                throw new Error(data.error || "La actividad reciente tiene un formato inválido.");
            }
            contenedores.forEach(function (contenedor) {
                renderizarActividad(contenedor, data.recientes);
            });
        })
        .catch(function (error) {
            console.error("No se pudo cargar la actividad reciente de la empresa:", error);
            contenedores.forEach(function (contenedor) {
                mostrarMensaje(contenedor, "No se pudo cargar la actividad reciente.");
            });
        });
})();
