<?php
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../cors.php';

$id = $_SESSION['artesano_id'] ?? '';
if ($id === '') {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado. Inicia sesión nuevamente."]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($metodo, ['GET', 'POST'], true)) {
    http_response_code(405);
    echo json_encode(["ok" => false, "error" => "Método no permitido."]);
    exit;
}

if ($metodo === 'GET') {
    try {
        $stmt = $pdo->prepare('SELECT * FROM fn_obtener_perfil_artesano(:id)');
        $stmt->execute([':id' => $id]);
        $perfil = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$perfil) {
            http_response_code(404);
            echo json_encode(["ok" => false, "error" => "No se encontró el perfil del artesano."]);
            exit;
        }

        echo json_encode(["ok" => true, "perfil" => $perfil]);
    } catch (PDOException $e) {
        error_log('[TourismEasy] perfil_artesano.php GET - ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => "No se pudieron cargar los datos de la cuenta."]);
    }
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El cuerpo de la solicitud no es JSON válido."]);
    exit;
}

if (!is_array($input) || !isset($input['email'], $input['telefono'])
    || !is_string($input['email']) || !is_string($input['telefono'])) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Completa el correo y el teléfono de contacto."]);
    exit;
}

$email = trim($input['email']);
$telefono = trim($input['telefono']);
if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El correo electrónico no es válido."]);
    exit;
}
if (!preg_match('/^\+?[0-9]{7,15}$/', $telefono)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "El teléfono debe tener entre 7 y 15 dígitos y puede iniciar con +."]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT * FROM fn_actualizar_contacto_artesano(:id, :email, :telefono)'
    );
    $stmt->execute([
        ':id' => $id,
        ':email' => $email,
        ':telefono' => $telefono,
    ]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    $actualizado = in_array(
        strtolower((string) ($resultado['ok'] ?? '')),
        ['1', 't', 'true', 'yes', 'on'],
        true
    );

    if (!$resultado || !$actualizado) {
        $mensaje = $resultado['mensaje'] ?? 'No se pudieron actualizar los datos de contacto.';
        http_response_code(strpos($mensaje, 'ya está registrado') !== false ? 409 : 400);
        echo json_encode(["ok" => false, "error" => $mensaje]);
        exit;
    }

    $_SESSION['email'] = $resultado['email'];
    echo json_encode([
        "ok" => true,
        "mensaje" => $resultado['mensaje'],
        "email" => $resultado['email'],
        "telefono" => $resultado['telefono'],
    ]);
} catch (PDOException $e) {
    error_log('[TourismEasy] perfil_artesano.php POST - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudieron actualizar los datos de contacto."]);
}
