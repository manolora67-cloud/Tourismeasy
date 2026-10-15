<?php
/**
 * login/get_config_viajero.php
 * Devuelve la configuración del viajero (notificaciones y tema).
 * Si no existe una fila en CONFIG_VIAJERO todavía, crea una con los valores por defecto.
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
    $chkUsuario = $pdo->prepare("SELECT 1 FROM USUARIOS WHERE ID_PERSONA = :id");
    $chkUsuario->execute([':id' => $id]);
    if (!$chkUsuario->fetch()) {
        http_response_code(403);
        echo json_encode(["ok" => false, "error" => "No autorizado."]);
        exit;
    }

    // Crear la fila con valores por defecto si todavía no existe
    $stmtIns = $pdo->prepare("
        INSERT INTO CONFIG_VIAJERO (ID_USUARIO)
        VALUES (:id)
        ON CONFLICT (ID_USUARIO) DO NOTHING
    ");
    $stmtIns->execute([':id' => $id]);

    $stmt = $pdo->prepare("
        SELECT
            NOTIF_OFERTAS AS notif_ofertas,
            TEMA_OSCURO   AS tema_oscuro
        FROM CONFIG_VIAJERO
        WHERE ID_USUARIO = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    $config = $stmt->fetch();

    if (!$config) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Configuración no encontrada."]);
        exit;
    }

    echo json_encode(["ok" => true, "config" => $config]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_config_viajero.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}