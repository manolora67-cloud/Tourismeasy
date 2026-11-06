<?php
/**
 * login.php
 * Valida la petición, delega la autenticación a fn_procesar_login()
 * y establece la sesión HTTP.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/seguridad_captcha.php';
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/seguridad_login.php';
require_once __DIR__ . '/../con_db/aprobacion_dispositivo.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$tipo = trim($input['tipo'] ?? '');
$solicitudAprobacion = trim((string)($input['solicitud_aprobacion'] ?? ''));
$codigoAprobacion = trim((string)($input['codigo_aprobacion'] ?? ''));
$captchaToken = $input['captcha_token'] ?? '';

if (!$email || !$password || !in_array($tipo, ['admin', 'empresa'], true)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Datos incompletos."]);
    exit;
}

if (($solicitudAprobacion === '') !== ($codigoAprobacion === '')) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "La confirmación del nuevo dispositivo está incompleta."]);
    exit;
}

$usaAprobacion = $solicitudAprobacion !== '';
if (!$usaAprobacion && !teCaptchaLoginTokenValido($captchaToken)) {
    http_response_code(403);
    echo json_encode(["ok" => false, "error" => "Completa nuevamente la verificación de seguridad."]);
    exit;
}

$etapaDiagnostico = 'verificando_credenciales';
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

    $validacionAprobacion = null;
    if ($usaAprobacion && $hashLogin !== null) {
        $etapaDiagnostico = 'validando_codigo_aprobacion';
        if (!preg_match('/^[0-9]{6}$/D', $codigoAprobacion)) {
            http_response_code(401);
            echo json_encode(["ok" => false, "error" => "El código no es válido."]);
            exit;
        }

        $validacionAprobacion = validarCodigoAprobacionDispositivo(
            $pdo,
            $solicitudAprobacion,
            $codigoAprobacion,
            $tipo,
            $email,
            $hashDispositivo
        );
        if (!$validacionAprobacion['ok']) {
            http_response_code(401);
            echo json_encode([
                "ok" => false,
                "error" => $validacionAprobacion['error'] === 'codigo_invalido'
                    ? "El código no es válido. Revisa el correo e intenta de nuevo."
                    : "La aprobación venció o ya no es válida. Inicia sesión para solicitar otra.",
            ]);
            exit;
        }
    }

    $etapaDiagnostico = 'procesando_login_en_base_de_datos';
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
        ':reemplazar' => $usaAprobacion ? 'true' : 'false',
    ]);
    $row = $stmt->fetch();

    if (!$row) {
        if ($usaAprobacion && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        teConsumirCaptchaLoginToken();
        $referenciaDiagnostico = bin2hex(random_bytes(6));
        error_log('[TourismEasy] login.php - referencia ' . $referenciaDiagnostico . ': la función de login no devolvió resultados.');
        http_response_code(500);
        echo json_encode([
            "ok" => false,
            "error" => "Error interno del servidor.",
            "diagnostico" => [
                "referencia" => $referenciaDiagnostico,
                "etapa" => 'procesando_login_sin_resultado',
            ],
        ]);
        exit;
    }

    if (!$usaAprobacion && $row['codigo'] === 'SESION_ACTIVA') {
        teConsumirCaptchaLoginToken();
        guardarCookieDispositivo((string)$tokenDispositivo);
        $etapaDiagnostico = 'creando_solicitud_y_enviando_correo';
        try {
            $tokenSolicitud = crearSolicitudAprobacionDispositivo(
                $pdo,
                (string)$row['rol'],
                (string)$row['id'],
                (string)$row['email_login'],
                (string)$hashDispositivo,
                obtenerIpCliente(),
                (string)($_SERVER['HTTP_USER_AGENT'] ?? 'No identificado')
            );
        } catch (ErrorAprobacionDispositivo $e) {
            $etapaDiagnostico = 'solicitud_' . $e->obtenerEtapa();
            throw $e;
        } catch (OverflowException $e) {
            http_response_code(429);
            echo json_encode(["ok" => false, "error" => $e->getMessage()]);
            exit;
        }
        http_response_code(409);
        echo json_encode([
            "ok" => false,
            "code" => "APROBACION_REQUERIDA",
            "solicitud" => $tokenSolicitud,
            "error" => "Te enviamos un correo para confirmar si reconoces este intento. La sesión actual seguirá abierta.",
        ]);
        exit;
    }

    if ($usaAprobacion && $row['codigo'] !== 'OK') {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(401);
        echo json_encode(["ok" => false, "error" => "No se pudo completar el acceso aprobado. Solicita otra confirmación."]);
        exit;
    }

    if ($usaAprobacion && (string)$row['id'] !== $validacionAprobacion['id_cuenta']) {
        $pdo->rollBack();
        http_response_code(401);
        echo json_encode(["ok" => false, "error" => "La aprobación no corresponde a esta cuenta."]);
        exit;
    }

    if ($usaAprobacion) {
        $etapaDiagnostico = 'consumiendo_solicitud_aprobada';
        consumirSolicitudAprobacionDispositivo($pdo, $validacionAprobacion['id_solicitud']);
        $pdo->commit();
    } elseif ($row['codigo'] !== 'SESION_ACTIVA') {
        teConsumirCaptchaLoginToken();
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

    if ($row['codigo'] === 'SESION_INVALIDA') {
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    if (!filter_var($row['ok'], FILTER_VALIDATE_BOOLEAN)) {
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    $etapaDiagnostico = 'creando_sesion_del_navegador';
    guardarCookieDispositivo($tokenDispositivo);
    $_SESSION['tipo'] = $row['rol'];
    $_SESSION['email'] = $row['email_login'];
    $_SESSION['te_ultima_actividad'] = time();

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

    renovarCookieSesionPersistente();
    if (!session_write_close()) {
        throw new RuntimeException('No se pudo guardar la sesión de acceso.');
    }
    echo json_encode(["ok" => true, "session" => $datos_sesion]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    teConsumirCaptchaLoginToken();
    $referenciaDiagnostico = bin2hex(random_bytes(6));
    error_log(
        '[TourismEasy] login.php - referencia ' . $referenciaDiagnostico
        . ' - etapa ' . $etapaDiagnostico . ' - ' . $e->getMessage()
    );
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "error" => "Error interno del servidor.",
        "diagnostico" => [
            "referencia" => $referenciaDiagnostico,
            "etapa" => $etapaDiagnostico,
            "causa" => $e instanceof ErrorAprobacionDispositivo
                ? $e->obtenerCausa()
                : "error_interno",
        ],
    ]);
}