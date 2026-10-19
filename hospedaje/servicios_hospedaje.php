<?php
/**
 * hospedaje/servicios_hospedaje.php
 * Lista el catálogo de servicios disponibles (SERVICIOS_HOSPEDAJE)
 * para armar los checkboxes del modal de crear/editar hospedaje.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query('SELECT * FROM fn_listar_servicios_hospedaje()');
    $rows = $stmt->fetchAll();
    echo json_encode(["ok" => true, "data" => $rows]);

} catch (PDOException $e) {
    error_log('[TourismEasy] hospedaje/servicios_hospedaje.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener servicios."]);
}
