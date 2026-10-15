<?php
/**
 * soli_empresas/get_estadisticas_empresa.php
 * Devuelve, para la empresa autenticada, según su TIPO_SERVICIO:
 *  - servicios_publicados / servicios_activos
 *  - accesibilidad: lista de textos de accesibilidad registrados en sus servicios
 * (Ya no se calculan reservas ni viajeros atendidos: las reservas se coordinan
 * directamente por WhatsApp entre la empresa y el viajero, fuera de la plataforma.)
 * GET ?id=NIT_EMPRESA
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$id = trim($_GET['id'] ?? '');

if (!$id) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "id requerido."]);
    exit;
}

try {
    $stmtE = $pdo->prepare("SELECT TIPO_SERVICIO FROM EMPRESAS WHERE ID_EMPRESA = :id");
    $stmtE->execute([':id' => $id]);
    $empresa = $stmtE->fetch();

    if (!$empresa) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Empresa no encontrada."]);
        exit;
    }

    $tipo = $empresa['tipo_servicio'];

    // Config por tipo de servicio: tabla, columna de disponibilidad
    // y columna de accesibilidad (si existe).
    $CONFIG = [
        'TRANSPORTE' => [
            'tabla' => 'TRANSPORTE', 'pk' => 'ID_TRANSPORTE',
            'disponible_col' => 'DISPONIBILIDAD', 'acc_col' => null,
        ],
        'HOSPEDAJE' => [
            'tabla' => 'HOSPEDAJE', 'pk' => 'ID_HOSPEDAJE',
            'disponible_col' => 'DISPONIBILIDAD', 'acc_col' => 'ACCESIBILIDAD',
        ],
        'PLANES' => [
            'tabla' => 'PLANES_TURISTICOS', 'pk' => 'ID_PLAN_TURISTICO',
            'disponible_col' => 'DISPONIBILIDAD', 'acc_col' => 'ACCESIBILIDAD',
        ],
    ];

    // Si el tipo no coincide con una sola tabla (p. ej. "PLANES" registrada distinto),
    // se procesan todas las categorías que apliquen.
    $tiposAProcesar = isset($CONFIG[$tipo]) ? [$tipo] : array_keys($CONFIG);

    $totalPublicados = 0;
    $accesibilidad    = [];

    foreach ($tiposAProcesar as $t) {
        $cfg = $CONFIG[$t];

        // Servicios publicados / activos de la empresa
        $sql = "SELECT {$cfg['pk']} AS id, {$cfg['disponible_col']} AS disp" .
               ($cfg['acc_col'] ? ", {$cfg['acc_col']} AS acc" : "") .
               " FROM {$cfg['tabla']} WHERE ID_EMPRESA = :id";
        $st = $pdo->prepare($sql);
        $st->execute([':id' => $id]);
        $filas = $st->fetchAll();

        $idsServicio = [];
        foreach ($filas as $f) {
            $idsServicio[] = $f['id'];
            if ($f['disp']) $totalPublicados++;
            if ($cfg['acc_col'] && !empty($f['acc'])) {
                $accesibilidad[trim($f['acc'])] = true;
            }
        }
    }

    echo json_encode([
        "ok" => true,
        "estadisticas" => [
            "servicios_publicados" => $totalPublicados,
            "accesibilidad"        => array_values(array_keys($accesibilidad)),
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_estadisticas_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}
