<?php
/**
 * login/actualizar_perfil_admin.php
 * Actualiza nombre, apellido, celular y correo del administrador, vía fn_actualizar_perfil_admin().
 * Espera JSON: { "id": "CEDULA", "nombre": "...", "apellido": "...", "email": "...", "tel": "..." }
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input    = json_decode(file_get_contents('php://input'), true);

$id       = trim($input['id']       ?? '');
$nombre   = trim($input['nombre']   ?? '');
$apellido = trim($input['apellido'] ?? '');
$email    = trim($input['email']    ?? '');
$tel      = trim($input['tel']      ?? '');

if (!$id || !$nombre || !$apellido || !$email) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Nombre, apellido y correo son obligatorios."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Correo electrónico inválido."]);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM fn_actualizar_perfil_admin(:id, :nombre, :apellido, :celular, :email)");
    $stmt->execute([
        ':id'       => $id,
        ':nombre'   => $nombre,
        ':apellido' => $apellido,
        ':celular'  => $tel,
        ':email'    => $email,
    ]);
    $row = $stmt->fetch();

    if (!$row['ok']) {
        $code = $row['mensaje'] === 'No autorizado.' ? 403 : 200;
        http_response_code($code);
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    echo json_encode([
        "ok"      => true,
        "mensaje" => $row['mensaje'],
        "admin"   => [
            "nombre"   => $nombre,
            "apellido" => $apellido,
            "celular"  => $tel,
            "email"    => $email,
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] actualizar_perfil_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo actualizar el perfil."]);
}