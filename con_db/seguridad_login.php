<?php
/**
 * con_db/seguridad_login.php
 *
 * Obtiene la IP del cliente desde las cabeceras del servidor. La persistencia
 * del intento y el cálculo del bloqueo viven en fn_registrar_intento_login()
 * y fn_verificar_bloqueo_login().
 */

/**
 * Obtiene la IP real del cliente, considerando proxys/balanceadores comunes.
 */
function obtenerIpCliente(): string
{
    foreach (['HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = trim(explode(',', $_SERVER[$key])[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}

/**
 * Verifica la contraseña y devuelve el hash almacenado para el coordinador SQL.
 * Los hashes SHA-256 existentes se actualizan al formato vigente al iniciar sesión.
 */
function obtenerHashLoginVerificado($pdo, string $email, string $password, string $tipo): ?string
{
    $bloqueoStmt = $pdo->prepare('SELECT bloqueado FROM fn_verificar_bloqueo_login(:email, 3, 5)');
    $bloqueoStmt->execute([':email' => $email]);
    $bloqueo = $bloqueoStmt->fetch();
    if (in_array($bloqueo['bloqueado'] ?? false, [true, 't', 'true', '1', 1], true)) {
        return null;
    }

    $buscar = $pdo->prepare('SELECT * FROM fn_obtener_credencial_login(:email, :tipo)');
    $buscar->execute([':email' => $email, ':tipo' => $tipo]);
    $credencial = $buscar->fetch();
    if (!$credencial || !is_string($credencial['hash_contrasena'] ?? null)) {
        return null;
    }

    $hashActual = $credencial['hash_contrasena'];
    $esHashLegacy = preg_match('/^[a-f0-9]{64}$/D', $hashActual) === 1;
    $contrasenaValida = $esHashLegacy
        ? hash_equals($hashActual, hash('sha256', $password))
        : password_verify($password, $hashActual);

    if (!$contrasenaValida) {
        return null;
    }

    if (!$esHashLegacy && !password_needs_rehash($hashActual, PASSWORD_DEFAULT)) {
        return $hashActual;
    }

    $hashNuevo = password_hash($password, PASSWORD_DEFAULT);
    if ($hashNuevo === false) {
        throw new RuntimeException('No se pudo generar el hash de contraseña.');
    }

    $actualizar = $pdo->prepare(
        'SELECT fn_rehash_contrasena_login(:tipo, :id, :anterior, :nuevo)'
    );
    $actualizar->execute([
        ':tipo' => $tipo,
        ':id' => $credencial['id_cuenta'],
        ':anterior' => $hashActual,
        ':nuevo' => $hashNuevo,
    ]);
    if (in_array($actualizar->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
        return $hashNuevo;
    }

    $buscar->execute([':email' => $email, ':tipo' => $tipo]);
    $hashConcurrente = $buscar->fetchColumn(1);
    if (is_string($hashConcurrente)) {
        $sigueValida = preg_match('/^[a-f0-9]{64}$/D', $hashConcurrente) === 1
            ? hash_equals($hashConcurrente, hash('sha256', $password))
            : password_verify($password, $hashConcurrente);
        if ($sigueValida) {
            return $hashConcurrente;
        }
    }

    return null;
}

function obtenerTokenDispositivo(): string
{
    $token = $_COOKIE['te_device'] ?? '';
    if (is_string($token) && preg_match('/^[a-f0-9]{64}$/D', $token)) {
        return $token;
    }

    return bin2hex(random_bytes(32));
}

function guardarCookieDispositivo(string $token): void
{
    $seguro = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
        || (string)($_SERVER['SERVER_PORT'] ?? '') === '443';

    setcookie('te_device', $token, [
        'expires' => time() + (400 * 24 * 60 * 60),
        'path' => '/',
        'secure' => $seguro,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    $_COOKIE['te_device'] = $token;
}

function borrarCookieDispositivo(): void
{
    $seguro = (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off')
        || (string)($_SERVER['SERVER_PORT'] ?? '') === '443';

    setcookie('te_device', '', [
        'expires' => time() - 42000,
        'path' => '/',
        'secure' => $seguro,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    unset($_COOKIE['te_device']);
}

function validarSesionActivaEnBD($pdo): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return;
    }

    $tipo = $_SESSION['tipo'] ?? null;
    if ($tipo === 'admin' && !empty($_SESSION['id_persona'])) {
        $id = $_SESSION['id_persona'];
    } elseif ($tipo === 'empresa' && !empty($_SESSION['id_empresa'])) {
        $id = $_SESSION['id_empresa'];
    } elseif (!empty($_SESSION['artesano_id'])) {
        $tipo = 'artesano';
        $id = $_SESSION['artesano_id'];
    } else {
        return;
    }

    $stmt = $pdo->prepare(
        'SELECT EXISTS (SELECT 1 FROM SESIONES_ACTIVAS WHERE TIPO_CUENTA = :tipo AND ID_CUENTA = :id AND ID_SESION_HASH = :sesion)'
    );
    $stmt->execute([
        ':tipo' => $tipo,
        ':id' => $id,
        ':sesion' => hash('sha256', session_id()),
    ]);

    if (!in_array($stmt->fetchColumn(), [true, 't', 'true', '1', 1], true)) {
        destruirSesionActual(false);
    }
}

function cerrarSesionActiva($pdo): bool
{
    $tipo = $_SESSION['tipo'] ?? null;
    if ($tipo === 'admin') {
        $id = $_SESSION['id_persona'] ?? null;
    } elseif ($tipo === 'empresa') {
        $id = $_SESSION['id_empresa'] ?? null;
    } elseif (!empty($_SESSION['artesano_id'])) {
        $tipo = 'artesano';
        $id = $_SESSION['artesano_id'];
    } else {
        $id = null;
    }
    if (!is_string($tipo) || !is_string($id)) {
        return false;
    }

    $token = $_COOKIE['te_device'] ?? null;
    $hashDispositivo = is_string($token) && preg_match('/^[a-f0-9]{64}$/D', $token)
        ? hash('sha256', $token)
        : null;
    $hashSesion = session_id() !== '' ? hash('sha256', session_id()) : null;

    $stmt = $pdo->prepare(
        'SELECT fn_cerrar_sesion_activa(:tipo, :id, :dispositivo, :sesion)'
    );
    $stmt->execute([
        ':tipo' => $tipo,
        ':id' => $id,
        ':dispositivo' => $hashDispositivo,
        ':sesion' => $hashSesion,
    ]);

    return in_array($stmt->fetchColumn(), [true, 't', 'true', '1', 1], true);
}

function destruirSesionActual(bool $eliminarCookies = true): void
{
    $_SESSION = [];
    if ($eliminarCookies && ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => 'Lax',
        ]);
    }
    if ($eliminarCookies) {
        borrarCookieDispositivo();
    }
    session_destroy();
}