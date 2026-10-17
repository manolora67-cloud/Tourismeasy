CREATE OR REPLACE FUNCTION fn_eliminar_transporte(
    t_id_transporte TRANSPORTE.ID_TRANSPORTE%TYPE,
    t_id_empresa    TRANSPORTE.ID_EMPRESA%TYPE
)
RETURNS BOOLEAN AS
$$
DECLARE
    v_id_transporte  TRANSPORTE.ID_TRANSPORTE%TYPE;
    v_origen         TRANSPORTE.ORIGEN%TYPE;
    v_destino        TRANSPORTE.DESTINO%TYPE;
    v_id_empresa_db  TRANSPORTE.ID_EMPRESA%TYPE;
    v_disponibilidad TRANSPORTE.DISPONIBILIDAD%TYPE;
BEGIN
    SELECT
        ID_TRANSPORTE,
        ORIGEN,
        DESTINO,
        ID_EMPRESA,
        DISPONIBILIDAD
    INTO
        v_id_transporte,
        v_origen,
        v_destino,
        v_id_empresa_db,
        v_disponibilidad
    FROM TRANSPORTE
    WHERE ID_TRANSPORTE = t_id_transporte;

    -- El transporte debe existir
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Debe pertenecer a la empresa que intenta eliminarlo
    IF v_id_empresa_db <> t_id_empresa THEN
        RETURN FALSE;
    END IF;

    -- Solo se puede eliminar una ruta desactivada
    IF v_disponibilidad = TRUE THEN
        RAISE NOTICE 'La ruta "% -> %" sigue disponible, desactívala primero', v_origen, v_destino;
        RETURN FALSE;
    END IF;

    -- La empresa debe ser de tipo TRANSPORTE
    IF NOT EXISTS (SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = t_id_empresa AND TIPO_SERVICIO = 'TRANSPORTE') THEN
        RETURN FALSE;
    END IF;

    -- Al eliminar TRANSPORTE, la relación TRANSPORTE_CLASE se elimina automáticamente gracias a ON DELETE CASCADE
    DELETE FROM TRANSPORTE
    WHERE ID_TRANSPORTE = t_id_transporte;

    RETURN TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_transporte - FK inválida: %', SQLERRM;
        RETURN FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_eliminar_transporte - Check violado: %', SQLERRM;
        RETURN FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_eliminar_transporte - Fila bloqueada: %', SQLERRM;
        RETURN FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_eliminar_transporte: %', SQLERRM;
        RETURN FALSE;
END;
$$
LANGUAGE plpgsql;