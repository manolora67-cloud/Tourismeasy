<?php
/**
 * e-commerce/login_artesano.php
 * Valida credenciales del artesano llamando a fn_login_artesano()
 * y devuelve sesión.
 */

session_start();

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/seguridad_login.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input    = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email']    ?? '');
$password = trim($input['password'] ?? '');

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Correo y contraseña requeridos."]);
    exit;
}

// ── Bloqueo por intentos fallidos ──
$stmtBloqueo = $pdo->prepare('SELECT * FROM fn_verificar_bloqueo_login(:email, 3, 5)');
$stmtBloqueo->execute([':email' => $email]);
$bloqueo = $stmtBloqueo->fetch() ?: [];
if (in_array($bloqueo['bloqueado'] ?? false, [true, 't', 'true', '1', 1], true)) {
    http_response_code(429);
    echo json_encode([
        "ok"    => false,
        "error" => "Demasiados intentos fallidos. Intenta de nuevo en " .
                    (int)($bloqueo['minutos_restantes'] ?? 0) . " minuto(s).",
    ]);
    exit;
}

$hash = hash('sha256', $password);

try {
    $stmt = $pdo->prepare("SELECT * FROM fn_login_artesano(:email, :hash)");
    $stmt->execute([':email' => $email, ':hash' => $hash]);
    $row = $stmt->fetch();

    if (!$row['ok']) {
        $stmtIntento = $pdo->prepare('SELECT fn_registrar_intento_login(:email, :ip, FALSE)::TEXT');
        $stmtIntento->execute([':email' => $email, ':ip' => obtenerIpCliente()]);
        if (!filter_var($stmtIntento->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
            http_response_code(500);
            echo json_encode(["ok" => false, "error" => "No se pudo registrar el intento de acceso."]);
            exit;
        }
        try {
            $pdo->prepare("SELECT fn_registrar_auditoria(NULL, 'Login fallido', 'Sesiones', :detalle, 'advertencia')")
                ->execute([':detalle' => 'Artesano: intento con correo ' . $email]);
        } catch (PDOException $eAudit) {
            error_log('[TourismEasy] login_artesano.php - auditoría - ' . $eAudit->getMessage());
        }
        echo json_encode(["ok" => false, "error" => $row['mensaje']]);
        exit;
    }

    $stmtIntento = $pdo->prepare('SELECT fn_registrar_intento_login(:email, :ip, TRUE)::TEXT');
    $stmtIntento->execute([':email' => $email, ':ip' => obtenerIpCliente()]);
    if (!filter_var($stmtIntento->fetchColumn(), FILTER_VALIDATE_BOOLEAN)) {
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => "No se pudo registrar el inicio de sesión."]);
        exit;
    }
    $nombre = $row['nombre'] . ' ' . $row['apellido'];
    $avatar = strtoupper(substr($row['nombre'], 0, 1) . substr($row['apellido'], 0, 1));

    // Regeneramos el ID de sesión al loguear (buena práctica de seguridad,
    // evita session fixation) y guardamos los datos que admin.php necesita
    // para saber que hay una sesión válida de artesano.
    session_regenerate_id(true);
    $_SESSION['artesano_id']     = $row['id_persona'];
    $_SESSION['artesano_nombre'] = $nombre;

    echo json_encode([
        "ok" => true,
        "session" => [
            "tipo"   => "artesano",
            "id"     => $row['id_persona'],
            "email"  => $row['email_login'],
            "nombre" => $nombre,
            "avatar" => $avatar,
            "estado" => $row['estado'],
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] login_artesano.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error interno del servidor."]);
}