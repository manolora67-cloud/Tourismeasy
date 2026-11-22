CREATE OR REPLACE FUNCTION fn_obtener_meta_edicion_perfil_empresa(
    p_id USUARIOS_EMPRESA.ID_EMPRESA%TYPE
)
RETURNS TABLE (
    ultima_edicion_perfil USUARIOS_EMPRESA.FECHA_ULTIMA_EDICION_PERFIL%TYPE,
    puede_editar_perfil BOOLEAN,
    proxima_edicion TIMESTAMP
)
LANGUAGE sql
AS $$
    SELECT
        u.FECHA_ULTIMA_EDICION_PERFIL,
        (
            CASE
                WHEN e.MES = DATE_TRUNC('month', CURRENT_TIMESTAMP::TIMESTAMP)::DATE
                THEN COALESCE(e.CANTIDAD, 0)::INTEGER
                ELSE 0
            END
        ) < c.LIMITE_MENSUAL,
        CASE
            WHEN (
                CASE
                    WHEN e.MES = DATE_TRUNC('month', CURRENT_TIMESTAMP::TIMESTAMP)::DATE
                    THEN COALESCE(e.CANTIDAD, 0)::INTEGER
                    ELSE 0
                END
            ) >= c.LIMITE_MENSUAL
            THEN (DATE_TRUNC('month', CURRENT_TIMESTAMP::TIMESTAMP) + INTERVAL '1 month')::TIMESTAMP
            ELSE NULL::TIMESTAMP
        END
    FROM USUARIOS_EMPRESA u
    CROSS JOIN CONFIGURACION_LIMITE_PERFIL_EMPRESA c
    LEFT JOIN EDICIONES_PERFIL_EMPRESA e ON e.ID_EMPRESA = u.ID_EMPRESA
    WHERE u.ID_EMPRESA = p_id
      AND c.ID_CONFIG = 1;
$$;
