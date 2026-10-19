<?php
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/seguridad_login.php';
require_once __DIR__ . '/../cors.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}
if (!in_array($_SESSION['tipo'] ?? '', ['admin', 'empresa'], true)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No hay una sesión activa.']);
    exit;
}

try {
    cerrarSesionActiva($pdo);
    destruirSesionActual();
    echo json_encode(['ok' => true]);
} catch (Throwable $e) {
    error_log('[TourismEasy] logout_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo cerrar la sesión.']);
}
