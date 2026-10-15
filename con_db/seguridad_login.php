<?php
/**
 * con_db/seguridad_login.php
 *
 * Bloqueo temporal de login tras varios intentos fallidos, usando la tabla
 * ya existente INTENTOS_LOGIN (EMAIL, IP_ORIGEN, EXITOSO, FECHA_INTENTO).
 *
 * Uso típico dentro de login.php / login_artesano.php:
 *
 *   require_once __DIR__ . '/../con_db/seguridad_login.php';
 *
 *   $bloqueo = verificarBloqueoLogin($pdo, $email);
 *   if ($bloqueo['bloqueado']) {
 *       http_response_code(429);
 *       echo json_encode([
 *           "ok" => false,
 *           "error" => "Demasiados intentos fallidos. Intenta de nuevo en " .
 *                       $bloqueo['minutos_restantes'] . " minuto(s).",
 *       ]);
 *       exit;
 *   }
 *
 *   ... validar credenciales normalmente (fn_login_...) ...
 *
 *   registrarIntentoLogin($pdo, $email, $row['ok']); // true o false según el resultado
 */

const LOGIN_MAX_INTENTOS = 3;      // intentos fallidos permitidos
const LOGIN_MINUTOS_BLOQUEO = 5;   // minutos de bloqueo tras superar el máximo

/**
 * Registra un intento de login (exitoso o fallido) en INTENTOS_LOGIN.
 * Se debe llamar SIEMPRE, tanto si el login fue correcto como si falló,
 * para que la ventana de bloqueo funcione bien.
 */
function registrarIntentoLogin(PDO $pdo, string $email, bool $exitoso): void
{
    $ip = obtenerIpCliente();
    try {
        $stmt = $pdo->prepare(
            "INSERT INTO INTENTOS_LOGIN (EMAIL, IP_ORIGEN, EXITOSO) VALUES (:email, :ip, :exitoso)"
        );
        // IMPORTANTE: bindValue explícito con PDO::PARAM_BOOL.
        // Si se usa execute([...]) con un array, PDO enlaza todo como PARAM_STR
        // por defecto, y PHP convierte `false` a "" (cadena vacía), lo cual
        // rompe el INSERT contra una columna boolean en PostgreSQL
        // ("invalid input syntax for type boolean"). `true` sí funcionaba
        // porque (string) true === "1", que Postgres sí acepta.
        $stmt->bindValue(':email', $email, PDO::PARAM_STR);
        $stmt->bindValue(':ip', $ip, PDO::PARAM_STR);
        $stmt->bindValue(':exitoso', $exitoso, PDO::PARAM_BOOL);
        $stmt->execute();
    } catch (PDOException $e) {
        // Si esto falla, no debe tumbar el login: solo lo dejamos en el log del servidor.
        error_log('[TourismEasy] seguridad_login.php - registrarIntentoLogin - ' . $e->getMessage());
    }
}

/**
 * Revisa si el correo está bloqueado por demasiados intentos fallidos recientes.
 * Devuelve ['bloqueado' => bool, 'minutos_restantes' => int]
 */
function verificarBloqueoLogin(PDO $pdo, string $email): array
{
    try {
        $stmt = $pdo->prepare(
            "SELECT COUNT(*) AS fallos, MAX(FECHA_INTENTO) AS ultimo_fallo
             FROM INTENTOS_LOGIN
             WHERE EMAIL = :email
               AND EXITOSO = FALSE
               AND FECHA_INTENTO > NOW() - make_interval(mins => :minutos)"
        );
        $stmt->execute([
            ':email'   => $email,
            ':minutos' => LOGIN_MINUTOS_BLOQUEO,
        ]);
        $row = $stmt->fetch();

        if ((int) ($row['fallos'] ?? 0) >= LOGIN_MAX_INTENTOS) {
            $ultimoFallo = new DateTime($row['ultimo_fallo']);
            $ahora = new DateTime();
            $segundosTranscurridos = $ahora->getTimestamp() - $ultimoFallo->getTimestamp();
            $segundosRestantes = (LOGIN_MINUTOS_BLOQUEO * 60) - $segundosTranscurridos;

            if ($segundosRestantes > 0) {
                return [
                    'bloqueado'         => true,
                    'minutos_restantes' => (int) ceil($segundosRestantes / 60),
                ];
            }
        }
    } catch (PDOException $e) {
        error_log('[TourismEasy] seguridad_login.php - verificarBloqueoLogin - ' . $e->getMessage());
    }

    return ['bloqueado' => false, 'minutos_restantes' => 0];
}

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