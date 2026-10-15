<?php
/**
 * api/get_perfil_empresa.php
 * Devuelve los datos completos de la empresa autenticada.
 * GET ?id=NIT_EMPRESA
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
            e.ID_EMPRESA            AS nit,
            e.NOM_EMPRESA           AS nombre,
            e.EMAIL_INSTITU_EMPRESA AS email_inst,
            e.NUM_CONTACTO_EMPRESA  AS contacto,
            e.TIPO_SERVICIO         AS servicio,
            e.ID_CIUDAD             AS id_ciudad,
            c.NOM_CIUDAD            AS ciudad,
            d.NOM_DPTO              AS departamento,
            u.EMAIL_LOGIN           AS email_login,
            u.ESTADO                AS estado,
            u.FECHA_REGISTRO        AS fecha_registro
        FROM EMPRESAS e
        JOIN USUARIOS_EMPRESA u ON u.ID_EMPRESA   = e.ID_EMPRESA
        LEFT JOIN CIUDADES    c ON c.ID_CIUDAD     = e.ID_CIUDAD
        LEFT JOIN DEPARTAMENTOS d ON d.ID_DPTO     = c.ID_DPTO
        WHERE e.ID_EMPRESA = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    $empresa = $stmt->fetch();

    if (!$empresa) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Empresa no encontrada."]);
        exit;
    }

    echo json_encode(["ok" => true, "empresa" => $empresa]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_perfil_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
