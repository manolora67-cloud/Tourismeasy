CREATE OR REPLACE FUNCTION fn_validar_documento(
    p_documento TEXT,
    p_min_digitos INTEGER DEFAULT 6,
    p_max_digitos INTEGER DEFAULT 10
)
RETURNS BOOLEAN AS
$$
    SELECT COALESCE(
        p_min_digitos >= 1
        AND p_max_digitos >= p_min_digitos
        AND BTRIM(p_documento) ~ '^[0-9]+$'
        AND CHAR_LENGTH(BTRIM(p_documento)) BETWEEN p_min_digitos AND p_max_digitos,
        FALSE
    );
$$
LANGUAGE SQL
IMMUTABLE;
