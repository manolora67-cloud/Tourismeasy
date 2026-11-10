<?php
/**
 * e-commerce/logout_artesano.php
 * Cierra la sesión de servidor del artesano.
 * El endpoint invalida la sesión en el servidor; borrar la pista de interfaz
 * del navegador por sí sola no cerraría la cookie de sesión.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
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
