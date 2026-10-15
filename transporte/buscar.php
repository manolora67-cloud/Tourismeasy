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

    $rows = $stmt->fetchAll();


    /*
     * La función devuelve columnas con prefijo t_
     * y un booleano de control.
     * Las mapeamos a las claves que espera el frontend.
     */
    $data = array_map(function($r) {
        return [
            "id"            => $r['t_id_transporte'],
            "empresa"       => $r['t_nom_empresa'],
            "origen"        => $r['t_ciudad_origen'],
            "destino"       => $r['t_ciudad_destino'],
            "fecha_salida"  => $r['t_fecha_salida'],
            "hora_salida"   => $r['t_hora_salida'],
            "precio"        => $r['t_precio'],
            "descripcion"   => $r['t_descripcion'],
            "img_url"       => $r['t_img_url'],
            "id_clase"      => $r['t_id_clase'],
            "nombre_clase"  => $r['t_nombre_clase'],
            "disponible"    => true
        ];
    }, array_filter($rows, function($r) {
        return $r['ejecucion_exitosa'] === true ||
               $r['ejecucion_exitosa'] === 't';
    }));


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