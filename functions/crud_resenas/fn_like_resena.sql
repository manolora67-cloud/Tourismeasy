CREATE OR REPLACE FUNCTION fn_like_resena(
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

    IF p_visitor_id IS NULL OR LENGTH(p_visitor_id) < 10 THEN
        RETURN QUERY SELECT FALSE, 'No se pudo identificar quién da el like.'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;

    INSERT INTO LIKES_RESENAS (ID_RESENA, VISITOR_ID)
    VALUES (p_id_resena, p_visitor_id)
    ON CONFLICT DO NOTHING;

    RETURN QUERY
    SELECT TRUE, 'OK'::TEXT, COUNT(*)::INTEGER
    FROM LIKES_RESENAS WHERE ID_RESENA = p_id_resena;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_like_resena - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La reseña ya no existe.'::TEXT, NULL::INTEGER;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_like_resena - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Identificador de visitante inválido.'::TEXT, NULL::INTEGER;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_like_resena - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La reseña está siendo modificada, intenta de nuevo.'::TEXT, NULL::INTEGER;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_like_resena: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error: ' || SQLERRM)::TEXT, NULL::INTEGER;
END;
$$
LANGUAGE plpgsql;
