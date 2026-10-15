<?php
/**
 * db.php
 * Conexión a la base de datos PostgreSQL de TourismEasy usando PDO.
 */

// ── Datos de conexión ──
$DB_HOST = "localhost";
$DB_PORT = "5432";
$DB_NAME = "tourismeasy";
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
    http_response_code(500);
    header('Content-Type: text/plain');
    echo "ERROR: " . $e->getMessage();
    exit;
}