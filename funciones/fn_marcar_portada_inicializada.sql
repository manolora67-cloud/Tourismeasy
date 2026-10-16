CREATE OR REPLACE FUNCTION fn_marcar_portada_inicializada()
RETURNS ESTADO_INICIAL_PORTADA.DEFAULTS_CARGADOS%TYPE AS
$$
DECLARE
    v_actualizado ESTADO_INICIAL_PORTADA.DEFAULTS_CARGADOS%TYPE := FALSE;
BEGIN
    UPDATE ESTADO_INICIAL_PORTADA
    SET DEFAULTS_CARGADOS = TRUE
    WHERE ID = 1;
    v_actualizado := FOUND;
    RETURN v_actualizado;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_marcar_portada_inicializada - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_marcar_portada_inicializada - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_marcar_portada_inicializada - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_marcar_portada_inicializada: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;
