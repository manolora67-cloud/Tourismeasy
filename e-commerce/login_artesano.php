<?php
/**
 * e-commerce/login_artesano.php
 * Delega autenticación y registro del intento a fn_procesar_login()
 * y establece la sesión del artesano.
 */

session_start();

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/seguridad_login.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input    = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email']    ?? '');
$password = trim($input['password'] ?? '');
$reemplazarSesion = ($input['reemplazar_sesion'] ?? false) === true;

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Correo y contraseña requeridos."]);
    exit;
}

try {
    $hashLogin = obtenerHashLoginVerificado($pdo, $email, $password, 'artesano');
    $tokenDispositivo = null;
    $hashDispositivo = null;
    $hashSesion = null;

    if ($hashLogin !== null) {
        session_regenerate_id(true);
        $tokenDispositivo = obtenerTokenDispositivo();
        $hashDispositivo = hash('sha256', $tokenDispositivo);
        $hashSesion = hash('sha256', session_id());
    }

    $stmt = $pdo->prepare(
        'SELECT * FROM fn_procesar_login(:email, :hash, :tipo, :ip, :dispositivo, :sesion, :reemplazar)'
    );
    $stmt->execute([
        ':email' => $email,
        ':hash' => $hashLogin,
        ':tipo' => 'artesano',
        ':ip' => obtenerIpCliente(),
        ':dispositivo' => $hashDispositivo,
        ':sesion' => $hashSesion,
        ':reemplazar' => $reemplazarSesion ? 'true' : 'false',
    ]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => "Error interno del servidor."]);
        exit;
    }

    if ($row['codigo'] === 'BLOQUEADO') {
        http_response_code(429);
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    if ($row['codigo'] === 'ERROR_INTENTO') {
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    if ($row['codigo'] === 'SESION_ACTIVA') {
        http_response_code(409);
        echo json_encode([
            "ok" => false,
            "code" => "SESION_ACTIVA",
            "error" => $row['mensaje'],
        ]);
        exit;
    }

    if ($row['codigo'] === 'SESION_INVALIDA') {
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    if (!filter_var($row['ok'], FILTER_VALIDATE_BOOLEAN)) {
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    $nombre = $row['nombre'] . ' ' . $row['apellido'];
    $avatar = strtoupper(substr($row['nombre'], 0, 1) . substr($row['apellido'], 0, 1));

    // Regeneramos el ID de sesión al loguear (buena práctica de seguridad,
    // evita session fixation) y guardamos los datos que admin.php necesita
    // para saber que hay una sesión válida de artesano.
    guardarCookieDispositivo($tokenDispositivo);
    $_SESSION['artesano_id']     = $row['id_persona'];
    $_SESSION['artesano_nombre'] = $nombre;

    echo json_encode([
        "ok" => true,
        "session" => [
            "tipo"   => "artesano",
            "id"     => $row['id_persona'],
            "email"  => $row['email_login'],
            "nombre" => $nombre,
            "avatar" => $avatar,
            "estado" => $row['estado'],
        ]
    ]);

} catch (Throwable $e) {
    error_log('[TourismEasy] login_artesano.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error interno del servidor."]);
}