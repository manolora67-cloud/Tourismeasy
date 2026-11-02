CREATE OR REPLACE FUNCTION fn_listar_resenas(
    p_visitor_actual LIKES_RESENAS.VISITOR_ID%TYPE DEFAULT NULL
)
RETURNS TABLE (
    id         RESENAS_PLATAFORMA.ID_RESENA%TYPE,
    nombre     TEXT,
    rating     RESENAS_PLATAFORMA.PUNTUACION%TYPE,
    texto      RESENAS_PLATAFORMA.COMENTARIO%TYPE,
    fecha      RESENAS_PLATAFORMA.FECHA_CREACION%TYPE,
    likes      BIGINT,
    ya_di_like INTEGER
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        r.ID_RESENA,
        r.NOMBRE_ANONIMO::TEXT,
        r.PUNTUACION,
        r.COMENTARIO,
        r.FECHA_CREACION,
        COUNT(l.ID_LIKE),
        MAX(CASE
            WHEN p_visitor_actual IS NOT NULL AND l.VISITOR_ID = p_visitor_actual THEN 1
            ELSE 0
        END)
    FROM RESENAS_PLATAFORMA r
    LEFT JOIN LIKES_RESENAS l ON l.ID_RESENA = r.ID_RESENA
    GROUP BY r.ID_RESENA, r.NOMBRE_ANONIMO,
             r.PUNTUACION, r.COMENTARIO, r.FECHA_CREACION
    ORDER BY r.FECHA_CREACION DESC
    LIMIT 50;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_listar_resenas - FK inválida: %', SQLERRM;
        RETURN;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_listar_resenas - Check violado: %', SQLERRM;
        RETURN;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_listar_resenas - Tabla bloqueada: %', SQLERRM;
        RETURN;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_listar_resenas: %', SQLERRM;
        RETURN;
END;
$$
LANGUAGE plpgsql;
