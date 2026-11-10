CREATE OR REPLACE FUNCTION fn_validar_nombre(
    p_nombre TEXT,
    p_min_caracteres INTEGER DEFAULT 2,
    p_max_caracteres INTEGER DEFAULT 50
)
RETURNS BOOLEAN AS
$$
    SELECT COALESCE(
        p_min_caracteres >= 0
        AND p_max_caracteres >= p_min_caracteres
        AND CHAR_LENGTH(BTRIM(p_nombre)) BETWEEN p_min_caracteres AND p_max_caracteres,
        FALSE
    );
$$
LANGUAGE SQL
IMMUTABLE;
