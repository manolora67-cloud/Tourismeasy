<?php
/**
 * e-commerce/listar.php
 * GET ?ajax=1                     -> lista TODOS los productos (tienda pública, sin sesión)
 * GET ?ajax=1&id_persona=1        -> lista solo los productos del artesano logueado (panel admin)
 *
 * El VALOR que mande el cliente en id_persona ya no se usa para nada: solo
 * nos fijamos en si el parámetro viene presente, como bandera de "dame
 * solo los míos". El id real siempre sale de la sesión de servidor
 * ($_SESSION), para que nadie pueda pedir los productos de otro artesano
 * con solo cambiar un número en la URL.
 */

session_start();

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json');

$idPersona = null;

if (isset($_GET['id_persona']) && $_GET['id_persona'] !== '') {
    // Piden "solo mis productos": exige sesión real, ignora el valor recibido.
    $idPersona = $_SESSION['artesano_id'] ?? null;

    if (!$idPersona) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Sesión de artesano no encontrada. Inicia sesión de nuevo.']);
        exit;
    }
}

try {
    $stmt = $pdo->prepare("SELECT * FROM fn_listar_productos(:id_persona)");
    $stmt->execute(['id_persona' => $idPersona]);
    $productos = $stmt->fetchAll();

    echo json_encode(['ok' => true, 'data' => $productos]);

} catch (PDOException $e) {
    error_log('[TourismEasy] e-commerce/listar.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error al obtener los productos.']);
}