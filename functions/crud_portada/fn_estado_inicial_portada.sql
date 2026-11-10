CREATE OR REPLACE FUNCTION fn_estado_inicial_portada(
    p_bloquear ESTADO_INICIAL_PORTADA.DEFAULTS_CARGADOS%TYPE DEFAULT FALSE
)
RETURNS ESTADO_INICIAL_PORTADA.DEFAULTS_CARGADOS%TYPE AS
$$
DECLARE
    v_cargado ESTADO_INICIAL_PORTADA.DEFAULTS_CARGADOS%TYPE;
BEGIN
    IF p_bloquear THEN
        SELECT DEFAULTS_CARGADOS INTO v_cargado
        FROM ESTADO_INICIAL_PORTADA
        WHERE ID = 1
        FOR UPDATE;
    ELSE
        SELECT DEFAULTS_CARGADOS INTO v_cargado
        FROM ESTADO_INICIAL_PORTADA
        WHERE ID = 1;
    END IF;

    RETURN v_cargado;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_estado_inicial_portada - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_estado_inicial_portada - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_estado_inicial_portada - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_estado_inicial_portada: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
