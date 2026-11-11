CREATE OR REPLACE FUNCTION fn_listar_configuracion_seguridad()
RETURNS JSONB AS
$$
    SELECT COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'control', CONTROL,
                'max_intentos', MAX_INTENTOS,
                'ventana_minutos', VENTANA_MINUTOS,
                'duracion_bloqueo_minutos', DURACION_BLOQUEO_MINUTOS,
                'contar_exitosos', CONTAR_EXITOSOS,
                'limite_mensual', LIMITE_MENSUAL,
                'actualizado_por', ACTUALIZADO_POR,
                'fecha_actualizacion', FECHA_ACTUALIZACION
            )
            ORDER BY CONTROL
        ),
        '[]'::JSONB
    )
    FROM CONFIGURACION_SEGURIDAD;
$$
LANGUAGE sql;
