<?php
/**
 * db.php
 * Conexión a la base de datos PostgreSQL de TourismEasy usando PDO.
 */

$DB_HOST = "localhost";
$DB_PORT = "5432";
$DB_NAME = "db_tourismeasy";
$DB_USER = "gr_tourismeasy";
$DB_PASS = "dajaide";

// ── Cadena de conexión (DSN) para PostgreSQL ──
$dsn = "pgsql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME}";

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    error_log('[TourismEasy] No se pudo establecer conexión con PostgreSQL: ' . $e->getMessage());
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'El servicio no está disponible en este momento. Intenta de nuevo más tarde.';
    exit;
}

require_once __DIR__ . '/seguridad_login.php';
try {
    validarSesionActivaEnBD($pdo);
} catch (Throwable $e) {
    error_log('[TourismEasy] No se pudo validar la sesión en PostgreSQL: ' . $e->getMessage());
    http_response_code(503);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'El servicio no está disponible en este momento. Intenta de nuevo más tarde.';
    exit;
}