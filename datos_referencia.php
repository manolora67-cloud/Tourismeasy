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
    $stmt = $pdo->prepare('SELECT fn_datos_referencia(:tipo) AS datos');
    $stmt->execute([':tipo' => $tipo]);
    $json = $stmt->fetchColumn();
    if ($json === false || $json === null) {
        throw new RuntimeException('La función SQL no devolvió datos de referencia.');
    }
    $respuesta = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    echo json_encode(["ok" => true, "data" => $respuesta]);

} catch (Throwable $e) {
    error_log('[TourismEasy] datos_referencia.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener datos de referencia."]);
}