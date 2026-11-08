<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

function responderCatalogos(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function esAdminCatalogos(): bool
{
    return ($_SESSION['tipo'] ?? '') === 'admin' && !empty($_SESSION['id_persona']);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!esAdminCatalogos()) {
            responderCatalogos(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
        }

        $stmt = $pdo->query('SELECT fn_listar_catalogos()::TEXT');
        $json = $stmt->fetchColumn();
        if (!is_string($json)) {
            throw new RuntimeException('La función de catálogos no devolvió datos.');
        }
        $data = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        $_SESSION['csrf_catalogos'] = $_SESSION['csrf_catalogos'] ?? bin2hex(random_bytes(32));
        responderCatalogos(200, ['ok' => true, 'data' => $data, 'csrf' => $_SESSION['csrf_catalogos']]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responderCatalogos(405, ['ok' => false, 'error' => 'Método no permitido.']);
    }
    if (!esAdminCatalogos()) {
        responderCatalogos(401, ['ok' => false, 'error' => 'Se requiere una sesión de administración.']);
    }
    if (empty($_SESSION['csrf_catalogos']) || !hash_equals($_SESSION['csrf_catalogos'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
        responderCatalogos(403, ['ok' => false, 'error' => 'La sesión expiró. Recarga el apartado e intenta de nuevo.']);
    }

    $input = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($input)) {
        responderCatalogos(400, ['ok' => false, 'error' => 'La solicitud no contiene JSON válido.']);
    }

    $stmt = $pdo->prepare(
        'SELECT fn_guardar_catalogo(:tipo, :accion, :id, :codigo, :nombre, :activo, :admin)::TEXT'
    );
    $stmt->bindValue(':tipo', $input['tipo'] ?? '', PDO::PARAM_STR);
    $stmt->bindValue(':accion', $input['accion'] ?? '', PDO::PARAM_STR);
    $stmt->bindValue(':id', $input['id'] ?? null, isset($input['id']) ? PDO::PARAM_STR : PDO::PARAM_NULL);
    $stmt->bindValue(':codigo', $input['codigo'] ?? null, isset($input['codigo']) ? PDO::PARAM_STR : PDO::PARAM_NULL);
    $stmt->bindValue(':nombre', $input['nombre'] ?? null, isset($input['nombre']) ? PDO::PARAM_STR : PDO::PARAM_NULL);
    $activo = array_key_exists('activo', $input)
        ? filter_var($input['activo'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
        : null;
    $stmt->bindValue(':activo', $activo, $activo === null ? PDO::PARAM_NULL : PDO::PARAM_BOOL);
    $stmt->bindValue(':admin', $_SESSION['id_persona'], PDO::PARAM_STR);
    $stmt->execute();

    $result = json_decode((string)$stmt->fetchColumn(), true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($result) || !array_key_exists('ok', $result)) {
        throw new RuntimeException('La función de catálogos devolvió una respuesta inválida.');
    }
    responderCatalogos($result['ok'] ? 200 : (int)($result['status'] ?? 422), $result);
} catch (JsonException $e) {
    responderCatalogos(400, ['ok' => false, 'error' => 'La solicitud no contiene JSON válido.']);
} catch (Throwable $e) {
    error_log('[TourismEasy] admin/catalogos.php - ' . $e->getMessage());
    responderCatalogos(500, ['ok' => false, 'error' => 'No se pudieron procesar los catálogos. Verifica las funciones SQL instaladas.']);
}
