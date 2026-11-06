CREATE OR REPLACE FUNCTION fn_editar_resena(
    p_id_resena  RESENAS_PLATAFORMA.ID_RESENA%TYPE,
    p_rating     RESENAS_PLATAFORMA.PUNTUACION%TYPE,
    p_texto      RESENAS_PLATAFORMA.COMENTARIO%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
DECLARE
    v_filas INTEGER;
BEGIN
    IF p_rating < 1 OR p_rating > 5 THEN
        RETURN QUERY SELECT FALSE, 'Puntuación inválida (1-5).'::TEXT;
        RETURN;
    END IF;

    IF p_texto IS NULL OR LENGTH(p_texto) < 10 THEN
        RETURN QUERY SELECT FALSE, 'El comentario debe tener al menos 10 caracteres.'::TEXT;
        RETURN;
    END IF;

    UPDATE RESENAS_PLATAFORMA
    SET PUNTUACION = p_rating, COMENTARIO = p_texto
    WHERE ID_RESENA = p_id_resena;

    GET DIAGNOSTICS v_filas = ROW_COUNT;

    IF v_filas = 0 THEN
        RETURN QUERY SELECT FALSE, 'Reseña no encontrada.'::TEXT;
        RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'Reseña actualizada.'::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_editar_resena - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error: reseña no válida.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_editar_resena - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La reseña no cumple los requisitos de puntuación o longitud.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_editar_resena - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La reseña está siendo modificada, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_editar_resena: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;