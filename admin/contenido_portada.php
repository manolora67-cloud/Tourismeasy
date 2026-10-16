<?php
session_start();
require_once __DIR__ . '/../con_db/db.php';
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../cors.php';

function responderPortada($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function esAdminPortada()
{
    return ($_SESSION['tipo'] ?? '') === 'admin' && !empty($_SESSION['id_persona']);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $admin = ($_GET['admin'] ?? '') === '1';
        if ($admin && !esAdminPortada()) {
            responderPortada(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
        }

        $stmt = $pdo->prepare('SELECT * FROM fn_listar_contenido_portada(:solo_publicados)');
        $stmt->execute([':solo_publicados' => $admin ? 'false' : 'true']);
        $initialized = filter_var($pdo->query('SELECT fn_estado_inicial_portada(FALSE)::TEXT')->fetchColumn(), FILTER_VALIDATE_BOOLEAN);
        $csrf = null;
        if ($admin) {
            $_SESSION['csrf_portada'] = $_SESSION['csrf_portada'] ?? bin2hex(random_bytes(32));
            $csrf = $_SESSION['csrf_portada'];
        }

        responderPortada(200, [
            'ok' => true,
            'data' => $stmt->fetchAll(),
            'initialized' => $initialized,
            'csrf' => $csrf,
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderPortada(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }
    if (!esAdminPortada()) {
        responderPortada(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
    }
    if (empty($_SESSION['csrf_portada']) || !hash_equals($_SESSION['csrf_portada'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
        responderPortada(403, ['ok' => false, 'error' => 'La sesión de edición expiró. Recarga el panel e intenta de nuevo.']);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        responderPortada(400, ['ok' => false, 'error' => 'La solicitud no contiene JSON válido.']);
    }

    if (($input['action'] ?? '') === 'bootstrap') {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('SELECT fn_inicializar_contenido_portada(CAST(:destinos AS JSONB), CAST(:articulos AS JSONB), :admin)::TEXT');
        $stmt->execute([
            ':destinos' => json_encode($input['destinos'] ?? [], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ':articulos' => json_encode($input['articulos'] ?? [], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ':admin' => $_SESSION['id_persona'],
        ]);
        if (!filter_var($stmt->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
            $pdo->rollBack();
            responderPortada(422, ['ok' => false, 'error' => 'No se pudo cargar el contenido inicial; revisa los datos y las funciones SQL instaladas.']);
        }
        $pdo->commit();
        $destinos = $pdo->query('SELECT * FROM fn_listar_contenido_portada(FALSE)')->fetchAll();
        responderPortada(200, ['ok' => true, 'data' => $destinos]);
    }

    if (($input['action'] ?? '') === 'save') {
        $destino = $input['destino'] ?? null;
        if (!is_array($destino)) {
            responderPortada(422, ['ok' => false, 'error' => 'El destino enviado no es válido.']);
        }
        $stmt = $pdo->prepare('SELECT fn_guardar_contenido_portada(CAST(:destino AS JSONB), :admin, TRUE)::TEXT');
        $stmt->execute([
            ':destino' => json_encode($destino, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ':admin' => $_SESSION['id_persona'],
        ]);
        if (!filter_var($stmt->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
            responderPortada(422, ['ok' => false, 'error' => 'No se pudo guardar el destino; revisa los campos y las rutas de imagen/video.']);
        }
        responderPortada(200, ['ok' => true, 'data' => $destino]);
    }

    if (($input['action'] ?? '') === 'delete') {
        $stmt = $pdo->prepare('SELECT fn_eliminar_contenido_portada(:clave, :admin)::TEXT');
        $stmt->execute([
            ':clave' => strtolower(trim((string)($input['key'] ?? ''))),
            ':admin' => $_SESSION['id_persona'],
        ]);
        if (!filter_var($stmt->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
            responderPortada(404, ['ok' => false, 'error' => 'No se encontró ese destino o la clave no es válida.']);
        }
        responderPortada(200, ['ok' => true]);
    }

    responderPortada(400, ['ok' => false, 'error' => 'Acción no reconocida.']);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('[TourismEasy] admin/contenido_portada.php - ' . $e->getMessage());
    responderPortada(500, ['ok' => false, 'error' => 'No se pudo procesar el contenido. Verifica el esquema y las funciones SQL instaladas.']);
}
