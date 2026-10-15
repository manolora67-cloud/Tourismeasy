<?php
/**
 * resenas/get_resenas.php
 * Devuelve reseñas públicas con likes asociados al navegador visitante.
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$visitorId  = isset($_GET['visitor_id']) ? trim($_GET['visitor_id']) : null;

try {
    // Auto-limpieza: si ya entramos a un mes nuevo, borra las reseñas
    // del mes anterior. Es liviano (solo compara una fecha) cuando ya
    // se hizo la limpieza de este mes, así que es seguro dejarlo aquí.
    $pdo->query("SELECT * FROM fn_limpiar_resenas_mes_anterior()");

    $stmt = $pdo->prepare("SELECT * FROM fn_listar_resenas(:visitor_actual)");
    $stmt->execute([':visitor_actual' => $visitorId ?: null]);

    echo json_encode(["ok" => true, "data" => $stmt->fetchAll()]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_resenas.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener reseñas."]);
}