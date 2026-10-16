<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
require_once __DIR__ . '/../cors.php';
session_start();
require_once __DIR__ . '/../con_db/db.php';

function responderFestividades($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function esAdminFestividades()
{
    return ($_SESSION['tipo'] ?? '') === 'admin' && !empty($_SESSION['id_persona']);
}

function resultadoFuncion($valor)
{
    $resultado = json_decode($valor, true);
    if (!is_array($resultado) || !array_key_exists('ok', $resultado)) {
        throw new RuntimeException('La función de festividades devolvió una respuesta inválida.');
    }
    return $resultado;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $admin = ($_GET['admin'] ?? '') === '1';
        if ($admin && !esAdminFestividades()) {
            responderFestividades(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
        }

        $stmt = $pdo->query('SELECT * FROM fn_listar_festividades()');
        $csrf = null;
        if ($admin) {
            $_SESSION['csrf_festividades'] = $_SESSION['csrf_festividades'] ?? bin2hex(random_bytes(32));
            $csrf = $_SESSION['csrf_festividades'];
        }
        responderFestividades(200, ['ok' => true, 'data' => $stmt->fetchAll(), 'csrf' => $csrf]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderFestividades(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }
    if (!esAdminFestividades()) {
        responderFestividades(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
    }
    if (empty($_SESSION['csrf_festividades']) || !hash_equals($_SESSION['csrf_festividades'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
        responderFestividades(403, ['ok' => false, 'error' => 'La sesión expiró. Recarga el apartado e intenta de nuevo.']);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        responderFestividades(400, ['ok' => false, 'error' => 'La solicitud no contiene JSON válido.']);
    }

    $action = $input['action'] ?? '';
    if ($action === 'delete') {
        $stmt = $pdo->prepare('SELECT fn_eliminar_festividad(:id, :admin)::TEXT');
        $stmt->execute([
            ':id' => $input['id'] ?? '',
            ':admin' => $_SESSION['id_persona'],
        ]);
    } elseif (in_array($action, ['create', 'update'], true)) {
        $stmt = $pdo->prepare('SELECT fn_guardar_festividad(:action, :id_actual, CAST(:festividad AS JSONB), :admin)::TEXT');
        $stmt->execute([
            ':action' => $action,
            ':id_actual' => $input['id'] ?? null,
            ':festividad' => json_encode($input['festividad'] ?? null, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ':admin' => $_SESSION['id_persona'],
        ]);
    } else {
        responderFestividades(400, ['ok' => false, 'error' => 'Acción no reconocida.']);
    }

    $resultado = resultadoFuncion($stmt->fetchColumn());
    $status = $resultado['ok'] ? 200 : ($resultado['status'] ?? 422);
    responderFestividades($status, $resultado);
} catch (Throwable $e) {
    error_log('[TourismEasy] admin/festividades.php - ' . $e->getMessage());
    responderFestividades(500, ['ok' => false, 'error' => 'No se pudo procesar la festividad. Verifica las funciones SQL instaladas.']);
}
