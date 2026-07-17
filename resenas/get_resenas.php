<?php
/**
 * resenas/get_resenas.php
 * Devuelve todas las reseñas con nombre del autor, conteo de likes y si el
 * usuario actual (id_persona por query string) ya le dio like, vía fn_listar_resenas().
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$idActual = isset($_GET['id_persona']) ? trim($_GET['id_persona']) : null;

try {
    $stmt = $pdo->prepare("SELECT * FROM fn_listar_resenas(:id_actual)");
    $stmt->execute([':id_actual' => $idActual ?: null]);

    echo json_encode(["ok" => true, "data" => $stmt->fetchAll()]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_resenas.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al obtener reseñas."]);
}