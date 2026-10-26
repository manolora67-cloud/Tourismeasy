<?php
/**
 * transporte/buscar.php
 * Búsqueda pública de rutas de transporte, usando fn_buscar_transporte().
 * GET ?id_ciudad_origen=&id_ciudad_destino=&fecha=&id_clase=
 * Todos los parámetros son opcionales.
 */

require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

$origenEntrada = $_GET['id_ciudad_origen'] ?? null;
$destinoEntrada = $_GET['id_ciudad_destino'] ?? null;
$origen = (is_string($origenEntrada) || is_int($origenEntrada))
    ? (trim((string)$origenEntrada) ?: null)
    : null;
$destino = (is_string($destinoEntrada) || is_int($destinoEntrada))
    ? (trim((string)$destinoEntrada) ?: null)
    : null;
$fechaEntrada = $_GET['fecha'] ?? null;
$fecha = (is_string($fechaEntrada) || is_int($fechaEntrada))
    ? (trim((string)$fechaEntrada) ?: null)
    : null;
$id_clase = null;
if (isset($_GET['id_clase']) && $_GET['id_clase'] !== '') {
    $idClaseEntrada = $_GET['id_clase'];
    $id_clase = (is_string($idClaseEntrada) || is_int($idClaseEntrada))
        ? trim((string)$idClaseEntrada)
        : '';
    if (!preg_match('/^[1-9][0-9]{0,9}$/D', $id_clase)) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Clase de servicio inválida."]);
        exit;
    }
}


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

if (($origenEntrada !== null && !is_string($origenEntrada) && !is_int($origenEntrada))
    || ($destinoEntrada !== null && !is_string($destinoEntrada) && !is_int($destinoEntrada))
    || ($fechaEntrada !== null && !is_string($fechaEntrada) && !is_int($fechaEntrada))) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Los municipios de la ruta no son válidos."]);
    exit;
}

foreach (['origen' => $origen, 'destino' => $destino] as $extremo => $idCiudad) {
    if ($idCiudad !== null && !preg_match('/^[A-Za-z0-9]{5,6}$/D', $idCiudad)) {
        http_response_code(400);
        echo json_encode([
            "ok" => false,
            "error" => "El municipio de " . $extremo . " no es válido."
        ]);
        exit;
    }
}


try {

    $stmt = $pdo->prepare("
        SELECT *
        FROM fn_buscar_transporte(
            :id_ciudad_origen,
            :id_ciudad_destino,
            :fecha,
            NULL,
            :id_clase
        )
    ");

    $stmt->execute([
        ':id_ciudad_origen'  => $origen,
        ':id_ciudad_destino' => $destino,
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