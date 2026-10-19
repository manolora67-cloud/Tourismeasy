<?php
/**
 * transporte/clases.php
 * Lista el catálogo de clases disponibles (CLASE_SERVICIO_TRANSPORTE)
 * para armar el selector de clase en crear/editar transporte.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query('SELECT * FROM fn_listar_clases_transporte()');

    $rows = $stmt->fetchAll();

    echo json_encode([
        "ok" => true,
        "data" => $rows
    ]);

} catch (PDOException $e) {

    error_log('[TourismEasy] transporte/clases.php - ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        "ok" => false,
        "error" => "Error al obtener clases de transporte."
    ]);
}