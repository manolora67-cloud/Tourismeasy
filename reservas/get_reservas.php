<?php
/**
 * reservas/get_reservas.php
 * Devuelve el historial de reservas del viajero autenticado.
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input     = json_decode(file_get_contents('php://input'), true);
$id_usuario = trim($input['id_usuario'] ?? '');

if (!$id_usuario) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "id_usuario requerido."]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT
            r.ID_RESERVA,
            r.FECHA_RESERVA,
            r.TIPO_SERVICIO,
            r.ESTADO,
            r.ESTADO_PAGO,
            r.NUM_USUARIOS,
            r.FECHA_CREACION,
            -- Nombre del servicio según tipo
            COALESCE(
                pt.NOM_PLAN_TURISTICO,
                h.NOM_HOSPEDAJE,
                CONCAT(t.ORIGEN, ' → ', t.DESTINO),
                pa.NOMBRE_PROFESIONAL
            ) AS NOM_SERVICIO,
            -- Pago
            pe.EPAYCO_REF_PAYCO,
            pe.EPAYCO_TRANSACTION_ID,
            pe.REFERENCIA,
            pe.MONTO_PESOS,
            pe.MONEDA,
            pe.ESTADO_EPAYCO,
            pe.METODO_PAGO
        FROM RESERVAS r
        LEFT JOIN PAGOS_EPAYCO       pe ON pe.ID_RESERVA        = r.ID_RESERVA
        LEFT JOIN PLANES_TURISTICOS pt ON pt.ID_PLAN_TURISTICO = r.ID_PLAN_TURISTICO
        LEFT JOIN HOSPEDAJE          h ON h.ID_HOSPEDAJE        = r.ID_HOSPEDAJE
        LEFT JOIN TRANSPORTE         t ON t.ID_TRANSPORTE       = r.ID_TRANSPORTE
        LEFT JOIN PERSONAL_AUXILIAR pa ON pa.ID_PERSONAL_AUXILIAR = r.ID_PERSONAL_AUXILIAR
        WHERE r.ID_USUARIO = :id_usuario
        ORDER BY r.FECHA_CREACION DESC
    ");

    $stmt->execute([':id_usuario' => $id_usuario]);
    $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["ok" => true, "reservas" => $reservas]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_reservas - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}