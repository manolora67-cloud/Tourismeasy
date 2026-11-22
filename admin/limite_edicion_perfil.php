<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

function responderLimitePerfil(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

try {
    if (($_SESSION['tipo'] ?? '') !== 'admin' || empty($_SESSION['id_persona'])) {
        responderLimitePerfil(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query('SELECT * FROM fn_obtener_limite_edicion_perfil_empresa()');
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$data) {
            throw new RuntimeException('No se encontró la configuración del límite de perfil.');
        }

        $_SESSION['csrf_limite_perfil'] = $_SESSION['csrf_limite_perfil'] ?? bin2hex(random_bytes(32));
        responderLimitePerfil(200, [
            'ok' => true,
            'data' => $data,
            'csrf' => $_SESSION['csrf_limite_perfil'],
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderLimitePerfil(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }
    if (
        empty($_SESSION['csrf_limite_perfil'])
        || !hash_equals($_SESSION['csrf_limite_perfil'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')
    ) {
        responderLimitePerfil(403, ['ok' => false, 'error' => 'La sesión expiró. Recarga la configuración.']);
    }

    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($input) || !isset($input['limite_mensual']) || !is_int($input['limite_mensual'])) {
        responderLimitePerfil(400, ['ok' => false, 'error' => 'El límite debe ser un número entero.']);
    }
    if ($input['limite_mensual'] < 1 || $input['limite_mensual'] > 10) {
        responderLimitePerfil(422, ['ok' => false, 'error' => 'El límite debe estar entre 1 y 10 cambios mensuales.']);
    }

    $stmt = $pdo->prepare(
        'SELECT fn_actualizar_limite_edicion_perfil_empresa(:limite, :admin)::TEXT'
    );
    $stmt->execute([
        ':limite' => $input['limite_mensual'],
        ':admin' => $_SESSION['id_persona'],
    ]);

    $result = json_decode((string) $stmt->fetchColumn(), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($result) || !array_key_exists('ok', $result)) {
        throw new RuntimeException('La función del límite de perfil devolvió una respuesta inválida.');
    }
    responderLimitePerfil($result['ok'] ? 200 : 422, $result);
} catch (JsonException $e) {
    responderLimitePerfil(400, ['ok' => false, 'error' => 'La solicitud no contiene JSON válido.']);
} catch (Throwable $e) {
    error_log('[TourismEasy] admin/limite_edicion_perfil.php - ' . $e->getMessage());
    responderLimitePerfil(500, ['ok' => false, 'error' => 'No se pudo procesar el límite de edición de perfil.']);
}
