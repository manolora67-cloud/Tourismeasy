CREATE OR REPLACE FUNCTION fn_listar_destinos_mapa()
RETURNS TABLE (
    key     VARCHAR(50),
    img     TEXT,
    alt     VARCHAR(200),
    titulo  VARCHAR(150),
    mapa    JSONB
) AS
$$
BEGIN
    RETURN QUERY
    SELECT c.CLAVE, c.IMAGEN, c.TEXTO_ALT, c.TITULO, c.ARTICULO->'mapa'
    FROM CONTENIDO_PORTADA c
    WHERE c.ARTICULO #> '{mapa,destacado}' = 'true'::JSONB
    ORDER BY c.TITULO;
END;
$$
LANGUAGE plpgsql STABLE;
