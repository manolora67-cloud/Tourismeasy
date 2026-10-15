<?php
/**
 * registro_viajero.php
 * Registra un nuevo viajero llamando a fn_registrar_viajero()
 * (inserta en PERSONAS + USUARIOS).
 * Espera JSON: { "documento": "...", "tipo_doc": 1, "nombre": "...", "apellido": "...",
 *               "celular": "...", "email": "...", "password": "..." }
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$input = json_decode(file_get_contents('php://input'), true);

$documento     = trim($input['documento']     ?? '');
$tipo_doc      = intval($input['tipo_doc']    ?? 0);
$nombre        = trim($input['nombre']        ?? '');
$apellido      = trim($input['apellido']      ?? '');
$celular       = trim($input['celular']       ?? '');
$email         = trim($input['email']         ?? '');
$password      = trim($input['password']      ?? '');

// Validaciones de formato (se quedan en PHP; duplicados los valida la función)
if (!$documento || !$tipo_doc || !$nombre || !$apellido || !$celular || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Todos los campos son obligatorios."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Correo electrónico inválido."]);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "La contraseña debe tener al menos 8 caracteres."]);
    exit;
}

$hash = hash('sha256', $password);

try {
    $stmt = $pdo->prepare("
        SELECT * FROM fn_registrar_viajero(:doc, :tipo_doc, :nombre, :apellido, :celular, :email, :hash)
    ");
    $stmt->execute([
        ':doc'      => $documento,
        ':tipo_doc' => $tipo_doc,
        ':nombre'   => $nombre,
        ':apellido' => $apellido,
        ':celular'  => $celular,
        ':email'    => $email,
        ':hash'     => $hash,
    ]);
    $row = $stmt->fetch();

    if (!$row['ok']) {
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    $avatar = strtoupper(substr($nombre, 0, 1) . substr($apellido, 0, 1));

    echo json_encode([
        "ok"      => true,
        "mensaje" => $row['mensaje'],
        "session" => [
            "tipo"   => "viajero",
            "id"     => $documento,
            "email"  => $email,
            "nombre" => $nombre . ' ' . $apellido,
            "avatar" => $avatar,
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] registro_viajero.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al crear la cuenta. Intenta de nuevo."]);
}
