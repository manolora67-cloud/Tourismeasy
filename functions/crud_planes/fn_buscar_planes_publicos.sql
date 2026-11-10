CREATE OR REPLACE FUNCTION fn_buscar_planes_publicos(
    p_id_ciudad      PLANES_TURISTICOS.ID_CIUDAD%TYPE DEFAULT NULL,
    p_id_tipo_plan   PLANES_TURISTICOS.ID_TIPO_PLAN%TYPE DEFAULT NULL,
    p_accesibilidad  PLANES_TURISTICOS.ACCESIBILIDAD%TYPE DEFAULT NULL
)
RETURNS JSONB AS
$$
DECLARE
    v_planes JSONB;
BEGIN
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
        'id', P.ID_PLAN_TURISTICO,
        'nombre', P.NOM_PLAN_TURISTICO,
        'duracion', P.DURACION,
        'descripcion', P.DESCRIPCION,
        'incluye', P.INCLUYE,
        'id_tipo_plan', P.ID_TIPO_PLAN,
        'tipo_plan', T.NOM_TIPO_PLAN,
        'precio', P.PRECIO_PLAN,
        'accesibilidad', P.ACCESIBILIDAD,
        'disponible', P.DISPONIBILIDAD,
        'id_ciudad', P.ID_CIUDAD,
        'ciudad', C.NOM_CIUDAD,
        'img_url', P.IMG_URL,
        'empresa', E.NOM_EMPRESA,
        'id_empresa', P.ID_EMPRESA,
        'telefono', E.NUM_CONTACTO_EMPRESA
    ) ORDER BY P.PRECIO_PLAN ASC), '[]'::JSONB)
    INTO v_planes
    FROM PLANES_TURISTICOS P
    JOIN EMPRESAS E ON E.ID_EMPRESA = P.ID_EMPRESA
    JOIN TIPOS_DE_PLAN_TURISTICO T ON T.ID_TIPO_PLAN = P.ID_TIPO_PLAN
    JOIN CIUDADES C ON C.ID_CIUDAD = P.ID_CIUDAD
    WHERE P.DISPONIBILIDAD = TRUE
      AND E.TIPO_SERVICIO = 'PLANES'
      AND EXISTS (
          SELECT 1
          FROM USUARIOS_EMPRESA UE
          WHERE UE.ID_EMPRESA = E.ID_EMPRESA
            AND UE.ESTADO = 'ACTIVO'
      )
      AND (p_id_ciudad IS NULL OR P.ID_CIUDAD = p_id_ciudad)
      AND (p_id_tipo_plan IS NULL OR P.ID_TIPO_PLAN = p_id_tipo_plan)
      AND (
          p_accesibilidad IS NULL
          OR LOWER(BTRIM(P.ACCESIBILIDAD)) = LOWER(BTRIM(p_accesibilidad))
      );

    RETURN v_planes;
END;
$$
LANGUAGE plpgsql;
