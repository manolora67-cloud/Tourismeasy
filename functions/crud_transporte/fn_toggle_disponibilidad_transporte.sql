CREATE OR REPLACE FUNCTION fn_toggle_disponibilidad_transporte(
    t_id_transporte TRANSPORTE.ID_TRANSPORTE%TYPE,
    t_id_empresa    TRANSPORTE.ID_EMPRESA%TYPE
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_id_empresa_db  TRANSPORTE.ID_EMPRESA%TYPE;
    v_disponibilidad TRANSPORTE.DISPONIBILIDAD%TYPE;
BEGIN
    SELECT ID_EMPRESA, DISPONIBILIDAD
    INTO v_id_empresa_db, v_disponibilidad
    FROM TRANSPORTE
    WHERE ID_TRANSPORTE = t_id_transporte;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF v_id_empresa_db <> t_id_empresa THEN
        RETURN FALSE;
    END IF;

    UPDATE TRANSPORTE
    SET DISPONIBILIDAD = NOT v_disponibilidad
    WHERE ID_TRANSPORTE = t_id_transporte;

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_toggle_disponibilidad_transporte - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_toggle_disponibilidad_transporte - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_toggle_disponibilidad_transporte - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_toggle_disponibilidad_transporte: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;