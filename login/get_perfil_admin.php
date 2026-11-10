<?php
/**
 * login/get_perfil_admin.php
 * Devuelve los datos completos del administrador autenticado, vía fn_obtener_perfil_admin().
 * La cuenta se identifica desde la sesión del servidor, no desde un ID del cliente.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
require_once __DIR__ . '/../cors.php';

$id = ($_SESSION['tipo'] ?? '') === 'admin' ? ($_SESSION['id_persona'] ?? '') : '';
if (!is_string($id) || $id === '') {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
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
    echo json_encode(["ok" => false, "error" => "No se pudo cargar el perfil del administrador."]);
}