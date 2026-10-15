<?php
/**
 * login/get_estadisticas_admin.php
 * Devuelve estadísticas globales reales de la plataforma, vía fn_estadisticas_admin().
 * GET (sin parámetros)
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

try {
    $stmt = $pdo->query("SELECT * FROM fn_estadisticas_admin()");
    $row = $stmt->fetch();

    echo json_encode([
        "ok" => true,
        "estadisticas" => [
            "empresas_registradas"  => (int) $row['empresas_registradas'],
            "calificacion_promedio" => $row['calificacion_promedio'] !== null ? (float) $row['calificacion_promedio'] : null,
            "servicios_activos"     => (int) $row['servicios_activos'],
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_estadisticas_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}