<?php
/**
 * datos_referencia.php
 * Devuelve listas de referencia para poblar selects en los paneles empresa.
 * GET ?tipo=ciudades        → lista de ciudades
 * GET ?tipo=tipos_plan      → tipos de plan turístico
 * GET ?tipo=todos           → ciudades y tipos de plan
 */

require_once __DIR__ . '/con_db/db.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

$tipo = $_GET['tipo'] ?? 'todos';
$tiposPermitidos = ['ciudades', 'tipos_plan', 'todos'];

if (!in_array($tipo, $tiposPermitidos, true)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Tipo de referencia inválido."]);
    exit;
}

try {
    $respuesta = [];

    if ($tipo === 'ciudades' || $tipo === 'todos') {
        $stmt = $pdo->query("SELECT ID_CIUDAD AS id, NOM_CIUDAD AS nombre FROM CIUDADES ORDER BY NOM_CIUDAD");
        $respuesta['ciudades'] = $stmt->fetchAll();
    }

    if ($tipo === 'tipos_plan' || $tipo === 'todos') {
        $stmt = $pdo->query("SELECT ID_TIPO_PLAN AS id, NOM_TIPO_PLAN AS nombre FROM TIPOS_DE_PLAN_TURISTICO ORDER BY NOM_TIPO_PLAN");
        $respuesta['tipos_plan'] = $stmt->fetchAll();
    }

    echo json_encode(["ok" => true, "data" => $respuesta]);

} catch (PDOException $e) {
    error_log('[TourismEasy] datos_referencia.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener datos de referencia."]);
}