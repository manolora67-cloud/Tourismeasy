<?php
/**
 * login/actualizar_config_empresa.php
 * Actualiza un campo de configuración de la empresa (upsert).
 * Espera JSON: { "id": "ID_EMPRESA", "campo": "notif_reservas" | "notif_cancelaciones" | "notif_boletin" | "tema_oscuro", "valor": true|false }
 */

require_once __DIR__ . '/../con_db/db.php';

header('Content-Type: application/json');
require_once __DIR__ . '/../cors.php';

$input = json_decode(file_get_contents('php://input'), true);

$id    = trim($input['id']    ?? '');
$campo = trim($input['campo'] ?? '');
$valor = $input['valor'] ?? null;

$columnas = [
    'notif_reservas'      => 'NOTIF_NUEVAS_RESERVAS',
    'notif_cancelaciones' => 'NOTIF_CANCELACIONES',
    'notif_boletin'       => 'NOTIF_BOLETIN',
    'tema_oscuro'         => 'TEMA_OSCURO',
];

if (!$id || !$campo || !array_key_exists($campo, $columnas) || !is_bool($valor)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Datos inválidos."]);
    exit;
}

$columna = $columnas[$campo];

try {
    $chkEmpresa = $pdo->prepare("SELECT 1 FROM USUARIOS_EMPRESA WHERE ID_EMPRESA = :id");
    $chkEmpresa->execute([':id' => $id]);
    if (!$chkEmpresa->fetch()) {
        http_response_code(403);
        echo json_encode(["ok" => false, "error" => "No autorizado."]);
        exit;
    }

    $sql = "
        INSERT INTO CONFIG_EMPRESA (ID_EMPRESA, $columna)
        VALUES (:id, :valor)
        ON CONFLICT (ID_EMPRESA) DO UPDATE
        SET $columna = :valor, FECHA_ACTUALIZACION = NOW()
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':valor', $valor, PDO::PARAM_BOOL);
    $stmt->execute();

    echo json_encode(["ok" => true]);

} catch (PDOException $e) {
    error_log('[TourismEasy] actualizar_config_empresa.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "No se pudo actualizar la configuración."]);
}
