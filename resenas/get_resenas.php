<?php
/**
 * resenas/get_resenas.php
 * Devuelve reseñas públicas con likes asociados al navegador visitante.
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$visitorId  = isset($_GET['visitor_id']) ? trim($_GET['visitor_id']) : null;

try {
    if (($_GET['solo_likes'] ?? '') === '1') {
        $stmt = $pdo->query(
            'SELECT r.ID_RESENA AS id, COUNT(l.ID_LIKE)::INTEGER AS likes
             FROM RESENAS_PLATAFORMA r
             LEFT JOIN LIKES_RESENAS l ON l.ID_RESENA = r.ID_RESENA
             GROUP BY r.ID_RESENA, r.FECHA_CREACION
             ORDER BY r.FECHA_CREACION DESC
             LIMIT 50'
        );

        echo json_encode(["ok" => true, "data" => $stmt->fetchAll()]);
        exit;
    }

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