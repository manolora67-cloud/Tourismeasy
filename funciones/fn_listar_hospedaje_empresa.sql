CREATE OR REPLACE FUNCTION fn_listar_hospedaje_empresa(
    h_id_empresa HOSPEDAJE.ID_EMPRESA%TYPE
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
        'fecha_creacion', H.FECHA_CREACION,
        'servicios', COALESCE(S.SERVICIOS, '[]'::JSONB),
        'servicios_txt', COALESCE(S.SERVICIOS_TXT, '')
    ) ORDER BY H.FECHA_CREACION DESC), '[]'::JSONB)
    INTO v_hospedajes
    FROM HOSPEDAJE H
    LEFT JOIN CIUDADES C ON C.ID_CIUDAD = H.ID_CIUDAD
    LEFT JOIN LATERAL (
        SELECT JSONB_AGG(JSONB_BUILD_OBJECT('id', SH.ID_SERVICIO, 'nombre', SH.NOMBRE_SERVICIO) ORDER BY SH.NOMBRE_SERVICIO) AS SERVICIOS,
               STRING_AGG(SH.NOMBRE_SERVICIO, ', ' ORDER BY SH.NOMBRE_SERVICIO) AS SERVICIOS_TXT
        FROM HOSPEDAJE_SERVICIOS HS
        JOIN SERVICIOS_HOSPEDAJE SH ON SH.ID_SERVICIO = HS.ID_SERVICIO
        WHERE HS.ID_HOSPEDAJE = H.ID_HOSPEDAJE
    ) S ON TRUE
    WHERE H.ID_EMPRESA = h_id_empresa;
    RETURN v_hospedajes;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_listar_hospedaje_empresa - FK inválida: %', SQLERRM;
        RETURN NULL;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_listar_hospedaje_empresa - Check violado: %', SQLERRM;
        RETURN NULL;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_listar_hospedaje_empresa - Tabla bloqueada: %', SQLERRM;
        RETURN NULL;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_listar_hospedaje_empresa: %', SQLERRM;
        RETURN NULL;
END;
$$
LANGUAGE plpgsql;
