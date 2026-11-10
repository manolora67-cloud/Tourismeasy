<?php

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();
require_once __DIR__ . '/../con_db/seguridad_captcha.php';

header('Content-Type: application/json');
header('Cache-Control: no-store, private');
require_once __DIR__ . '/../cors.php';

function responderCaptcha(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function mezclarCaptcha(array $items): array
{
    for ($i = count($items) - 1; $i > 0; $i--) {
        $j = random_int(0, $i);
        [$items[$i], $items[$j]] = [$items[$j], $items[$i]];
    }
    return $items;
}

$categorias = [
    'aventura' => [
        'aventura/aventura1.jpg',
        'aventura/aventura2.jpg',
        'aventura/aventura3.jpg',
        'aventura/aventura4.jpg',
    ],
    'cascadas' => [
        'cascadas/cascada1.jpg',
        'cascadas/cascada2.jpg',
        'cascadas/cascada3.jpg',
        'cascadas/cascada4.jpg',
    ],
    'naturaleza' => [
        'naturaleza/naturaleza1.jpg',
        'naturaleza/naturaleza2.jpg',
        'naturaleza/naturaleza3.jpg',
        'naturaleza/naturaleza4.jpg',
    ],
    'pueblos' => [
        'pueblos/pueblo1.png',
        'pueblos/pueblo2.png',
        'pueblos/pueblo3.png',
        'pueblos/pueblo4.png',
    ],
];

$distractores = [
    'distractores/distractor1.jpg',
    'distractores/distractor2.jpg',
    'distractores/distractor3.jpg',
    'distractores/distractor4.jpg',
    'distractores/distractor5.jpg',
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $imageId = $_GET['image'] ?? '';
    if ($imageId !== '') {
        $challenge = $_SESSION['te_captcha_challenge'] ?? null;
        $imagePath = is_array($challenge)
            ? ($challenge['images'][$imageId] ?? null)
            : null;

        if (
            !is_string($imagePath)
            || !is_numeric($challenge['expires'] ?? null)
            || (int) $challenge['expires'] < time()
        ) {
            http_response_code(404);
            exit;
        }

        $fullPath = __DIR__ . '/../img/' . $imagePath;
        if (!is_file($fullPath)) {
            http_response_code(404);
            exit;
        }

        $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        $contentType = $extension === 'png' ? 'image/png' : 'image/jpeg';
        header('Content-Type: ' . $contentType);
        header('X-Content-Type-Options: nosniff');
        session_write_close();
        readfile($fullPath);
        exit;
    }

    $labels = array_keys($categorias);
    $label = $labels[random_int(0, count($labels) - 1)];
    $correctas = $categorias[$label];
    $imagenes = mezclarCaptcha(array_merge($correctas, $distractores));
    $indicesCorrectos = [];
    $mapaImagenes = [];
    $idsImagenes = [];

    foreach ($imagenes as $index => $imagen) {
        $imageId = bin2hex(random_bytes(12));
        $mapaImagenes[$imageId] = $imagen;
        $idsImagenes[] = $imageId;
        if (in_array($imagen, $correctas, true)) {
            $indicesCorrectos[] = $index;
        }
    }

    $id = bin2hex(random_bytes(16));
    $_SESSION['te_captcha_challenge'] = [
        'id' => $id,
        'indices' => $indicesCorrectos,
        'images' => $mapaImagenes,
        'expires' => time() + 300,
    ];
    teConsumirCaptchaLoginToken();

    responderCaptcha(200, [
        'ok' => true,
        'challenge' => [
            'id' => $id,
            'label' => $label,
            'images' => $idsImagenes,
        ],
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST, OPTIONS');
    responderCaptcha(405, ['ok' => false, 'error' => 'Método no permitido.']);
}

$input = json_decode(file_get_contents('php://input'), true);
$challenge = $_SESSION['te_captcha_challenge'] ?? null;
$challengeId = $input['challenge_id'] ?? '';
$selected = $input['selected'] ?? null;

if (
    !is_array($challenge)
    || !is_string($challengeId)
    || !hash_equals((string) ($challenge['id'] ?? ''), $challengeId)
    || !is_numeric($challenge['expires'] ?? null)
    || (int) $challenge['expires'] < time()
    || !is_array($selected)
    || count($selected) > 9
) {
    unset($_SESSION['te_captcha_challenge']);
    responderCaptcha(400, ['ok' => false, 'error' => 'El desafío expiró. Solicita uno nuevo.']);
}

$selectedIndices = [];
foreach ($selected as $index) {
    if (!is_int($index) || $index < 0 || $index > 8 || in_array($index, $selectedIndices, true)) {
        unset($_SESSION['te_captcha_challenge']);
        responderCaptcha(400, ['ok' => false, 'error' => 'La selección del desafío no es válida.']);
    }
    $selectedIndices[] = $index;
}

unset($_SESSION['te_captcha_challenge']);
$expectedIndices = $challenge['indices'];
sort($selectedIndices, SORT_NUMERIC);
sort($expectedIndices, SORT_NUMERIC);

if ($selectedIndices !== $expectedIndices) {
    responderCaptcha(200, ['ok' => true, 'verified' => false]);
}

$token = bin2hex(random_bytes(32));
$_SESSION['te_captcha_login_token_hash'] = hash('sha256', $token);
$_SESSION['te_captcha_login_token_expires'] = time() + 300;

responderCaptcha(200, [
    'ok' => true,
    'verified' => true,
    'token' => $token,
]);
