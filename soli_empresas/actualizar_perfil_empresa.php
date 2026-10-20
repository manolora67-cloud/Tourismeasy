<?php
/**
 * Actualiza los datos editables de la empresa autenticada.
 * El correo de acceso se actualiza junto con el perfil.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$id = ($_SESSION['tipo'] ?? '') === 'empresa' ? ($_SESSION['id_empresa'] ?? '') : '';
if (!$id) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(["ok" => false, "error" => "Método no permitido."]);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El cuerpo de la solicitud no es JSON válido."]);
    exit;
}

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Datos de perfil inválidos."]);
    exit;
}

foreach (['nombre', 'email_institucional', 'email_acceso', 'contacto', 'id_ciudad'] as $field) {
    if (!isset($input[$field]) || !is_string($input[$field])) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Falta un dato o su formato es inválido."]);
        exit;
    }
}

$nombre = trim($input['nombre']);
$emailInstitucional = trim($input['email_institucional']);
$emailAcceso = trim($input['email_acceso']);
$contacto = trim($input['contacto']);
$idCiudad = trim($input['id_ciudad']);

if (!preg_match('/^.{2,50}$/us', $nombre)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "La razón social debe tener entre 2 y 50 caracteres."]);
    exit;
}

if (strlen($emailInstitucional) > 254 || !filter_var($emailInstitucional, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El correo institucional no es válido."]);
    exit;
}

if (strlen($emailAcceso) > 254 || !filter_var($emailAcceso, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El correo de acceso no es válido."]);
    exit;
}

if (!preg_match('/^\+?[0-9]{7,15}$/', $contacto)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El teléfono debe tener entre 7 y 15 dígitos y puede iniciar con +."]);
    exit;
}

if (!preg_match('/^[0-9A-Za-z]{5,6}$/', $idCiudad)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Selecciona un municipio válido."]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT * FROM fn_actualizar_perfil_empresa(:id, :nombre, :email_inst, :contacto, :ciudad, :email_login)'
    );
    $stmt->execute([
        ':id' => $id,
        ':nombre' => $nombre,
        ':email_inst' => $emailInstitucional,
        ':contacto' => $contacto,
        ':ciudad' => $idCiudad,
        ':email_login' => $emailAcceso,
    ]);
    $result = $stmt->fetch();
    $resultOk = in_array(
        strtolower((string) ($result['ok'] ?? '')),
        ['1', 't', 'true', 'yes', 'on'],
        true
    );

    if (!$result || !$resultOk) {
        $code = $result['codigo'] ?? 'PROFILE_UPDATE_REJECTED';
        $status = in_array($code, ['MONTHLY_LIMIT', 'EMAIL_TAKEN'], true) ? 409 : ($code === 'NOT_FOUND' ? 404 : 400);
        http_response_code($status);
        echo json_encode([
            "ok" => false,
            "code" => $code,
            "error" => $result['mensaje'] ?? "No se pudo actualizar el perfil.",
            "proxima_edicion" => $result['proxima_edicion'] ?? null,
        ]);
        exit;
    }

    $_SESSION['email'] = $emailAcceso;
    $_SESSION['nombre'] = $nombre;
    echo json_encode([
        "ok" => true,
        "actualizado" => in_array(
            strtolower((string) ($result['actualizado'] ?? '')),
            ['1', 't', 'true', 'yes', 'on'],
            true
        ),
        "mensaje" => $result['mensaje'],
    ]);
} catch (PDOException $e) {
    error_log('[TourismEasy] actualizar_perfil_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo actualizar el perfil."]);
}
