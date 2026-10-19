<?php
/**
 * login/get_config_empresa.php
 * Devuelve la configuración de la empresa (notificaciones y tema).
 * Si no existe una fila en CONFIG_EMPRESA todavía, crea una con los valores por defecto.
 * GET ?id=ID_EMPRESA
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
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
    $stmt = $pdo->prepare('SELECT * FROM fn_obtener_config_empresa(:id)');
    $stmt->execute([':id' => $id]);
    $config = $stmt->fetch();
    if (!$config) {
        http_response_code(403);
        echo json_encode(["ok" => false, "error" => "No autorizado."]);
        exit;
    }
    echo json_encode(["ok" => true, "config" => $config]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_config_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
