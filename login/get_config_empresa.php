<?php
/**
 * login/get_config_empresa.php
 * Devuelve la configuración de la empresa (notificaciones y tema).
 * Si no existe una fila en CONFIG_EMPRESA todavía, crea una con los valores por defecto.
 * GET ?id=ID_EMPRESA
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
    $chkEmpresa = $pdo->prepare("SELECT 1 FROM USUARIOS_EMPRESA WHERE ID_EMPRESA = :id");
    $chkEmpresa->execute([':id' => $id]);
    if (!$chkEmpresa->fetch()) {
        http_response_code(403);
        echo json_encode(["ok" => false, "error" => "No autorizado."]);
        exit;
    }

    // Crear la fila con valores por defecto si todavía no existe
    $stmtIns = $pdo->prepare("
        INSERT INTO CONFIG_EMPRESA (ID_EMPRESA)
        VALUES (:id)
        ON CONFLICT (ID_EMPRESA) DO NOTHING
    ");
    $stmtIns->execute([':id' => $id]);

    $stmt = $pdo->prepare("
        SELECT
            NOTIF_NUEVAS_RESERVAS AS notif_reservas,
            NOTIF_CANCELACIONES   AS notif_cancelaciones,
            NOTIF_BOLETIN         AS notif_boletin,
            TEMA_OSCURO           AS tema_oscuro
        FROM CONFIG_EMPRESA
        WHERE ID_EMPRESA = :id
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
    error_log('[TourismEasy] get_config_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
