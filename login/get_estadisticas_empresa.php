<?php
/**
 * login/get_estadisticas_empresa.php
 * Devuelve estadísticas reales de la empresa autenticada (servicios publicados),
 * según su TIPO_SERVICIO.
 * GET ?id=ID_EMPRESA
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
    $stmtEmp = $pdo->prepare("SELECT TIPO_SERVICIO FROM EMPRESAS WHERE ID_EMPRESA = :id");
    $stmtEmp->execute([':id' => $id]);
    $empresa = $stmtEmp->fetch();

    if (!$empresa) {
        http_response_code(404);
        echo json_encode(["ok" => false, "error" => "Empresa no encontrada."]);
        exit;
    }

    $tipo = $empresa['tipo_servicio'];

    // Configuración por tipo de servicio: tabla, columna de disponibilidad
    // y etiqueta del indicador.
    $config = [
        'TRANSPORTE' => [
            'tabla'        => 'TRANSPORTE',
            'colDisponible'=> 'DISPONIBILIDAD',
            'label'        => 'Transporte publicado',
        ],
        'HOSPEDAJE' => [
            'tabla'        => 'HOSPEDAJE',
            'colDisponible'=> 'DISPONIBILIDAD',
            'label'        => 'Hospedaje publicado',
        ],
        'PLANES' => [
            'tabla'        => 'PLANES_TURISTICOS',
            'colDisponible'=> 'DISPONIBILIDAD',
            'label'        => 'Plan publicado',
        ],
        'PERSONAL_AUXILIAR' => [
            'tabla'        => 'PERSONAL_AUXILIAR',
            'colDisponible'=> 'DISPONIBLE',
            'label'        => 'Auxiliar registrado',
        ],
    ];

    if (!isset($config[$tipo])) {
        http_response_code(500);
        echo json_encode(["ok" => false, "error" => "Tipo de servicio no reconocido."]);
        exit;
    }

    $c = $config[$tipo];

    // Servicios publicados y activos de esta empresa
    $stmtServ = $pdo->prepare("
        SELECT COUNT(*) AS total
        FROM {$c['tabla']}
        WHERE ID_EMPRESA = :id AND {$c['colDisponible']} = TRUE
    ");
    $stmtServ->execute([':id' => $id]);
    $serviciosPublicados = (int) $stmtServ->fetch()['total'];

    echo json_encode([
        "ok" => true,
        "estadisticas" => [
            "servicios_publicados" => $serviciosPublicados,
            "servicios_label"      => $c['label'],
        ]
    ]);

} catch (PDOException $e) {
    error_log('[TourismEasy] get_estadisticas_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => $e->getMessage()]);
}