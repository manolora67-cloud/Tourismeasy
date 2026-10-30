<?php
require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../cors.php';

if (($_SESSION['tipo'] ?? '') !== 'empresa' || empty($_SESSION['id_empresa'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No autorizado. Inicia sesión nuevamente.']);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
    exit;
}

$mes = $_GET['mes'] ?? '';
if (!is_string($mes) || !preg_match('/^\d{4}-(0[1-9]|1[0-2])$/D', $mes)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Selecciona un mes válido.']);
    exit;
}

$fechaMes = DateTimeImmutable::createFromFormat('!Y-m-d', $mes . '-01');
$mesActual = new DateTimeImmutable('first day of this month');
if (!$fechaMes || $fechaMes->format('Y-m') !== $mes || $fechaMes >= $mesActual) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Solo se pueden generar boletines de meses completos.']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'SELECT fn_informe_mensual_empresa(CAST(:id_empresa AS VARCHAR(10)), :mes)::TEXT'
    );
    $stmt->execute([
        ':id_empresa' => $_SESSION['id_empresa'],
        ':mes' => $fechaMes->format('Y-m-d'),
    ]);

    $jsonInforme = $stmt->fetchColumn();
    if (!is_string($jsonInforme)) {
        throw new RuntimeException('La función no devolvió un boletín válido.');
    }

    $informe = json_decode($jsonInforme, true, 512, JSON_THROW_ON_ERROR);
    if (
        !is_array($informe)
        || !is_array($informe['clics_whatsapp'] ?? null)
        || !is_array($informe['publicaciones_mas_contactadas'] ?? null)
    ) {
        throw new RuntimeException('La función devolvió un boletín con formato inválido.');
    }

    echo json_encode(['ok' => true, 'informe' => $informe], JSON_THROW_ON_ERROR);
} catch (PDOException $e) {
    error_log('[TourismEasy] get_informe_mensual_empresa.php - ' . $e->getMessage());
    http_response_code($e->getCode() === '22023' ? 400 : 500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getCode() === '22023'
            ? 'Solo se pueden generar boletines de meses completos.'
            : 'No se pudo generar el boletín mensual.',
    ]);
} catch (JsonException | RuntimeException $e) {
    error_log('[TourismEasy] get_informe_mensual_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo preparar el boletín mensual.']);
}
