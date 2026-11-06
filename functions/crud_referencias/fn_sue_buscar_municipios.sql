CREATE OR REPLACE FUNCTION fn_sue_buscar_municipios(p_id_ciudad CIUDADES.ID_CIUDAD%TYPE)
RETURNS JSONB
LANGUAGE sql
AS $$
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
        'municipio', ciudad.NOM_CIUDAD,
        'departamento', departamento.NOM_DPTO
    ) ORDER BY ciudad.NOM_CIUDAD, ciudad.ID_CIUDAD), '[]'::JSONB)
    FROM CIUDADES ciudad
    JOIN DEPARTAMENTOS departamento ON departamento.ID_DPTO = ciudad.ID_DPTO
    WHERE (p_id_ciudad IS NULL OR ciudad.ID_CIUDAD = p_id_ciudad);
$$;
