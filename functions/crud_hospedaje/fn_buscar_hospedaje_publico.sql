CREATE OR REPLACE FUNCTION fn_buscar_hospedaje_publico(
    p_id_ciudad      HOSPEDAJE.ID_CIUDAD%TYPE DEFAULT NULL,
    p_accesibilidad  HOSPEDAJE.ACCESIBILIDAD%TYPE DEFAULT NULL,
    p_capacidad      INTEGER DEFAULT NULL
)
RETURNS JSONB AS
$$
DECLARE
    v_hospedajes JSONB;
BEGIN
    SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
        'id', H.ID_HOSPEDAJE,
        'nombre', H.NOM_HOSPEDAJE,
        'tipo', H.TIPO_HOSPEDAJE,
        'id_ciudad', H.ID_CIUDAD,
        'ciudad', C.NOM_CIUDAD,
        'descripcion', H.DESCRIPCION,
        'precio_noche', H.PRECIO_NOCHE,
        'accesibilidad', H.ACCESIBILIDAD,
        'capacidad_max', H.CAPACIDAD_MAX,
        'disponible', H.DISPONIBILIDAD,
        'img_url', H.IMG_URL,
        'empresa', E.NOM_EMPRESA,
        'id_empresa', E.ID_EMPRESA,
        'telefono', E.NUM_CONTACTO_EMPRESA,
        'servicios', COALESCE(S.SERVICIOS, '[]'::JSONB),
        'servicios_txt', COALESCE(S.SERVICIOS_TXT, '')
    ) ORDER BY H.PRECIO_NOCHE ASC), '[]'::JSONB)
    INTO v_hospedajes
    FROM HOSPEDAJE H
    JOIN EMPRESAS E ON E.ID_EMPRESA = H.ID_EMPRESA
    LEFT JOIN CIUDADES C ON C.ID_CIUDAD = H.ID_CIUDAD
    LEFT JOIN LATERAL (
        SELECT JSONB_AGG(
                   JSONB_BUILD_OBJECT('id', SH.ID_SERVICIO, 'nombre', SH.NOMBRE_SERVICIO)
                   ORDER BY SH.NOMBRE_SERVICIO
               ) AS SERVICIOS,
               STRING_AGG(SH.NOMBRE_SERVICIO, ', ' ORDER BY SH.NOMBRE_SERVICIO) AS SERVICIOS_TXT
        FROM HOSPEDAJE_SERVICIOS HS
        JOIN SERVICIOS_HOSPEDAJE SH ON SH.ID_SERVICIO = HS.ID_SERVICIO
        WHERE HS.ID_HOSPEDAJE = H.ID_HOSPEDAJE
    ) S ON TRUE
    WHERE H.DISPONIBILIDAD = TRUE
      AND E.TIPO_SERVICIO = 'HOSPEDAJE'
      AND EXISTS (
          SELECT 1
          FROM USUARIOS_EMPRESA UE
          WHERE UE.ID_EMPRESA = E.ID_EMPRESA
            AND UE.ESTADO = 'ACTIVO'
      )
      AND (p_id_ciudad IS NULL OR H.ID_CIUDAD = p_id_ciudad)
      AND (
          p_accesibilidad IS NULL
          OR LOWER(BTRIM(H.ACCESIBILIDAD)) = LOWER(BTRIM(p_accesibilidad))
      )
      AND (p_capacidad IS NULL OR H.CAPACIDAD_MAX >= p_capacidad);

    RETURN v_hospedajes;
END;
$$
LANGUAGE plpgsql;
