<?php
/**
 * login.php
 * Valida la petición, delega la autenticación a fn_procesar_login()
 * y establece la sesión HTTP.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/seguridad_login.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$tipo = trim($input['tipo'] ?? '');
$reemplazarSesion = ($input['reemplazar_sesion'] ?? false) === true;

if (!$email || !$password || !in_array($tipo, ['admin', 'empresa'], true)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Datos incompletos."]);
    exit;
}

try {
    $hashLogin = obtenerHashLoginVerificado($pdo, $email, $password, $tipo);
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
        ':tipo' => $tipo,
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

    guardarCookieDispositivo($tokenDispositivo);
    $_SESSION['tipo'] = $row['rol'];
    $_SESSION['email'] = $row['email_login'];

    if ($row['rol'] === 'empresa') {
        $_SESSION['id_empresa'] = $row['id'];
        $_SESSION['tipo_servicio'] = $row['tipo_servicio'];
        $_SESSION['nombre'] = $row['nombre'];
        $avatar = strtoupper(substr(preg_replace('/[^A-Za-z ]/', '', $row['nombre']), 0, 2));
        $nombre_sesion = $row['nombre'];
        $datos_sesion = [
            "tipo" => "empresa",
            "id" => $row['id'],
            "email" => $row['email_login'],
            "nombre" => $row['nombre'],
            "tipoServicio" => $row['tipo_servicio'],
            "avatar" => $avatar,
        ];
    } else {
        $_SESSION['id_persona'] = $row['id'];
        $nombre_sesion = trim($row['nombre'] . ' ' . $row['apellido']);
        $_SESSION['nombre'] = $nombre_sesion;
        $avatar = strtoupper(substr($row['nombre'], 0, 1) . substr($row['apellido'], 0, 1));
        $datos_sesion = [
            "tipo" => $row['rol'],
            "id" => $row['id'],
            "email" => $row['email_login'],
            "nombre" => $nombre_sesion,
            "avatar" => $avatar,
        ];
    }

    echo json_encode(["ok" => true, "session" => $datos_sesion]);
} catch (Throwable $e) {
    error_log('[TourismEasy] login.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error interno del servidor."]);
}