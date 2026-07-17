<?php
/**
 * auxiliar/crear.php
 * Columnas reales de PERSONAL_AUXILIAR:
 * ID_PERSONAL_AUXILIAR, ID_EMPRESA, ID_CARGO_AUX, NOMBRE_PROFESIONAL,
 * DISPONIBILIDAD (varchar: "Completa","Fines de semana"...),
 * EXPERIENCIA, ESPECIALIDAD, ACCESIBILIDAD, ID_CIUDAD,
 * TARIFA, DISPONIBLE (boolean), IMG_URL, FECHA_CREACION
 */

session_start();
require_once __DIR__ . '/../con_db/db.php';

require_once __DIR__ . '/../cors.php';
header('Content-Type: application/json');


if (empty($_SESSION['id_empresa']) || ($_SESSION['tipo'] ?? '') !== 'empresa') {
    http_response_code(401);
    echo json_encode(["ok" => false, "error" => "No autorizado."]);
    exit;
}

$id_empresa    = $_SESSION['id_empresa'];
$input         = json_decode(file_get_contents('php://input'), true);

$nombre        = trim($input['nombre']          ?? '');  // → NOMBRE_PROFESIONAL
$especialidad  = trim($input['especialidad']    ?? '');  // → ESPECIALIDAD
$id_cargo      = intval($input['id_cargo']      ?? 0);   // → ID_CARGO_AUX
$id_ciudad     = trim($input['id_ciudad']       ?? '');  // → ID_CIUDAD
$experiencia   = trim($input['experiencia']     ?? 'No especificada'); // → EXPERIENCIA
$disponibilidad= trim($input['disponibilidad_texto'] ?? 'Completa');   // → DISPONIBILIDAD (varchar)
$tarifa        = intval($input['tarifa_hora']   ?? 0);   // → TARIFA
$accesibilidad = trim($input['accesibilidad']   ?? '');  // → ACCESIBILIDAD
$disponible    = isset($input['disponible']) ? (bool)$input['disponible'] : true; // → DISPONIBLE (bool)
$img_url       = trim($input['img_url']         ?? '') ?: null;
$id_editar     = isset($input['id']) ? intval($input['id']) : null;

if (!$nombre || !$especialidad || !$id_cargo || !$id_ciudad || $tarifa <= 0 || !$accesibilidad) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "Faltan campos obligatorios (nombre, especialidad, cargo, ciudad, tarifa, accesibilidad)."]);
    exit;
}

try {
    $chkCargo = $pdo->prepare("SELECT 1 FROM CARGOS_PER_AUX WHERE ID_CARGO_AUX = :c");
    $chkCargo->execute([':c' => $id_cargo]);
    if (!$chkCargo->fetch()) {
        echo json_encode(["ok" => false, "error" => "Cargo no válido."]);
        exit;
    }

    $chkCiudad = $pdo->prepare("SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = :c");
    $chkCiudad->execute([':c' => $id_ciudad]);
    if (!$chkCiudad->fetch()) {
        echo json_encode(["ok" => false, "error" => "Ciudad no válida."]);
        exit;
    }

    if ($id_editar) {
        $chk = $pdo->prepare("SELECT 1 FROM PERSONAL_AUXILIAR WHERE ID_PERSONAL_AUXILIAR = :id AND ID_EMPRESA = :emp");
        $chk->execute([':id' => $id_editar, ':emp' => $id_empresa]);
        if (!$chk->fetch()) {
            echo json_encode(["ok" => false, "error" => "Registro no encontrado o no pertenece a tu empresa."]);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE PERSONAL_AUXILIAR SET
                NOMBRE_PROFESIONAL = :nombre,
                ESPECIALIDAD       = :esp,
                ID_CARGO_AUX       = :cargo,
                ID_CIUDAD          = :ciudad,
                EXPERIENCIA        = :exp,
                DISPONIBILIDAD     = :disp_txt,
                TARIFA             = :tarifa,
                ACCESIBILIDAD      = :acc,
                DISPONIBLE         = :disp,
                IMG_URL            = :img
            WHERE ID_PERSONAL_AUXILIAR = :id AND ID_EMPRESA = :emp
        ");
        $stmt->execute([
            ':nombre'   => $nombre,       ':esp'      => $especialidad,
            ':cargo'    => $id_cargo,     ':ciudad'   => $id_ciudad,
            ':exp'      => $experiencia,  ':disp_txt' => $disponibilidad,
            ':tarifa'   => $tarifa,       ':acc'      => $accesibilidad,
            ':disp'     => $disponible ? 't' : 'f',
            ':img'      => $img_url,
            ':id'       => $id_editar,    ':emp'      => $id_empresa,
        ]);

        echo json_encode(["ok" => true, "mensaje" => "Personal auxiliar actualizado.", "id" => $id_editar]);

    } else {
        $stmt = $pdo->prepare("
            INSERT INTO PERSONAL_AUXILIAR
                (ID_EMPRESA, ID_CARGO_AUX, NOMBRE_PROFESIONAL, DISPONIBILIDAD,
                 EXPERIENCIA, ESPECIALIDAD, ACCESIBILIDAD, ID_CIUDAD,
                 TARIFA, DISPONIBLE, IMG_URL)
            VALUES
                (:emp, :cargo, :nombre, :disp_txt,
                 :exp, :esp, :acc, :ciudad,
                 :tarifa, :disp, :img)
            RETURNING ID_PERSONAL_AUXILIAR
        ");
        $stmt->execute([
            ':emp'      => $id_empresa,   ':cargo'    => $id_cargo,
            ':nombre'   => $nombre,       ':disp_txt' => $disponibilidad,
            ':exp'      => $experiencia,  ':esp'      => $especialidad,
            ':acc'      => $accesibilidad,':ciudad'   => $id_ciudad,
            ':tarifa'   => $tarifa,       ':disp'     => $disponible ? 't' : 'f',
            ':img'      => $img_url,
        ]);

        $nuevo = $stmt->fetch();
        echo json_encode(["ok" => true, "mensaje" => "Personal auxiliar creado.", "id" => $nuevo['id_personal_auxiliar']]);
    }

} catch (PDOException $e) {
    error_log('[TourismEasy] auxiliar/crear.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "Error al guardar el personal auxiliar."]);
}