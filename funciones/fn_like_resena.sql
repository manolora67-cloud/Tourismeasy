CREATE OR REPLACE FUNCTION fn_like_resena(
    p_id_resena  RESENAS_PLATAFORMA.ID_RESENA%TYPE,
    p_id_persona RESENAS_PLATAFORMA.ID_PERSONA%TYPE DEFAULT NULL,
    p_visitor_id LIKES_RESENAS.VISITOR_ID%TYPE DEFAULT NULL
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT,
    likes   INTEGER
) AS
$$
DECLARE
    v_autor RESENAS_PLATAFORMA.ID_PERSONA%TYPE;
BEGIN
    SELECT ID_PERSONA INTO v_autor FROM RESENAS_PLATAFORMA WHERE ID_RESENA = p_id_resena;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Reseña no encontrada.'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;

    IF p_id_persona IS NULL AND p_visitor_id IS NULL THEN
        RETURN QUERY SELECT FALSE, 'No se pudo identificar quién da el like.'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;

    -- Solo se puede evitar el autolike cuando quien da like tiene cuenta
    -- (una reseña anónima no tiene forma de probar que el visitante es el mismo autor)
    IF p_id_persona IS NOT NULL AND v_autor = p_id_persona THEN
        RETURN QUERY SELECT FALSE, 'No puedes dar like a tu propia reseña.'::TEXT, NULL::INTEGER;
        RETURN;
    END IF;

    INSERT INTO LIKES_RESENAS (ID_RESENA, ID_PERSONA, VISITOR_ID)
    VALUES (p_id_resena, p_id_persona, CASE WHEN p_id_persona IS NULL THEN p_visitor_id END)
    ON CONFLICT DO NOTHING;

    RETURN QUERY
    SELECT TRUE, 'OK'::TEXT, COUNT(*)::INTEGER
    FROM LIKES_RESENAS WHERE ID_RESENA = p_id_resena;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_like_resena - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La reseña o el usuario ya no existen.'::TEXT, NULL::INTEGER;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_like_resena - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Usuario o visitante inválido.'::TEXT, NULL::INTEGER;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_like_resena - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La reseña está siendo modificada, intenta de nuevo.'::TEXT, NULL::INTEGER;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_like_resena: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error: ' || SQLERRM)::TEXT, NULL::INTEGER;
END;
$$
LANGUAGE plpgsql;
