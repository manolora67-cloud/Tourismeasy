<?php
/**
 * Actualiza el perfil del administrador autenticado mediante fn_actualizar_perfil_admin().
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$id = ($_SESSION['tipo'] ?? '') === 'admin' ? ($_SESSION['id_persona'] ?? '') : '';
if (!$id) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado. Inicia sesión nuevamente."]);
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

foreach (['nombre', 'apellido', 'email', 'tel'] as $field) {
    if (!isset($input[$field]) || !is_string($input[$field])) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "Falta un dato o su formato es inválido."]);
        exit;
    }
}

$nombre = trim($input['nombre']);
$apellido = trim($input['apellido']);
$email = trim($input['email']);
$tel = trim($input['tel']);

if (!preg_match('/^.{2,50}$/us', $nombre)
    || !preg_match('/^.{2,50}$/us', $apellido)
    || $email === '') {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El nombre y el apellido deben tener entre 2 y 50 caracteres, y el correo es obligatorio."]);
    exit;
}

if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Correo electrónico inválido."]);
    exit;
}

if ($tel !== '' && !preg_match('/^\+?[0-9]{7,15}$/', $tel)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El teléfono debe tener entre 7 y 15 dígitos y puede iniciar con +."]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT * FROM fn_actualizar_perfil_admin(:id, :nombre, :apellido, :celular, :email)'
    );
    $stmt->execute([
        ':id' => $id,
        ':nombre' => $nombre,
        ':apellido' => $apellido,
        ':celular' => $tel,
        ':email' => $email,
    ]);
    $row = $stmt->fetch();
    $ok = in_array(
        strtolower((string) ($row['ok'] ?? '')),
        ['1', 't', 'true', 'yes', 'on'],
        true
    );

    if (!$row || !$ok) {
        $mensaje = $row['mensaje'] ?? 'No se pudo actualizar el perfil.';
        http_response_code(strpos($mensaje, 'ya está en uso') !== false ? 409 : 400);
        echo json_encode(["ok" => false, "error" => $mensaje]);
        exit;
    }

    $_SESSION['email'] = $email;
    $_SESSION['nombre'] = trim($nombre . ' ' . $apellido);
    echo json_encode([
        "ok" => true,
        "mensaje" => $row['mensaje'],
        "admin" => [
            "nombre" => $nombre,
            "apellido" => $apellido,
            "celular" => $tel,
            "email" => $email,
        ],
    ]);
} catch (PDOException $e) {
    error_log('[TourismEasy] actualizar_perfil_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo actualizar el perfil."]);
}
