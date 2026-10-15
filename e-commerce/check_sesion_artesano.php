<?php
/**
 * e-commerce/check_sesion_artesano.php
 *
 * Endpoint chiquito que SOLO responde si hay una sesión de artesano activa.
 * No expone datos sensibles, solo un booleano — para que páginas .html
 * (login, tienda pública, home, etc.) puedan preguntar "¿este visitante ya
 * tiene sesión de artesano abierta?" y redirigirlo de vuelta al panel si es así.
 *
 * Debe ir en la MISMA carpeta que login_artesano.php / admin.php, para que
 * comparta la misma cookie de sesión (mismo path).
 */

session_start();

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
require_once __DIR__ . '/../cors.php';

echo json_encode([
    'activa' => !empty($_SESSION['artesano_id']),
]);
