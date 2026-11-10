CREATE OR REPLACE FUNCTION fn_validar_correo(p_correo TEXT)
RETURNS BOOLEAN AS
$$
    SELECT COALESCE(
        CHAR_LENGTH(BTRIM(p_correo)) <= 254
        AND BTRIM(p_correo) ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$',
        FALSE
    );
$$
LANGUAGE SQL
IMMUTABLE;
