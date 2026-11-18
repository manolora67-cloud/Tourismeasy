<?php
/**
 * Descarga un libro Excel con el resumen y todos los eventos de auditoría de un mes completo.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../cors.php';

function responderErrorAuditoriaExcel(int $status, string $message): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(
        ['ok' => false, 'error' => $message],
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

function escaparXmlExcel($value): string
{
    return htmlspecialchars(
        (string)$value,
        ENT_XML1 | ENT_QUOTES | ENT_SUBSTITUTE,
        'UTF-8'
    );
}

function celdaTextoExcel(string $reference, $value, int $style = 0): string
{
    $text = (string)($value ?? '');
    $length = function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : strlen($text);
    if ($length > 32767) {
        throw new RuntimeException('Un campo de auditoría supera el máximo de texto admitido por Excel.');
    }

    return '<c r="' . $reference . '" s="' . $style . '" t="inlineStr"><is><t xml:space="preserve">' .
        escaparXmlExcel($text) . '</t></is></c>';
}

function celdaNumeroExcel(string $reference, int $value, int $style = 5): string
{
    return '<c r="' . $reference . '" s="' . $style . '"><v>' . $value . '</v></c>';
}

function celdaFechaExcel(string $reference, string $value, int $style): string
{
    try {
        $date = new DateTimeImmutable($value, new DateTimeZone('UTC'));
        $serial = ((float)$date->format('U.u') / 86400) + 25569;
        return '<c r="' . $reference . '" s="' . $style . '"><v>' .
            number_format($serial, 10, '.', '') . '</v></c>';
    } catch (Exception $error) {
        return celdaTextoExcel($reference, $value, $style === 8 ? 6 : 7);
    }
}

function filaExcel(int $index, array $cells, ?int $height = null): string
{
    $attributes = $height === null ? '' : ' ht="' . $height . '" customHeight="1"';
    return '<row r="' . $index . '"' . $attributes . '>' . implode('', $cells) . '</row>';
}

function hojaExcel(array $rows, array $widths, ?int $freezeRows = null, ?string $filter = null, array $merges = []): string
{
    $columns = '';
    foreach ($widths as $index => $width) {
        $column = $index + 1;
        $columns .= '<col min="' . $column . '" max="' . $column . '" width="' .
            number_format($width, 2, '.', '') . '" customWidth="1"/>';
    }

    $views = '<sheetViews><sheetView workbookViewId="0">';
    if ($freezeRows !== null) {
        $firstDataRow = $freezeRows + 1;
        $views .= '<pane ySplit="' . $freezeRows . '" topLeftCell="A' . $firstDataRow .
            '" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A' .
            $firstDataRow . '" sqref="A' . $firstDataRow . '"/>';
    }
    $views .= '</sheetView></sheetViews>';

    $sheetRows = '';
    foreach ($rows as $index => $row) {
        $sheetRows .= filaExcel($index + 1, $row['cells'], $row['height'] ?? null);
    }

    $autoFilter = $filter === null ? '' : '<autoFilter ref="' . escaparXmlExcel($filter) . '"/>';
    $mergeCells = '';
    if ($merges) {
        $mergeCells = '<mergeCells count="' . count($merges) . '">';
        foreach ($merges as $range) {
            $mergeCells .= '<mergeCell ref="' . escaparXmlExcel($range) . '"/>';
        }
        $mergeCells .= '</mergeCells>';
    }

    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' .
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' .
        '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>' .
        $views .
        '<sheetFormatPr defaultRowHeight="22"/>' .
        '<cols>' . $columns . '</cols>' .
        '<sheetData>' . $sheetRows . '</sheetData>' .
        $autoFilter . $mergeCells .
        '<pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>' .
        '<pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0" paperSize="9"/>' .
        '</worksheet>';
}

function estilosExcelAuditoria(): string
{
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' .
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' .
        '<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy hh:mm:ss"/></numFmts>' .
        '<fonts count="5">' .
        '<font><sz val="10"/><color rgb="FF334155"/><name val="Calibri"/></font>' .
        '<font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' .
        '<font><i/><sz val="10"/><color rgb="FF475569"/><name val="Calibri"/></font>' .
        '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>' .
        '<font><b/><sz val="10"/><color rgb="FF4C1D95"/><name val="Calibri"/></font>' .
        '</fonts>' .
        '<fills count="9">' .
        '<fill><patternFill patternType="none"/></fill>' .
        '<fill><patternFill patternType="gray125"/></fill>' .
        '<fill><patternFill patternType="solid"><fgColor rgb="FF7C3AED"/><bgColor indexed="64"/></patternFill></fill>' .
        '<fill><patternFill patternType="solid"><fgColor rgb="FFF5F3FF"/><bgColor indexed="64"/></patternFill></fill>' .
        '<fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/><bgColor indexed="64"/></patternFill></fill>' .
        '<fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>' .
        '<fill><patternFill patternType="solid"><fgColor rgb="FFDBEAFE"/><bgColor indexed="64"/></patternFill></fill>' .
        '<fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/><bgColor indexed="64"/></patternFill></fill>' .
        '<fill><patternFill patternType="solid"><fgColor rgb="FFFEE2E2"/><bgColor indexed="64"/></patternFill></fill>' .
        '</fills>' .
        '<borders count="2">' .
        '<border><left/><right/><top/><bottom/><diagonal/></border>' .
        '<border><left style="thin"><color rgb="FFD9E2F0"/></left><right style="thin"><color rgb="FFD9E2F0"/></right>' .
        '<top style="thin"><color rgb="FFD9E2F0"/></top><bottom style="thin"><color rgb="FFD9E2F0"/></bottom><diagonal/></border>' .
        '</borders>' .
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' .
        '<cellXfs count="13">' .
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' .
        '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center"/></xf>' .
        '<xf numFmtId="0" fontId="2" fillId="3" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' .
        '<xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>' .
        '<xf numFmtId="0" fontId="4" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' .
        '<xf numFmtId="3" fontId="0" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>' .
        '<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>' .
        '<xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>' .
        '<xf numFmtId="164" fontId="0" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>' .
        '<xf numFmtId="164" fontId="0" fillId="5" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>' .
        '<xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' .
        '<xf numFmtId="0" fontId="0" fillId="7" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' .
        '<xf numFmtId="0" fontId="0" fillId="8" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' .
        '</cellXfs>' .
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' .
        '</styleSheet>';
}

function formatoJsonAuditoria($value): string
{
    if ($value === null || $value === '') {
        return '';
    }
    if (is_array($value) || is_object($value)) {
        $decoded = $value;
    } else {
        $decoded = json_decode((string)$value, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return (string)$value;
        }
    }
    $formatted = json_encode(
        $decoded,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE
    );
    return $formatted === false ? (string)$value : $formatted;
}

function crearLibroAuditoriaExcel(array $events, string $monthLabel, string $generatedAt): string
{
    if (!class_exists('ZipArchive')) {
        throw new RuntimeException('El servidor no tiene habilitada la extensión ZIP necesaria para crear Excel.');
    }

    $levelCounts = [];
    foreach ($events as $event) {
        $level = trim((string)($event['nivel'] ?? ''));
        $key = $level === '' ? 'Sin nivel' : ucfirst($level);
        $levelCounts[$key] = ($levelCounts[$key] ?? 0) + 1;
    }
    ksort($levelCounts, SORT_NATURAL | SORT_FLAG_CASE);

    $summaryRows = [
        ['cells' => [celdaTextoExcel('A1', 'TourismEasy · Auditoría mensual', 1)], 'height' => 34],
        ['cells' => [celdaTextoExcel('A2', 'Periodo: ' . $monthLabel, 2)], 'height' => 25],
        ['cells' => [celdaTextoExcel('A3', 'Generado: ' . $generatedAt, 2)], 'height' => 23],
        ['cells' => [], 'height' => 8],
        ['cells' => [celdaTextoExcel('A5', 'Indicador', 3), celdaTextoExcel('B5', 'Resultado', 3)], 'height' => 24],
        ['cells' => [celdaTextoExcel('A6', 'Eventos exportados', 4), celdaNumeroExcel('B6', count($events))], 'height' => 23],
    ];
    $summaryRow = 7;
    foreach ($levelCounts as $level => $count) {
        $summaryRows[] = [
            'cells' => [
                celdaTextoExcel('A' . $summaryRow, $level, 4),
                celdaNumeroExcel('B' . $summaryRow, $count),
            ],
            'height' => 23,
        ];
        $summaryRow++;
    }
    $summaryRows[] = [
        'cells' => [
            celdaTextoExcel('A' . $summaryRow, 'Cobertura', 4),
            celdaTextoExcel('B' . $summaryRow, 'Todos los eventos guardados en la base de datos para el mes seleccionado.', 6),
        ],
        'height' => 40,
    ];
    $summaryRows[] = [
        'cells' => [
            celdaTextoExcel('A' . ($summaryRow + 1), 'Importante', 4),
            celdaTextoExcel('B' . ($summaryRow + 1), 'La pestaña Auditoría incluye el detalle completo; esta descarga no elimina ni modifica registros.', 6),
        ],
        'height' => 40,
    ];

    $auditRows = [
        ['cells' => [celdaTextoExcel('A1', 'TourismEasy · Registro de auditoría', 1)], 'height' => 34],
        ['cells' => [celdaTextoExcel('A2', $monthLabel . ' · ' . count($events) . ' eventos · Orden cronológico', 2)], 'height' => 25],
        ['cells' => [], 'height' => 8],
        ['cells' => [celdaTextoExcel('A4', 'ID auditoría', 3), celdaTextoExcel('B4', 'Fecha y hora', 3), celdaTextoExcel('C4', 'Usuario', 3),
            celdaTextoExcel('D4', 'Acción', 3), celdaTextoExcel('E4', 'Módulo', 3), celdaTextoExcel('F4', 'Detalle', 3),
            celdaTextoExcel('G4', 'Nivel', 3), celdaTextoExcel('H4', 'Valores anteriores', 3), celdaTextoExcel('I4', 'Valores nuevos', 3)], 'height' => 30],
    ];

    $excelRow = 5;
    foreach ($events as $index => $event) {
        $alternate = $index % 2 === 1;
        $textStyle = $alternate ? 7 : 6;
        $dateStyle = $alternate ? 9 : 8;
        $level = strtolower(trim((string)($event['nivel'] ?? '')));
        $levelStyle = $level === 'info' ? 10 : ($level === 'advertencia' ? 11 : ($level === 'error' ? 12 : $textStyle));
        $id = (int)($event['id'] ?? 0);

        $auditRows[] = [
            'cells' => [
                celdaNumeroExcel('A' . $excelRow, $id, $textStyle),
                celdaFechaExcel('B' . $excelRow, (string)($event['fecha'] ?? ''), $dateStyle),
                celdaTextoExcel('C' . $excelRow, $event['usuario'] ?? '', $textStyle),
                celdaTextoExcel('D' . $excelRow, $event['accion'] ?? '', $textStyle),
                celdaTextoExcel('E' . $excelRow, $event['modulo'] ?? '', $textStyle),
                celdaTextoExcel('F' . $excelRow, $event['detalle'] ?? '', $textStyle),
                celdaTextoExcel('G' . $excelRow, $event['nivel'] ?? '', $levelStyle),
                celdaTextoExcel('H' . $excelRow, formatoJsonAuditoria($event['anterior'] ?? null), $textStyle),
                celdaTextoExcel('I' . $excelRow, formatoJsonAuditoria($event['nuevo'] ?? null), $textStyle),
            ],
        ];
        $excelRow++;
    }

    $files = [
        '[Content_Types].xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' .
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' .
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' .
            '<Default Extension="xml" ContentType="application/xml"/>' .
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' .
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' .
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' .
            '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' .
            '</Types>',
        '_rels/.rels' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' .
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' .
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' .
            '</Relationships>',
        'xl/workbook.xml' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' .
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' .
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' .
            '<sheets><sheet name="Resumen" sheetId="1" r:id="rId1"/><sheet name="Auditoría" sheetId="2" r:id="rId2"/></sheets></workbook>',
        'xl/_rels/workbook.xml.rels' => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' .
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' .
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' .
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>' .
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' .
            '</Relationships>',
        'xl/styles.xml' => estilosExcelAuditoria(),
        'xl/worksheets/sheet1.xml' => hojaExcel(
            $summaryRows,
            [32, 66],
            null,
            null,
            ['A1:B1', 'A2:B2', 'A3:B3']
        ),
        'xl/worksheets/sheet2.xml' => hojaExcel(
            $auditRows,
            [14, 22, 30, 28, 22, 54, 18, 44, 44],
            4,
            'A4:I' . max(4, $excelRow - 1),
            ['A1:I1', 'A2:I2']
        ),
    ];

    $tempFile = tempnam(sys_get_temp_dir(), 'te-auditoria-');
    if ($tempFile === false) {
        throw new RuntimeException('No se pudo preparar el archivo Excel temporal.');
    }

    $zip = new ZipArchive();
    if ($zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        if (is_file($tempFile) && !unlink($tempFile)) {
            error_log('[TourismEasy] No se pudo limpiar un archivo temporal de auditoría.');
        }
        throw new RuntimeException('No se pudo crear el archivo Excel.');
    }

    try {
        foreach ($files as $path => $contents) {
            if (!$zip->addFromString($path, $contents)) {
                throw new RuntimeException('No se pudo escribir el libro de Excel.');
            }
        }
        if (!$zip->close()) {
            throw new RuntimeException('No se pudo finalizar el libro de Excel.');
        }
    } catch (RuntimeException $error) {
        $zip->close();
        if (is_file($tempFile) && !unlink($tempFile)) {
            error_log('[TourismEasy] No se pudo limpiar un archivo temporal de auditoría.');
        }
        throw $error;
    }

    return $tempFile;
}

if (($_SESSION['tipo'] ?? '') !== 'admin' || empty($_SESSION['id_persona'])) {
    responderErrorAuditoriaExcel(401, 'No autorizado. Inicia sesión nuevamente.');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    responderErrorAuditoriaExcel(405, 'Método no permitido.');
}

$month = $_GET['mes'] ?? '';
if (!is_string($month) || !preg_match('/^\d{4}-(0[1-9]|1[0-2])$/D', $month)) {
    responderErrorAuditoriaExcel(400, 'Selecciona un mes válido.');
}

$start = DateTimeImmutable::createFromFormat('!Y-m-d', $month . '-01');
$currentMonth = new DateTimeImmutable('first day of this month');
if (!$start || $start->format('Y-m') !== $month || $start >= $currentMonth) {
    responderErrorAuditoriaExcel(400, 'Solo se pueden descargar auditorías de meses completos.');
}
$end = $start->modify('first day of next month');
$monthNames = [
    1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
    5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
    9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
];
$monthLabel = ucfirst($monthNames[(int)$start->format('n')]) . ' de ' . $start->format('Y');
$tempFile = null;

try {
    $statement = $pdo->prepare(
        'SELECT
            a.ID_AUDITORIA AS id,
            a.FECHA_HORA AS fecha,
            COALESCE(u.EMAIL_LOGIN, ue.EMAIL_LOGIN, uec.EMAIL_LOGIN, \'Sistema / desconocido\') AS usuario,
            a.NOM_OPERACION AS accion,
            a.TABLA_AFECTADA AS modulo,
            a.DETALLE AS detalle,
            a.NIVEL AS nivel,
            a.REG_ANTERIOR AS anterior,
            a.REG_NUEVO AS nuevo
         FROM AUDITORIA a
         LEFT JOIN USUARIOS u ON u.ID_PERSONA::text = a.ID_USUARIO
         LEFT JOIN USUARIOS_EMPRESA ue ON ue.ID_EMPRESA::text = a.ID_EMPRESA
         LEFT JOIN USUARIOS_ECOMMERCE uec ON uec.ID_PERSONA_ECOMMERCE::text = a.ID_PERSONA_ECOMMERCE
         WHERE a.FECHA_HORA >= :inicio
           AND a.FECHA_HORA < :fin
         ORDER BY a.FECHA_HORA ASC, a.ID_AUDITORIA ASC'
    );
    $statement->execute([
        ':inicio' => $start->format('Y-m-d'),
        ':fin' => $end->format('Y-m-d'),
    ]);
    $events = $statement->fetchAll(PDO::FETCH_ASSOC);
    $tempFile = crearLibroAuditoriaExcel($events, $monthLabel, (new DateTimeImmutable())->format('d/m/Y H:i:s'));
    if (!is_file($tempFile) || !is_readable($tempFile)) {
        throw new RuntimeException('No se pudo leer el archivo Excel generado.');
    }

    $fileSize = filesize($tempFile);
    if ($fileSize === false) {
        throw new RuntimeException('No se pudo determinar el tamaño del archivo Excel.');
    }
} catch (PDOException $error) {
    error_log('[TourismEasy] exportar_auditoria_mensual_admin.php - ' . $error->getMessage());
    if ($tempFile && is_file($tempFile) && !unlink($tempFile)) {
        error_log('[TourismEasy] No se pudo limpiar un archivo temporal de auditoría.');
    }
    responderErrorAuditoriaExcel(500, 'No se pudo consultar la auditoría del mes seleccionado.');
} catch (RuntimeException $error) {
    error_log('[TourismEasy] exportar_auditoria_mensual_admin.php - ' . $error->getMessage());
    if ($tempFile && is_file($tempFile) && !unlink($tempFile)) {
        error_log('[TourismEasy] No se pudo limpiar un archivo temporal de auditoría.');
    }
    responderErrorAuditoriaExcel(500, $error->getMessage());
}

$filename = 'tourismeasy-auditoria-' . $month . '.xlsx';
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . $fileSize);
header('Cache-Control: private, no-store, no-cache, must-revalidate');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');
readfile($tempFile);
if (is_file($tempFile) && !unlink($tempFile)) {
    error_log('[TourismEasy] No se pudo limpiar un archivo temporal de auditoría.');
}
