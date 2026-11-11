<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

function responderSeguridad(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function esAdminSeguridad(): bool
{
    return ($_SESSION['tipo'] ?? '') === 'admin' && !empty($_SESSION['id_persona']);
}

try {
    if (!esAdminSeguridad()) {
        responderSeguridad(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query('SELECT fn_listar_configuracion_seguridad()::TEXT');
        $json = $stmt->fetchColumn();
        if (!is_string($json)) {
            throw new RuntimeException('La función de configuración de seguridad no devolvió datos.');
        }

        $data = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        $_SESSION['csrf_seguridad'] = $_SESSION['csrf_seguridad'] ?? bin2hex(random_bytes(32));
        responderSeguridad(200, [
            'ok' => true,
            'data' => $data,
            'csrf' => $_SESSION['csrf_seguridad'],
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderSeguridad(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }
    if (
        empty($_SESSION['csrf_seguridad'])
        || !hash_equals($_SESSION['csrf_seguridad'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')
    ) {
        responderSeguridad(403, ['ok' => false, 'error' => 'La sesión expiró. Recarga la configuración.']);
    }

    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($input)) {
        responderSeguridad(400, ['ok' => false, 'error' => 'La solicitud no contiene JSON válido.']);
    }

    $control = $input['control'] ?? null;
    $controlesValidos = [
        'login',
        'password_change',
        'recovery_request',
        'recovery_link',
        'device_request',
        'device_code',
    ];
    if (!is_string($control) || !in_array($control, $controlesValidos, true)) {
        responderSeguridad(400, ['ok' => false, 'error' => 'El control de seguridad no es válido.']);
    }

    foreach (['max_intentos', 'ventana_minutos', 'duracion_bloqueo_minutos'] as $campo) {
        if (!isset($input[$campo]) || !is_int($input[$campo])) {
            responderSeguridad(400, ['ok' => false, 'error' => 'Completa los límites con números enteros.']);
        }
    }
    $limiteMensual = $input['limite_mensual'] ?? null;
    if ($control === 'device_code' && $input['max_intentos'] > 5) {
        responderSeguridad(422, ['ok' => false, 'error' => 'Los códigos de dispositivo permiten entre 1 y 5 intentos.']);
    }
    if (
        ($control === 'password_change' && (!is_int($limiteMensual) || $limiteMensual < 1 || $limiteMensual > 10))
        || ($control !== 'password_change' && $limiteMensual !== null)
    ) {
        responderSeguridad(400, ['ok' => false, 'error' => 'El límite mensual solo aplica al cambio de contraseña.']);
    }

    $stmt = $pdo->prepare(
        'SELECT fn_actualizar_configuracion_seguridad(:control, :max, :ventana, :bloqueo, :mensual, :admin)::TEXT'
    );
    $stmt->execute([
        ':control' => $control,
        ':max' => $input['max_intentos'],
        ':ventana' => $input['ventana_minutos'],
        ':bloqueo' => $input['duracion_bloqueo_minutos'],
        ':mensual' => $limiteMensual,
        ':admin' => $_SESSION['id_persona'],
    ]);

    $result = json_decode((string)$stmt->fetchColumn(), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($result) || !array_key_exists('ok', $result)) {
        throw new RuntimeException('La función de seguridad devolvió una respuesta inválida.');
    }
    responderSeguridad($result['ok'] ? 200 : 422, $result);
} catch (JsonException $e) {
    responderSeguridad(400, ['ok' => false, 'error' => 'La solicitud no contiene JSON válido.']);
} catch (Throwable $e) {
    error_log('[TourismEasy] admin/seguridad.php - ' . $e->getMessage());
    responderSeguridad(500, ['ok' => false, 'error' => 'No se pudo procesar la configuración de seguridad.']);
}
