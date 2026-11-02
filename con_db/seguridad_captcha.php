<?php

function teCaptchaLoginTokenValido($token): bool
{
    if (!is_string($token) || $token === '') {
        return false;
    }

    $storedHash = $_SESSION['te_captcha_login_token_hash'] ?? '';
    $expiresAt = $_SESSION['te_captcha_login_token_expires'] ?? 0;
    if (!is_string($storedHash) || $storedHash === '' || !is_numeric($expiresAt) || (int) $expiresAt < time()) {
        teConsumirCaptchaLoginToken();
        return false;
    }

    return hash_equals($storedHash, hash('sha256', $token));
}

function teConsumirCaptchaLoginToken(): void
{
    unset(
        $_SESSION['te_captcha_login_token_hash'],
        $_SESSION['te_captcha_login_token_expires']
    );
}
