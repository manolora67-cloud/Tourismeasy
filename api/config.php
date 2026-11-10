<?php
$localConfigPath = __DIR__ . '/config.local.php';
$localConfig = is_file($localConfigPath) ? require $localConfigPath : [];

if (!is_array($localConfig)) {
    throw new UnexpectedValueException('api/config.local.php debe devolver un arreglo de configuración.');
}

$groqKey = getenv('GROQ_API_KEY') ?: ($localConfig['groq_key'] ?? null);

return [
    'groq_key' => is_string($groqKey) && trim($groqKey) !== '' ? trim($groqKey) : null,
];
