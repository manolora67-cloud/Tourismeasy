CREATE OR REPLACE FUNCTION fn_obtener_credencial_login(
    p_email USUARIOS.EMAIL_LOGIN%TYPE,
    p_tipo  VARCHAR(10)
)
RETURNS TABLE (
    id_cuenta       VARCHAR(10),
    hash_contrasena VARCHAR(255)
) AS
$$
BEGIN
    IF p_tipo = 'admin' THEN
        RETURN QUERY
        SELECT u.ID_PERSONA, u.CONTRASENA
        FROM USUARIOS u
        WHERE u.EMAIL_LOGIN ILIKE p_email
        LIMIT 1;
    ELSIF p_tipo = 'empresa' THEN
        RETURN QUERY
        SELECT u.ID_EMPRESA, u.CONTRASENA
        FROM USUARIOS_EMPRESA u
        WHERE u.EMAIL_LOGIN ILIKE p_email
        LIMIT 1;
    ELSIF p_tipo = 'artesano' THEN
        RETURN QUERY
        SELECT u.ID_PERSONA_ECOMMERCE, u.CONTRASENA
        FROM USUARIOS_ECOMMERCE u
        WHERE u.EMAIL_LOGIN ILIKE p_email
        LIMIT 1;
    END IF;
END;
$$
LANGUAGE plpgsql
STABLE;