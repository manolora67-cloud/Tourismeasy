<?php
/**
 * login/get_estadisticas_empresa.php
 * Devuelve estadísticas reales de la empresa autenticada (servicios publicados),
 * según su TIPO_SERVICIO.
 * GET ?id=ID_EMPRESA
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$id = ($_SESSION['tipo'] ?? '') === 'empresa' ? ($_SESSION['id_empresa'] ?? '') : '';

if (!$id) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT * FROM fn_estadisticas_empresa(:id)');
    $stmt->execute([':id' => $id]);
    $estadistica = $stmt->fetch();
    if (!$estadistica) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Empresa no encontrada."]);
        exit;
    }

    echo json_encode([
        "ok" => true,
        "estadisticas" => [
            "servicios_publicados" => (int)$estadistica['servicios_publicados'],
            "servicios_label"      => $estadistica['servicios_label'],
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_estadisticas_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}