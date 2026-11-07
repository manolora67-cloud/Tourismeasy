CREATE OR REPLACE FUNCTION fn_obtener_tema_global()
RETURNS JSONB AS
$$
DECLARE
    v_paleta CONFIGURACION_TEMA_GLOBAL.PALETA%TYPE;
BEGIN
    SELECT PALETA
    INTO v_paleta
    FROM CONFIGURACION_TEMA_GLOBAL
    WHERE ID = 1;

    IF v_paleta IS NULL THEN
        RAISE EXCEPTION 'No se encontró la paleta global.';
    END IF;

    RETURN v_paleta;
END;
$$
LANGUAGE plpgsql;
