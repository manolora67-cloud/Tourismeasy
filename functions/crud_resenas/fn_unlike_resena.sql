CREATE OR REPLACE FUNCTION fn_unlike_resena(
    p_id_resena  RESENAS_PLATAFORMA.ID_RESENA%TYPE,
    p_visitor_id LIKES_RESENAS.VISITOR_ID%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT,
    likes   INTEGER
) AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM RESENAS_PLATAFORMA WHERE ID_RESENA = p_id_resena) THEN
        RETURN QUERY SELECT FALSE, 'Reseña no encontrada.'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;

    DELETE FROM LIKES_RESENAS
    WHERE ID_RESENA = p_id_resena AND VISITOR_ID = p_visitor_id;

    RETURN QUERY
    SELECT TRUE, 'OK'::TEXT, COUNT(*)::INTEGER
    FROM LIKES_RESENAS WHERE ID_RESENA = p_id_resena;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_unlike_resena - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error: reseña no válida.'::TEXT, NULL::INTEGER;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_unlike_resena - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error de integridad de datos.'::TEXT, NULL::INTEGER;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_unlike_resena - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La reseña está siendo modificada, intenta de nuevo.'::TEXT, NULL::INTEGER;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_unlike_resena: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error: ' || SQLERRM)::TEXT, NULL::INTEGER;
END;
$$
LANGUAGE plpgsql;