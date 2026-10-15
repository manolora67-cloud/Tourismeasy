<?php
/**
 * login/actualizar_perfil_viajero.php
 * Actualiza nombre, apellido, celular y correo del viajero autenticado.
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
    // El correo (login) debe seguir siendo único entre USUARIOS
    $check = $pdo->prepare("SELECT 1 FROM USUARIOS WHERE EMAIL_LOGIN = :email AND ID_PERSONA <> :id");
    $check->execute([':email' => $email, ':id' => $id]);
    if ($check->fetch()) {
        echo json_encode(["ok" => false, "error" => "Ese correo ya está en uso por otra cuenta."]);
        exit;
    }

    $pdo->beginTransaction();

    $stmtP = $pdo->prepare("
        UPDATE PERSONAS
        SET NOM_PERSONA     = :nombre,
            APE_PERSONA     = :apellido,
            NUM_CEL_PERSONA = COALESCE(NULLIF(:celular, ''), NUM_CEL_PERSONA),
            EMAIL_PERSONA   = :email
        WHERE ID_PERSONA = :id
    ");
    $stmtP->execute([
        ':nombre'   => $nombre,
        ':apellido' => $apellido,
        ':celular'  => $tel,
        ':email'    => $email,
        ':id'       => $id,
    ]);

    $stmtU = $pdo->prepare("
        UPDATE USUARIOS
        SET EMAIL_LOGIN = :email
        WHERE ID_PERSONA = :id
    ");
    $stmtU->execute([':email' => $email, ':id' => $id]);

    $pdo->commit();

    echo json_encode([
        "ok"      => true,
        "mensaje" => "Perfil actualizado correctamente.",
        "viajero" => [
            "nombre"   => $nombre,
            "apellido" => $apellido,
            "celular"  => $tel,
            "email"    => $email,
        ]
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('[TourismEasy] actualizar_perfil_viajero.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo actualizar el perfil."]);
}
