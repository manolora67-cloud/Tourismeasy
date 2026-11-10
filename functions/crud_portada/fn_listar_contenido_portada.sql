CREATE OR REPLACE FUNCTION fn_listar_contenido_portada(
    p_solo_publicados CONTENIDO_PORTADA.PUBLICADO%TYPE DEFAULT TRUE
)
RETURNS TABLE (
    key         CONTENIDO_PORTADA.CLAVE%TYPE,
    img         CONTENIDO_PORTADA.IMAGEN%TYPE,
    alt         CONTENIDO_PORTADA.TEXTO_ALT%TYPE,
    badge       CONTENIDO_PORTADA.INSIGNIA%TYPE,
    titulo      CONTENIDO_PORTADA.TITULO%TYPE,
    "desc"      CONTENIDO_PORTADA.DESCRIPCION%TYPE,
    orden       CONTENIDO_PORTADA.ORDEN%TYPE,
    publicado   CONTENIDO_PORTADA.PUBLICADO%TYPE,
    article     CONTENIDO_PORTADA.ARTICULO%TYPE
) AS
$$
BEGIN
    RETURN QUERY
    SELECT c.CLAVE, c.IMAGEN, c.TEXTO_ALT, c.INSIGNIA, c.TITULO,
            c.DESCRIPCION, c.ORDEN, c.PUBLICADO, c.ARTICULO
    FROM CONTENIDO_PORTADA c
    WHERE NOT p_solo_publicados OR c.PUBLICADO = TRUE
    ORDER BY c.ORDEN, c.TITULO;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_listar_contenido_portada - FK inválida: %', SQLERRM;
        RETURN;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_listar_contenido_portada - Check violado: %', SQLERRM;
        RETURN;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_listar_contenido_portada - Tabla bloqueada: %', SQLERRM;
        RETURN;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_listar_contenido_portada: %', SQLERRM;
        RETURN;
END;
$$
LANGUAGE plpgsql;
