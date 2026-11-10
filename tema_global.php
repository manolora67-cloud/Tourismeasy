<?php
header('Content-Type: text/css; charset=utf-8');
header('Cache-Control: public, max-age=30');
header('X-Content-Type-Options: nosniff');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    exit;
}

require_once __DIR__ . '/con_db/db.php';

try {
    $paleta = $pdo->query('SELECT fn_obtener_tema_global()::TEXT')->fetchColumn();
    if (!is_string($paleta)) {
        throw new RuntimeException('La función no devolvió una paleta.');
    }

    $tema = json_decode($paleta, true, 512, JSON_THROW_ON_ERROR);
    if (!is_array($tema)) {
        throw new RuntimeException('La función devolvió una paleta inválida.');
    }

    $variables = [
        'primary' => '--theme-primary',
        'primaryLight' => '--theme-primary-light',
        'primaryDark' => '--theme-primary-dark',
        'accent' => '--theme-accent',
    ];
    $css = [];
    foreach ($variables as $key => $variable) {
        $color = $tema[$key] ?? null;
        if (!is_string($color) || !preg_match('/^#[0-9A-F]{6}$/i', $color)) {
            throw new RuntimeException('La paleta contiene un valor inválido.');
        }
        $css[] = $variable . ':' . strtoupper($color);
        $rgbVariable = $variable . '-rgb';
        $rgb = sprintf(
            '%d, %d, %d',
            hexdec(substr($color, 1, 2)),
            hexdec(substr($color, 3, 2)),
            hexdec(substr($color, 5, 2))
        );
        $css[] = $rgbVariable . ':' . $rgb;
    }

    echo 'html:root{' . implode(';', $css) . ';'
        . '--purple:var(--theme-primary);--primary:var(--theme-primary);--ck-purple:var(--theme-primary);--te-primary:var(--theme-primary);'
        . '--purple-light:var(--theme-primary-light);--primary-light:var(--theme-primary-light);--ck-purple-light:var(--theme-primary-light);--te-primary-light:var(--theme-primary-light);'
        . '--purple-dark:var(--theme-primary-dark);--primary-dark:var(--theme-primary-dark);--ck-purple-dark:var(--theme-primary-dark);--te-primary-dark:var(--theme-primary-dark);'
        . '--te-accent:var(--theme-accent);'
        . '--shadow:0 4px 24px rgba(var(--theme-primary-rgb),0.1);'
        . '--te-shadow:rgba(var(--theme-primary-rgb),0.18)}';
} catch (PDOException $e) {
    error_log('[TourismEasy] tema_global.php - ' . $e->getMessage());
    http_response_code(500);
} catch (JsonException | RuntimeException $e) {
    error_log('[TourismEasy] tema_global.php - ' . $e->getMessage());
    http_response_code(500);
}
