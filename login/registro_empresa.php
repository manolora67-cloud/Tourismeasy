<?php
/**
 * registro_empresa.php
 * Registra una nueva empresa llamando a fn_registrar_empresa()
 * (inserta en EMPRESAS + USUARIOS_EMPRESA con estado PENDIENTE).
 * Espera JSON: {
 *   "nit": "1234567890", "nombre": "...", "email_inst": "...",
 *   "contacto": "...", "id_ciudad": "68081", "tipo_servicio": "PLANES",
 *   "email_login": "...", "password": "..."
 * }
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$input        = json_decode(file_get_contents('php://input'), true);
$nit          = trim($input['nit']          ?? '');
$nombre       = trim($input['nombre']       ?? '');
$email_inst   = trim($input['email_inst']   ?? '');
$contacto     = trim($input['contacto']     ?? '');
$id_ciudad    = trim($input['id_ciudad']    ?? '');
$tipo_serv    = trim($input['tipo_servicio'] ?? 'PLANES');
$email_login  = trim($input['email_login']  ?? '');
$password     = trim($input['password']     ?? '');

// Validaciones de formato (se quedan en PHP; las de negocio/duplicados las hace la función)
if (!$nit || !$nombre || !$email_inst || !$contacto || !$id_ciudad || !$email_login || !$password) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Todos los campos son obligatorios."]);
    exit;
}

if (strlen($nit) !== 10 || !ctype_digit($nit)) {
    echo json_encode(["ok" => false, "error" => "El NIT debe tener exactamente 10 dígitos."]);
    exit;
}

if (!filter_var($email_login, FILTER_VALIDATE_EMAIL) || !filter_var($email_inst, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["ok" => false, "error" => "Correo electrónico inválido."]);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(["ok" => false, "error" => "La contraseña debe tener al menos 8 caracteres."]);
    exit;
}

$tipos_validos = ['HOSPEDAJE','PLANES','TRANSPORTE','PERSONAL_AUXILIAR'];
if (!in_array($tipo_serv, $tipos_validos)) {
    echo json_encode(["ok" => false, "error" => "Tipo de servicio inválido."]);
    exit;
}

$hash = hash('sha256', $password);

try {
    $stmt = $pdo->prepare("
        SELECT * FROM fn_registrar_empresa(:nit, :nombre, :email_inst, :contacto, :ciudad, :tipo, :email_login, :hash)
    ");
    $stmt->execute([
        ':nit'         => $nit,
        ':nombre'      => $nombre,
        ':email_inst'  => $email_inst,
        ':contacto'    => $contacto,
        ':ciudad'      => $id_ciudad,
        ':tipo'        => $tipo_serv,
        ':email_login' => $email_login,
        ':hash'        => $hash,
    ]);
    $row = $stmt->fetch();

    if (!$row['ok']) {
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    echo json_encode(["ok" => true, "mensaje" => $row['mensaje']]);

} catch (PDOException $e) {
    error_log('[TourismEasy] registro_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al registrar la empresa. Intenta de nuevo."]);
}