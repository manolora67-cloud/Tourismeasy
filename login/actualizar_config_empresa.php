<?php
/**
 * login/actualizar_config_empresa.php
 * Actualiza un campo de configuración de la empresa (upsert).
 * Espera JSON: { "campo": "notif_cancelaciones" | "notif_boletin" | "tema_oscuro", "valor": true|false }
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input = json_decode(file_get_contents('php://input'), true);

$id    = ($_SESSION['tipo'] ?? '') === 'empresa' ? ($_SESSION['id_empresa'] ?? '') : '';
$campo = trim($input['campo'] ?? '');
$valor = $input['valor'] ?? null;

if (!$id) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

if (!$campo || !in_array($campo, ['notif_cancelaciones', 'notif_boletin', 'tema_oscuro'], true) || !is_bool($valor)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Datos inválidos."]);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT fn_actualizar_config_empresa(:id, :campo, :valor)::TEXT');
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':campo', $campo);
    $stmt->bindValue(':valor', $valor, PDO::PARAM_BOOL);
    $stmt->execute();
    if (!in_array($stmt->fetchColumn(), ['t', 'true', '1', 1, true], true)) {
        http_response_code(403);
        echo json_encode(["ok" => false, "error" => "No autorizado o configuración inválida."]);
        exit;
    }

    echo json_encode(["ok" => true]);

} catch (PDOException $e) {
    error_log('[TourismEasy] actualizar_config_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo actualizar la configuración."]);
}
