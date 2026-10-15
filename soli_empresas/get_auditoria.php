<?php
/**
 * soli_empresas/get_auditoria.php
 * Lista los últimos eventos de auditoría para el panel admin, vía fn_listar_auditoria().
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

if (empty($_SESSION['tipo']) || $_SESSION['tipo'] !== 'admin') {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

try {
    $stmt = $pdo->query("SELECT * FROM fn_listar_auditoria()");
    echo json_encode(["ok" => true, "data" => $stmt->fetchAll()]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_auditoria.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener la auditoría."]);
}
