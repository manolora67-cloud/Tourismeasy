<?php
/**
 * solicitar_recuperacion.php
 * Recibe el email, genera un token seguro, lo guarda vía fn_solicitar_recuperacion()
 * y envía el enlace al correo del usuario.
 */

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/servicio_correo.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$origenEcommerce = ($input['origen'] ?? '') === 'ecommerce';

if (!$email || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Correo electrónico inválido.']);
    exit;
}

// El token se genera en PHP (random_bytes es la fuente de aleatoriedad criptográfica
// más simple y ya la usa el resto del sistema); la función de BD solo lo guarda.
$token         = bin2hex(random_bytes(32));
$fechaCreacion = date('Y-m-d H:i:s');
$fechaExpira   = date('Y-m-d H:i:s', strtotime('+1 hour'));

try {
    $limiteStmt = $pdo->prepare(
        "SELECT bloqueado, minutos_restantes FROM fn_verificar_bloqueo_seguridad('recovery_request', :email)"
    );
    $limiteStmt->execute([':email' => $email]);
    $limite = $limiteStmt->fetch();
    if (in_array($limite['bloqueado'] ?? false, [true, 't', 'true', '1', 1], true)) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'message' => 'Se recibieron demasiadas solicitudes. Intenta de nuevo en '
                . (int)($limite['minutos_restantes'] ?? 1) . ' minuto(s).',
        ]);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM fn_solicitar_recuperacion(:email, :token, :creacion, :expira)");
    $stmt->execute([
        ':email'    => $email,
        ':token'    => $token,
        ':creacion' => $fechaCreacion,
        ':expira'   => $fechaExpira,
    ]);
    $row = $stmt->fetch();

    $registroStmt = $pdo->prepare(
        "SELECT fn_registrar_intento_seguridad('recovery_request', :email, :ip, :exitoso)"
    );
    $registroStmt->execute([
        ':email' => $email,
        ':ip' => $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0',
        ':exitoso' => in_array($row['ok'] ?? false, [true, 't', 'true', '1', 1], true),
    ]);
    if (!in_array($registroStmt->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
        throw new RuntimeException('No se pudo registrar la solicitud de recuperación.');
    }

    // Respuesta genérica siempre — no revelamos si el correo existe o no
    if ($row['ok'] && $row['existe']) {
        $enlace = "https://web.adsoserver.site/Tourismeasy/html/recupera_correo.html?token={$token}"
            . ($origenEcommerce ? '&origen=ecommerce' : '');
        $nombre = obtenerNombreRecuperacion($pdo, $email);
        enviarCorreoRecuperacion($email, $nombre, $enlace);
    }

    echo json_encode(['success' => true, 'message' => 'Si el correo está registrado, recibirás un enlace en tu bandeja de entrada.']);

} catch (Exception $e) {
    error_log('[TourismEasy] solicitar_recuperacion - Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor.']);
}