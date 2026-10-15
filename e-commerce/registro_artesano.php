<?php
/**
 * e-commerce/registro_artesano.php
 * Registra un nuevo artesano llamando a fn_registrar_artesano()
 * (inserta en PERSONAS_ECOMMERCE + USUARIOS_ECOMMERCE con estado PENDIENTE).
 * Espera JSON: {
 *   "documento": "...", "tipo_doc": 1, "nombre": "...", "apellido": "...",
 *   "celular": "...", "email": "...", "password": "..."
 * }
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input     = json_decode(file_get_contents('php://input'), true);
$documento = trim($input['documento'] ?? '');
$tipo_doc  = intval($input['tipo_doc'] ?? 0);
$nombre    = trim($input['nombre']    ?? '');
$apellido  = trim($input['apellido']  ?? '');
$celular   = trim($input['celular']   ?? '');
$email     = trim($input['email']     ?? '');
$password  = trim($input['password']  ?? '');

// ── Validaciones de formato (se quedan en PHP; duplicados/tipo_doc los valida la función) ──
if (!$documento || !$tipo_doc || !$nombre || !$apellido || !$celular || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Todos los campos son obligatorios."]);
    exit;
}

if (!preg_match('/^[0-9]{6,10}$/', $documento)) {
    echo json_encode(["ok" => false, "error" => "El documento debe tener entre 6 y 10 dígitos."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["ok" => false, "error" => "Correo electrónico inválido."]);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(["ok" => false, "error" => "La contraseña debe tener al menos 8 caracteres."]);
    exit;
}

if (!preg_match('/^\+?[0-9]{7,15}$/', $celular)) {
    echo json_encode(["ok" => false, "error" => "Número de celular inválido."]);
    exit;
}

$hash = hash('sha256', $password);

try {
    $stmt = $pdo->prepare("
        SELECT * FROM fn_registrar_artesano(:doc, :tipo_doc, :nombre, :apellido, :celular, :email, :hash)
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

    echo json_encode(["ok" => true, "mensaje" => $row['mensaje']]);

} catch (PDOException $e) {
    error_log('[TourismEasy] registro_artesano.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al registrar. Intenta de nuevo."]);
}