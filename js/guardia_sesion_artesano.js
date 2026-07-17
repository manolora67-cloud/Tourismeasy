/**
 * js/guardia_sesion_artesano.js
 *
 * Pega este <script> en el <head> (ANTES que cualquier otro contenido visible
 * se cargue) de CUALQUIER página a la que un artesano podría llegar con el
 * botón "atrás" del navegador: login_ecommerce.html, la tienda pública,
 * el home, etc.
 *
 * <script src="../js/guardia_sesion_artesano.js"></script>
 *
 * Qué hace: pregunta al servidor si hay sesión de artesano activa. Si la hay,
 * te reenvía de inmediato al panel — así, sin importar a cuál página te lleve
 * el "atrás", terminas de vuelta en admin.php mientras sigas logueado.
 *
 * Ajusta RUTA_ADMIN y RUTA_CHECK según la carpeta desde la que se cargue
 * cada página (los ../ cambian si login_ecommerce.html vive en /html/ y
 * check_sesion_artesano.php vive en /e-commerce/, por ejemplo).
 */
(function () {
    const RUTA_CHECK = '../e-commerce/check_sesion_artesano.php';
    const RUTA_ADMIN  = '../e-commerce/admin.php'; // ajusta el prefijo ../ según desde qué carpeta se cargue cada página

    fetch(RUTA_CHECK, { credentials: 'include', cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
            if (data.activa) {
                window.location.replace(RUTA_ADMIN);
            }
        })
        .catch(() => {
            // Si falla la consulta (red caída, etc.), no bloqueamos al usuario:
            // simplemente se queda en la página que intentaba ver.
        });
})();
