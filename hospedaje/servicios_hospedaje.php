<?php
/**
 * hospedaje/servicios.php
 * Lista el catálogo de servicios disponibles (SERVICIOS_HOSPEDAJE)
 * para armar los checkboxes del modal de crear/editar hospedaje.
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("
        SELECT ID_SERVICIO AS id, NOMBRE_SERVICIO AS nombre
        FROM SERVICIOS_HOSPEDAJE
        WHERE ACTIVO = TRUE
        ORDER BY NOMBRE_SERVICIO ASC
    ");
    $rows = $stmt->fetchAll();
    echo json_encode(["ok" => true, "data" => $rows]);

} catch (PDOException $e) {
    error_log('[TourismEasy] hospedaje/servicios.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener servicios."]);
}
