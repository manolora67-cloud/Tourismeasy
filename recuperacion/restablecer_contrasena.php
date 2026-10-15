<?php
/**
 * restablecer_contrasena.php
 * Valida el token y actualiza la contraseña, vía fn_restablecer_contrasena().
 */

require_once __DIR__ . '/../con_db/db.php';

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

$passHash = hash('sha256', $password);

try {
    $stmt = $pdo->prepare("SELECT * FROM fn_restablecer_contrasena(:token, :hash)");
    $stmt->execute([':token' => $token, ':hash' => $passHash]);
    $row = $stmt->fetch();

    if (!$row['ok']) {
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