<?php
/**
 * login/get_config_admin.php
 * Devuelve la configuración del administrador, vía fn_obtener_config_admin()
 * (crea la fila con valores por defecto si todavía no existía).
 * GET ?id=ID_PERSONA
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$id = trim($_GET['id'] ?? '');

if (!$id) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "id requerido."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM fn_obtener_config_admin(:id)");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row['ok']) {
        http_response_code(403);
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    echo json_encode([
        "ok"     => true,
        "config" => [
            "notif_reservas"      => $row['notif_reservas'],
            "notif_cancelaciones" => $row['notif_cancelaciones'],
            "notif_resenas"       => $row['notif_resenas'],
            "notif_boletin"       => $row['notif_boletin'],
            "tema_oscuro"         => $row['tema_oscuro'],
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_config_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}