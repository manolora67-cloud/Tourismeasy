CREATE OR REPLACE FUNCTION fn_borrar_resena(
    p_id_resena  RESENAS_PLATAFORMA.ID_RESENA%TYPE,
    p_id_persona RESENAS_PLATAFORMA.ID_PERSONA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
DECLARE
    v_filas INTEGER;
BEGIN
    DELETE FROM RESENAS_PLATAFORMA
    WHERE ID_RESENA = p_id_resena AND ID_PERSONA = p_id_persona;

    GET DIAGNOSTICS v_filas = ROW_COUNT;

    IF v_filas = 0 THEN
        RETURN QUERY SELECT FALSE, 'Reseña no encontrada o sin permiso.'::TEXT;
        RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'Reseña eliminada.'::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_borrar_resena - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'No se puede eliminar: la reseña tiene datos asociados.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_borrar_resena - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error de integridad de datos.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_borrar_resena - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La reseña está siendo modificada, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_borrar_resena: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;