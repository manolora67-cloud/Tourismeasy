<?php
/**
 * Cambia la contraseña de la cuenta autenticada y aplica el límite mensual.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/seguridad_login.php';

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../cors.php';

$tipo = $_SESSION['tipo'] ?? (!empty($_SESSION['artesano_id']) ? 'artesano' : '');
if ($tipo === 'admin') {
    $id = $_SESSION['id_persona'] ?? '';
} elseif ($tipo === 'empresa') {
    $id = $_SESSION['id_empresa'] ?? '';
} elseif ($tipo === 'artesano') {
    $id = $_SESSION['artesano_id'] ?? '';
} else {
    $id = '';
}
$tipoEsperado = $tipoCuentaEsperado ?? null;
$email = $_SESSION['email'] ?? '';

if (
    !in_array($tipo, ['admin', 'empresa', 'artesano'], true)
    || ($tipoEsperado !== null && $tipo !== $tipoEsperado)
    || !is_string($id)
    || $id === ''
    || !is_string($email)
    || $email === ''
) {
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

if (!is_array($input)
    || !isset($input['contrasena_actual'], $input['contrasena_nueva'])
    || !is_string($input['contrasena_actual'])
    || !is_string($input['contrasena_nueva'])) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Completa la contraseña actual y la nueva."]);
    exit;
}

$contrasenaActual = $input['contrasena_actual'];
$contrasenaNueva = $input['contrasena_nueva'];
if (!preg_match('/^.{8,}$/us', $contrasenaNueva) || strlen($contrasenaNueva) > 72) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "La nueva contraseña debe tener al menos 8 caracteres y no exceder 72 bytes."]);
    exit;
}

try {
    $bloqueoStmt = $pdo->prepare(
        "SELECT bloqueado, minutos_restantes FROM fn_verificar_bloqueo_seguridad('password_change', :email)"
    );
    $bloqueoStmt->execute([':email' => $email]);
    $bloqueo = $bloqueoStmt->fetch();
    if (in_array($bloqueo['bloqueado'] ?? false, [true, 't', 'true', '1', 1], true)) {
        http_response_code(429);
        echo json_encode([
            "ok" => false,
            "error" => "Demasiados intentos para cambiar la contraseña. Espera "
                . (int) ($bloqueo['minutos_restantes'] ?? 1) . " minuto(s).",
        ]);
        exit;
    }

    $hashActual = obtenerHashLoginVerificado(
        $pdo,
        $email,
        $contrasenaActual,
        $tipo,
        'password_change'
    );
    if ($hashActual === null) {
        $intentoStmt = $pdo->prepare(
            "SELECT fn_registrar_intento_seguridad('password_change', :email, :ip, FALSE)"
        );
        $intentoStmt->execute([
            ':email' => $email,
            ':ip' => obtenerIpCliente(),
        ]);
        if (!in_array($intentoStmt->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
            throw new RuntimeException('No se pudo registrar el intento de cambio de contraseña.');
        }

        $bloqueoStmt->execute([':email' => $email]);
        $bloqueo = $bloqueoStmt->fetch();
        if (in_array($bloqueo['bloqueado'] ?? false, [true, 't', 'true', '1', 1], true)) {
            http_response_code(429);
            echo json_encode([
                "ok" => false,
                "error" => "Demasiados intentos para cambiar la contraseña. Espera "
                    . (int) ($bloqueo['minutos_restantes'] ?? 1) . " minuto(s).",
            ]);
            exit;
        }

        http_response_code(401);
        echo json_encode(["ok" => false, "error" => "La contraseña actual no es correcta."]);
        exit;
    }

    $hashNuevo = password_hash($contrasenaNueva, PASSWORD_DEFAULT);
    if ($hashNuevo === false) {
        throw new RuntimeException('No se pudo generar el hash de contraseña.');
    }

    $stmt = $pdo->prepare(
        'SELECT * FROM fn_actualizar_contrasena_cuenta(:tipo, :id, :hash_actual, :hash_nuevo)'
    );
    $stmt->execute([
        ':tipo' => $tipo,
        ':id' => $id,
        ':hash_actual' => $hashActual,
        ':hash_nuevo' => $hashNuevo,
    ]);
    $result = $stmt->fetch();
    $ok = in_array(
        strtolower((string) ($result['ok'] ?? '')),
        ['1', 't', 'true', 'yes', 'on'],
        true
    );

    if (!$result || !$ok) {
        $status = ($result['codigo'] ?? '') === 'MONTHLY_LIMIT' ? 429 : 409;
        http_response_code($status);
        echo json_encode([
            "ok" => false,
            "error" => $result['mensaje'] ?? "No se pudo actualizar la contraseña.",
            "cambios_restantes" => (int) ($result['cambios_restantes'] ?? 0),
        ]);
        exit;
    }

    $intentoExitosoStmt = $pdo->prepare(
        "SELECT fn_registrar_intento_seguridad('password_change', :email, :ip, TRUE)"
    );
    $intentoExitosoStmt->execute([
        ':email' => $email,
        ':ip' => obtenerIpCliente(),
    ]);
    if (!in_array($intentoExitosoStmt->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
        throw new RuntimeException('No se pudo registrar el cambio de contraseña.');
    }

    echo json_encode([
        "ok" => true,
        "mensaje" => $result['mensaje'],
        "cambios_restantes" => (int) $result['cambios_restantes'],
    ]);
} catch (PDOException $e) {
    error_log('[TourismEasy] actualizar_contrasena_cuenta.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo actualizar la contraseña."]);
} catch (RuntimeException $e) {
    error_log('[TourismEasy] actualizar_contrasena_cuenta.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo actualizar la contraseña."]);
}
