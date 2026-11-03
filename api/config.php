<?php
$localConfigPath = __DIR__ . '/config.local.php';
$localConfig = is_file($localConfigPath) ? require $localConfigPath : [];

if (!is_array($localConfig)) {
    throw new UnexpectedValueException('api/config.local.php debe devolver un arreglo de configuración.');
}

$groqKey = getenv('GROQ_API_KEY') ?: ($localConfig['groq_key'] ?? null);
$myMemoryEmail = $localConfig['mymemory_email'] ?? null;

if ($myMemoryEmail !== null && (!is_string($myMemoryEmail) || filter_var(trim($myMemoryEmail), FILTER_VALIDATE_EMAIL) === false)) {
    throw new UnexpectedValueException('mymemory_email debe ser una dirección de correo válida.');
}

return [
    'groq_key' => is_string($groqKey) && trim($groqKey) !== '' ? trim($groqKey) : null,
    'mymemory_email' => is_string($myMemoryEmail) && trim($myMemoryEmail) !== '' ? trim($myMemoryEmail) : null,
];
