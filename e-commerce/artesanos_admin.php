<?php
/**
 * api/artesanos_admin.php
 * GET  → lista artesanos (todos o filtrados por estado), vía fn_listar_artesanos()
 * POST → aprueba o rechaza un artesano { "id": "...", "accion": "aprobar"|"rechazar" },
 *        vía fn_actualizar_estado_artesano()
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

// ── GET: listar artesanos ──
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $estado = $_GET['estado'] ?? 'PENDIENTE'; // por defecto pendientes
    $estados_validos = ['PENDIENTE', 'ACTIVO', 'INACTIVO', 'TODOS'];
    if (!in_array($estado, $estados_validos)) $estado = 'PENDIENTE';

    try {
        $stmt = $pdo->prepare("SELECT * FROM fn_listar_artesanos(:estado)");
        $stmt->execute([':estado' => $estado]);
        $artesanos = $stmt->fetchAll();

        echo json_encode(["ok" => true, "artesanos" => $artesanos]);

    } catch (PDOException $e) {
        error_log('[TourismEasy] artesanos_admin.php GET - ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => $e->getMessage()]);
    }
    exit;
}

// ── POST: aprobar o rechazar ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $id     = trim($input['id']     ?? '');
    $accion = trim($input['accion'] ?? '');

    if (!$id || !in_array($accion, ['aprobar', 'rechazar'])) {
        http_response_code(400);
        echo json_encode(["ok" => false, "error" => "id y accion requeridos."]);
        exit;
    }

    $nuevo_estado = $accion === 'aprobar' ? 'ACTIVO' : 'INACTIVO';

    try {
        $stmt = $pdo->prepare("SELECT fn_actualizar_estado_artesano(:id, :estado)");
        $stmt->execute([':id' => $id, ':estado' => $nuevo_estado]);

        if (!$stmt->fetchColumn()) {
            http_response_code(404);
            echo json_encode(["ok" => false, "error" => "Artesano no encontrado."]);
            exit;
        }

        echo json_encode(["ok" => true, "estado" => $nuevo_estado]);

    } catch (PDOException $e) {
        error_log('[TourismEasy] artesanos_admin.php POST - ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["ok" => false, "error" => "Método no permitido."]);