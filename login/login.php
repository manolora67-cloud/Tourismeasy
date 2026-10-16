<?php
/**
 * login.php
 * Verifica credenciales llamando a fn_login_empresa() / fn_login_admin()
 * y devuelve los datos de sesión.
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../con_db/seguridad_login.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input    = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email']    ?? '');
$password = trim($input['password'] ?? '');
$tipo     = trim($input['tipo']     ?? '');

if (!$email || !$password || !in_array($tipo, ['admin', 'empresa'], true)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Datos incompletos."]);
    exit;
}

// ── Bloqueo por intentos fallidos ──
// Se revisa ANTES de tocar la contraseña, para no gastar ni una verificación
// contra la base de datos si el correo ya está bloqueado.
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
    if ($tipo === 'empresa') {
        $stmt = $pdo->prepare("SELECT * FROM fn_login_empresa(:email, :hash)");
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
                    ->execute([':detalle' => 'Empresa: intento con correo ' . $email]);
            } catch (PDOException $eAudit) {
                error_log('[TourismEasy] login.php - auditoría - ' . $eAudit->getMessage());
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
        session_regenerate_id(true);
        $_SESSION['tipo']          = 'empresa';
        $_SESSION['id_empresa']    = $row['id_empresa'];
        $_SESSION['email']         = $row['email_login'];
        $_SESSION['nombre']        = $row['nom_empresa'];
        $_SESSION['tipo_servicio'] = $row['tipo_servicio'];

        $avatar = strtoupper(substr(preg_replace('/[^A-Za-z ]/', '', $row['nom_empresa']), 0, 2));
        echo json_encode([
            "ok"      => true,
            "session" => [
                "tipo"         => "empresa",
                "id"           => $row['id_empresa'],
                "email"        => $row['email_login'],
                "nombre"       => $row['nom_empresa'],
                "tipoServicio" => $row['tipo_servicio'],
                "avatar"       => $avatar,
            ]
        ]);

    } else {
        $stmt = $pdo->prepare("SELECT * FROM fn_login_admin(:email, :hash)");
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
                    ->execute([':detalle' => 'Administrador: intento con correo ' . $email]);
            } catch (PDOException $eAudit) {
                error_log('[TourismEasy] login.php - auditoría - ' . $eAudit->getMessage());
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
        session_regenerate_id(true);
        $_SESSION['tipo']       = $row['rol'];
        $_SESSION['id_persona'] = $row['id_persona'];
        $_SESSION['email']      = $row['email_login'];
        $_SESSION['nombre']     = $row['nom_persona'] . ' ' . $row['ape_persona'];

        $nombre = $row['nom_persona'] . ' ' . $row['ape_persona'];
        $avatar = strtoupper(substr($row['nom_persona'], 0, 1) . substr($row['ape_persona'], 0, 1));

        echo json_encode([
            "ok"      => true,
            "session" => [
                "tipo"   => $row['rol'],
                "id"     => $row['id_persona'],
                "email"  => $row['email_login'],
                "nombre" => $nombre,
                "avatar" => $avatar,
            ]
        ]);
    }

} catch (PDOException $e) {
    error_log('[TourismEasy] login.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error interno del servidor."]);
}