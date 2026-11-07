<?php
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once __DIR__ . '/../cors.php';

if (($_SESSION['tipo'] ?? '') !== 'admin' || empty($_SESSION['id_persona'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($metodo, ['GET', 'POST'], true)) {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}

if ($metodo === 'GET') {
    try {
        $paleta = $pdo->query('SELECT fn_obtener_tema_global()::TEXT')->fetchColumn();
        if (!is_string($paleta)) {
            throw new RuntimeException('La función no devolvió una paleta.');
        }
        $tema = json_decode($paleta, true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($tema)) {
            throw new RuntimeException('La función devolvió una paleta inválida.');
        }

        $_SESSION['csrf_tema_global'] = $_SESSION['csrf_tema_global'] ?? bin2hex(random_bytes(32));
        echo json_encode(['ok' => true, 'tema' => $tema, 'csrf' => $_SESSION['csrf_tema_global']], JSON_THROW_ON_ERROR);
    } catch (PDOException | JsonException | RuntimeException $e) {
        error_log('[TourismEasy] tema_global_admin.php GET - ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'No se pudo cargar la paleta global.']);
    }
    exit;
}

if (empty($_SESSION['csrf_tema_global'])
    || !hash_equals($_SESSION['csrf_tema_global'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'error' => 'La sesión expiró. Recarga la configuración e intenta de nuevo.']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'El cuerpo de la solicitud no es JSON válido.']);
    exit;
}

$campos = ['primary', 'primaryLight', 'primaryDark', 'accent'];
if (!is_array($input) || !isset($input['tema']) || !is_array($input['tema'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'La paleta enviada no es válida.']);
    exit;
}

$tema = [];
foreach ($campos as $campo) {
    $color = $input['tema'][$campo] ?? null;
    if (!is_string($color) || !preg_match('/^#[0-9A-F]{6}$/i', $color)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'error' => 'Selecciona un color válido para cada campo.']);
        exit;
    }
    $tema[$campo] = strtoupper($color);
}

try {
    $stmt = $pdo->prepare('SELECT fn_actualizar_tema_global(CAST(:paleta AS JSONB), :admin)::TEXT');
    $stmt->execute([
        ':paleta' => json_encode($tema, JSON_THROW_ON_ERROR),
        ':admin' => $_SESSION['id_persona'],
    ]);
    $resultado = json_decode((string) $stmt->fetchColumn(), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($resultado) || !array_key_exists('ok', $resultado)) {
        throw new RuntimeException('La función devolvió una respuesta inválida.');
    }
    if (!$resultado['ok']) {
        http_response_code((int) ($resultado['status'] ?? 422));
        echo json_encode(['ok' => false, 'error' => $resultado['error'] ?? 'No se pudo guardar la paleta.']);
        exit;
    }

    echo json_encode(['ok' => true, 'tema' => $resultado['tema']], JSON_THROW_ON_ERROR);
} catch (PDOException | JsonException | RuntimeException $e) {
    error_log('[TourismEasy] tema_global_admin.php POST - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo guardar la paleta global.']);
}
