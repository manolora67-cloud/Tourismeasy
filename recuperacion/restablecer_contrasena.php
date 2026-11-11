<?php
/**
 * restablecer_contrasena.php
 * Valida el token y actualiza la contraseña, vía fn_restablecer_contrasena().
 */

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/seguridad_login.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$input    = json_decode(file_get_contents('php://input'), true);
$token    = trim($input['token']    ?? '');
$password = trim($input['password'] ?? '');

if (!$token || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Token y contraseña son requeridos.']);
    exit;
}

if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 8 caracteres.']);
    exit;
}

$passHash = password_hash($password, PASSWORD_DEFAULT);
if ($passHash === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'No se pudo proteger la contraseña.']);
    exit;
}

try {
    $ipRemota = $_SERVER['REMOTE_ADDR'] ?? '';
    $ip = filter_var($ipRemota, FILTER_VALIDATE_IP) ? $ipRemota : '0.0.0.0';
    $limiteStmt = $pdo->prepare(
        "SELECT bloqueado, minutos_restantes FROM fn_verificar_bloqueo_seguridad('recovery_link', :ip)"
    );
    $limiteStmt->execute([':ip' => $ip]);
    $limite = $limiteStmt->fetch();
    if (in_array($limite['bloqueado'] ?? false, [true, 't', 'true', '1', 1], true)) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => 'Se recibieron demasiadas validaciones. Intenta de nuevo en '
                . (int)($limite['minutos_restantes'] ?? 1) . ' minuto(s).',
        ]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM fn_restablecer_contrasena(:token, :hash)");
    $stmt->execute([':token' => $token, ':hash' => $passHash]);
    $row = $stmt->fetch();

    $registroStmt = $pdo->prepare(
        "SELECT fn_registrar_intento_seguridad('recovery_link', :ip, :ip, :exitoso)"
    );
    $registroStmt->execute([
        ':ip' => $ip,
        ':exitoso' => in_array($row['ok'] ?? false, [true, 't', 'true', '1', 1], true),
    ]);
    if (!in_array($registroStmt->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
        throw new RuntimeException('No se pudo registrar la validación del enlace.');
    }

    if (!$row['ok']) {
        $bloqueoStmt = $pdo->prepare(
            "SELECT bloqueado, minutos_restantes FROM fn_verificar_bloqueo_seguridad('recovery_link', :ip)"
        );
        $bloqueoStmt->execute([':ip' => $ip]);
        $bloqueo = $bloqueoStmt->fetch(PDO::FETCH_ASSOC);
        if (in_array($bloqueo['bloqueado'] ?? false, [true, 't', 'true', '1', 1], true)) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'message' => 'Se alcanzó el límite de validaciones. Intenta de nuevo en '
                    . (int) ($bloqueo['minutos_restantes'] ?? 1) . ' minuto(s).',
            ]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $row['mensaje']]);
        exit;
    }

    echo json_encode(['success' => true, 'message' => $row['mensaje']]);

} catch (Exception $e) {
    error_log('[TourismEasy] restablecer_contrasena - Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor.']);
}