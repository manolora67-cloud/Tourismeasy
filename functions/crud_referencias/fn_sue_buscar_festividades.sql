CREATE OR REPLACE FUNCTION fn_sue_buscar_festividades(
    p_id_ciudad CIUDADES.ID_CIUDAD%TYPE,
    p_mes INTEGER,
    p_busqueda TEXT
)
RETURNS JSONB
LANGUAGE sql
AS $$
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
        'id', festividad.ID_FESTIVIDAD,
        'fecha', festividad.FECHA_CLAVE,
        'titulo', festividad.TITULO,
        'detalle', festividad.SUBTITULO,
        'descripcion', festividad.FRASE,
        'tipo', festividad.TIPO,
        'municipio', ciudad.NOM_CIUDAD
    ) ORDER BY SUBSTRING(festividad.FECHA_CLAVE FROM 1 FOR 2),
                     SUBSTRING(festividad.FECHA_CLAVE FROM 4 FOR 2),
                     festividad.ID_FESTIVIDAD), '[]'::JSONB)
    FROM FESTIVIDADES_SANTANDER festividad
    LEFT JOIN CIUDADES ciudad ON ciudad.ID_CIUDAD = festividad.ID_CIUDAD
    LEFT JOIN CIUDADES ciudad_filtro ON ciudad_filtro.ID_CIUDAD = p_id_ciudad
    WHERE (p_id_ciudad IS NULL OR festividad.ID_CIUDAD = p_id_ciudad)
      AND (p_mes IS NULL OR SUBSTRING(festividad.FECHA_CLAVE FROM 1 FOR 2)::INTEGER = p_mes)
      AND (
          NULLIF(BTRIM(p_busqueda), '') IS NULL
          OR NULLIF(BTRIM(REPLACE(
              TRANSLATE(LOWER(BTRIM(p_busqueda)), 'áéíóúüñ', 'aeiouun'),
              TRANSLATE(LOWER(COALESCE(ciudad_filtro.NOM_CIUDAD, '')), 'áéíóúüñ', 'aeiouun'),
              ''
          )), '') IS NULL
          OR STRPOS(
              TRANSLATE(
                  LOWER(CONCAT_WS(' ', festividad.ID_FESTIVIDAD, festividad.FECHA_CLAVE, festividad.TITULO, festividad.SUBTITULO, festividad.FRASE)),
                  'áéíóúüñ',
                  'aeiouun'
              ),
              NULLIF(BTRIM(REPLACE(
                  TRANSLATE(LOWER(BTRIM(p_busqueda)), 'áéíóúüñ', 'aeiouun'),
                  TRANSLATE(LOWER(COALESCE(ciudad_filtro.NOM_CIUDAD, '')), 'áéíóúüñ', 'aeiouun'),
                  ''
              )), '')
          ) > 0
      );
$$;
