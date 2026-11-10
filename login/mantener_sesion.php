<?php
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
require_once __DIR__ . '/../cors.php';

if (empty($_SESSION['tipo']) && empty($_SESSION['artesano_id'])) {
    http_response_code(401);
    echo json_encode(['activa' => false]);
    exit;
}

$_SESSION['te_ultima_actividad'] = time();
renovarCookieSesionPersistente();

echo json_encode(['activa' => true]);
