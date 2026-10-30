<?php
/**
 * Devuelve el informe mensual del administrador mediante fn_informe_mensual_admin().
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../cors.php';

if (($_SESSION['tipo'] ?? '') !== 'admin' || empty($_SESSION['id_persona'])) {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado. Inicia sesión nuevamente."]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    echo json_encode(["ok" => false, "error" => "Método no permitido."]);
    exit;
}

$mes = $_GET['mes'] ?? '';
if (!is_string($mes) || !preg_match('/^\d{4}-(0[1-9]|1[0-2])$/D', $mes)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Selecciona un mes válido."]);
    exit;
}

$fechaMes = DateTimeImmutable::createFromFormat('!Y-m-d', $mes . '-01');
$mesActual = new DateTimeImmutable('first day of this month');
if (!$fechaMes || $fechaMes->format('Y-m') !== $mes || $fechaMes > $mesActual) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "No se puede generar un informe de un mes futuro."]);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT fn_informe_mensual_admin(:mes)');
    $stmt->execute([':mes' => $fechaMes->format('Y-m-d')]);
    $jsonInforme = $stmt->fetchColumn();
    if (!is_string($jsonInforme)) {
        throw new RuntimeException('La función no devolvió un informe válido.');
    }

    $informe = json_decode($jsonInforme, true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($informe)) {
        throw new RuntimeException('La función devolvió un informe con formato inválido.');
    }

    echo json_encode(["ok" => true, "informe" => $informe], JSON_THROW_ON_ERROR);
} catch (PDOException $e) {
    error_log('[TourismEasy] get_informe_mensual_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo generar el informe mensual."]);
} catch (JsonException $e) {
    error_log('[TourismEasy] get_informe_mensual_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo interpretar el informe mensual."]);
} catch (RuntimeException $e) {
    error_log('[TourismEasy] get_informe_mensual_admin.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo generar el informe mensual."]);
}
