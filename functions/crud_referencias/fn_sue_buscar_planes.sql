CREATE OR REPLACE FUNCTION fn_sue_buscar_planes(p_id_ciudad CIUDADES.ID_CIUDAD%TYPE)
RETURNS JSONB
LANGUAGE sql
AS $$
    SELECT fn_buscar_planes_publicos(p_id_ciudad, NULL, NULL);
$$;
