document.addEventListener("click", function (event) {
    var enlace = event.target.closest(".vd-whatsapp, .pm-whatsapp");
    if (!enlace || !enlace.dataset.idProducto || !enlace.dataset.categoria) return;

    fetch("../api/registrar_click_whatsapp.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id_producto: enlace.dataset.idProducto,
            categoria: enlace.dataset.categoria,
        }),
        keepalive: true,
    }).then(function (response) {
        if (!response.ok) {
            throw new Error("Respuesta HTTP " + response.status);
        }
    }).catch(function (error) {
        console.error("No se pudo registrar el clic de WhatsApp.", error);
    });
});
