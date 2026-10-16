<?php
/**
 * transporte/buscar.php
 * Búsqueda pública de rutas de transporte, usando fn_buscar_transporte().
 * GET ?origen=&destino=&fecha=&id_clase=
 * Todos los parámetros son opcionales.
 */

require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

$origen    = trim($_GET['origen']    ?? '') ?: null;
$destino   = trim($_GET['destino']   ?? '') ?: null;
$fecha     = trim($_GET['fecha']     ?? '') ?: null;
$id_clase  = isset($_GET['id_clase']) && $_GET['id_clase'] !== ''
    ? intval($_GET['id_clase'])
    : null;


/* =========================================================
   VALIDAR FECHA
   ========================================================= */

if ($fecha && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "error" => "Formato de fecha inválido. Use YYYY-MM-DD."
    ]);
    exit;
}


/* =========================================================
   VALIDAR CLASE
   ========================================================= */

if ($id_clase !== null && $id_clase <= 0) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "error" => "Clase de servicio inválida."
    ]);
    exit;
}


try {

    $stmt = $pdo->prepare("
        SELECT *
        FROM fn_buscar_transporte(
            :origen,
            :destino,
            :fecha,
            NULL,
            :id_clase
        )
    ");

    $stmt->execute([
        ':origen'   => $origen,
        ':destino'  => $destino,
        ':fecha'    => $fecha,
        ':id_clase' => $id_clase,
    ]);

    $data = $stmt->fetchAll();

    echo json_encode([
        "ok" => true,
        "data" => array_values($data)
    ]);

} catch (PDOException $e) {

    error_log('[TourismEasy] transporte/buscar.php - ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "ok" => false,
        "error" => "Error al buscar rutas."
    ]);
}