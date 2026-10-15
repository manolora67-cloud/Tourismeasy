<?php
/**
 * login/actualizar_config_viajero.php
 * Guarda de una vez las preferencias de notificaciones y tema del viajero (upsert).
 * Espera JSON: {
 *   "id": "CEDULA",
 *   "notif_ofertas": true|false,
 *   "tema_oscuro": true|false
 * }
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input = json_decode(file_get_contents('php://input'), true);

$id = trim($input['id'] ?? '');

if (!$id) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "id requerido."]);
    exit;
}

$campos = ['notif_ofertas', 'tema_oscuro'];
foreach ($campos as $c) {
    if (!isset($input[$c]) || !is_bool($input[$c])) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Datos inválidos."]);
        exit;
    }
}

try {
    $chkUsuario = $pdo->prepare("SELECT 1 FROM USUARIOS WHERE ID_PERSONA = :id");
    $chkUsuario->execute([':id' => $id]);
    if (!$chkUsuario->fetch()) {
        http_response_code(403);
        echo json_encode(["ok" => false, "error" => "No autorizado."]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO CONFIG_VIAJERO
            (ID_USUARIO, NOTIF_OFERTAS, TEMA_OSCURO)
        VALUES
            (:id, :ofertas, :tema)
        ON CONFLICT (ID_USUARIO) DO UPDATE
        SET NOTIF_OFERTAS        = :ofertas,
            TEMA_OSCURO          = :tema,
            FECHA_ACTUALIZACION  = NOW()
    ");
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':ofertas', $input['notif_ofertas'], PDO::PARAM_BOOL);
    $stmt->bindValue(':tema', $input['tema_oscuro'], PDO::PARAM_BOOL);
    $stmt->execute();

    echo json_encode(["ok" => true, "mensaje" => "Preferencias guardadas correctamente."]);

} catch (PDOException $e) {
    error_log('[TourismEasy] actualizar_config_viajero.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudieron guardar las preferencias."]);
}