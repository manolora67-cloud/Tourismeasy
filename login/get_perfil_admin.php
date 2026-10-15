<?php
/**
 * login/get_perfil_admin.php
 * Devuelve los datos completos del administrador autenticado, vía fn_obtener_perfil_admin().
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
    $stmt = $pdo->prepare("SELECT * FROM fn_obtener_perfil_admin(:id)");
    $stmt->execute([':id' => $id]);
    $admin = $stmt->fetch();

    if (!$admin) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Administrador no encontrado."]);
        exit;
    }

    echo json_encode(["ok" => true, "admin" => $admin]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_perfil_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}