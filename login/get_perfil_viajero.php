<?php
/**
 * login/get_perfil_viajero.php
 * Devuelve los datos completos del viajero autenticado.
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
    $stmt = $pdo->prepare("
        SELECT
            p.ID_PERSONA              AS cedula,
            p.NOM_PERSONA             AS nombre,
            p.APE_PERSONA             AS apellido,
            p.NUM_CEL_PERSONA         AS celular,
            p.EMAIL_PERSONA           AS email_persona,
            p.FECHA_REGISTRO          AS fecha_registro,
            u.EMAIL_LOGIN             AS email_login,
            u.ROL                     AS rol,
            u.ESTADO                  AS estado
        FROM PERSONAS p
        JOIN USUARIOS u ON u.ID_PERSONA = p.ID_PERSONA
        WHERE p.ID_PERSONA = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    $viajero = $stmt->fetch();

    if (!$viajero) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Viajero no encontrado."]);
        exit;
    }

    echo json_encode(["ok" => true, "viajero" => $viajero]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_perfil_viajero.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
