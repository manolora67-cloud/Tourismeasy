<?php
/**
 * e-commerce/logout_artesano.php
 * Cierra la sesión de servidor del artesano.
 * Borrar sessionStorage en el navegador (lo que hacía antes btnLogoutArtesano)
 * solo le oculta la sesión a ESE navegador: la cookie de sesión seguiría
 * siendo válida hasta que el servidor la destruya de verdad, que es lo que
 * hace este endpoint.
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/seguridad_login.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}

if (empty($_SESSION['artesano_id'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No hay una sesión de artesano activa.']);
    exit;
}

try {
    cerrarSesionActiva($pdo);
    destruirSesionActual();
    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    error_log('[TourismEasy] logout_artesano.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo cerrar la sesión.']);
}
