CREATE OR REPLACE FUNCTION fn_obtener_nombre_recuperacion(p_email TEXT)
RETURNS TABLE (
    nombre TEXT,
    tipo TEXT
)
LANGUAGE sql
AS $$
    SELECT cuentas.nombre, cuentas.tipo
    FROM (
        SELECT
            CONCAT_WS(' ', NULLIF(BTRIM(u.NOM_PERSONA), ''), NULLIF(BTRIM(u.APE_PERSONA), '')) AS nombre,
            'admin'::TEXT AS tipo,
            u.EMAIL_LOGIN AS email
        FROM USUARIOS u
        UNION ALL
        SELECT e.NOM_EMPRESA, 'empresa'::TEXT, ue.EMAIL_LOGIN
        FROM USUARIOS_EMPRESA ue
        JOIN EMPRESAS e ON e.ID_EMPRESA = ue.ID_EMPRESA
        UNION ALL
        SELECT
            CONCAT_WS(' ', NULLIF(BTRIM(p.NOM_PERSONA_ECOMMERCE), ''), NULLIF(BTRIM(p.APE_PERSONA_ECOMMERCE), '')),
            'artesano'::TEXT,
            u.EMAIL_LOGIN
        FROM USUARIOS_ECOMMERCE u
        JOIN PERSONAS_ECOMMERCE p ON p.ID_PERSONA_ECOMMERCE = u.ID_PERSONA_ECOMMERCE
    ) cuentas
    WHERE LOWER(cuentas.email) = LOWER(p_email)
    LIMIT 1;
$$;
