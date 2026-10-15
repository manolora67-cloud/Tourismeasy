<?php
/**
 * login/actualizar_config_admin.php
 * Actualiza un campo de configuración del administrador, vía fn_actualizar_config_admin() (upsert).
 * Espera JSON: { "id": "CEDULA", "campo": "notif_reservas"|"notif_cancelaciones"|"notif_resenas"|"notif_boletin"|"tema_oscuro", "valor": true|false }
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input = json_decode(file_get_contents('php://input'), true);

$id    = trim($input['id']    ?? '');
$campo = trim($input['campo'] ?? '');
$valor = $input['valor'] ?? null;

$campos_validos = ['notif_reservas', 'notif_cancelaciones', 'notif_resenas', 'notif_boletin', 'tema_oscuro'];

if (!$id || !$campo || !in_array($campo, $campos_validos, true) || !is_bool($valor)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Datos inválidos."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT fn_actualizar_config_admin(:id, :campo, :valor)");
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':campo', $campo);
    $stmt->bindValue(':valor', $valor, PDO::PARAM_BOOL);
    $stmt->execute();

    if (!$stmt->fetchColumn()) {
        http_response_code(403);
        echo json_encode(["ok" => false, "error" => "No se pudo actualizar la configuración."]);
        exit;
    }

    echo json_encode(["ok" => true]);

} catch (PDOException $e) {
    error_log('[TourismEasy] actualizar_config_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo actualizar la configuración."]);
}