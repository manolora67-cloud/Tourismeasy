CREATE OR REPLACE FUNCTION fn_estadisticas_clicks(
    p_id_empresa EMPRESAS.ID_EMPRESA%TYPE DEFAULT NULL
)
RETURNS JSONB
AS $$
DECLARE
    v_resumen JSONB;
    v_por_categoria JSONB;
    v_por_empresa JSONB;
    v_recientes JSONB;
BEGIN
    SELECT JSONB_BUILD_OBJECT(
        'total', COUNT(*),
        'ultimos_30_dias', COUNT(*) FILTER (
            WHERE L.FECHA_HORA >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        )
    )
    INTO v_resumen
    FROM LOGS_CLICS_WEB_EXTERNOS L
    WHERE p_id_empresa IS NULL OR L.ID_EMPRESA = p_id_empresa;

    SELECT COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'categoria', datos.categoria,
                'cantidad', datos.cantidad
            )
            ORDER BY datos.cantidad DESC, datos.categoria
        ),
        '[]'::JSONB
    )
    INTO v_por_categoria
    FROM (
        SELECT L.TIPO_CATEGORIA AS categoria, COUNT(*) AS cantidad
        FROM LOGS_CLICS_WEB_EXTERNOS L
        WHERE p_id_empresa IS NULL OR L.ID_EMPRESA = p_id_empresa
        GROUP BY L.TIPO_CATEGORIA
    ) datos;

    IF p_id_empresa IS NULL THEN
        SELECT COALESCE(
            JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'empresa', datos.empresa,
                    'cantidad', datos.cantidad
                )
                ORDER BY datos.cantidad DESC, datos.empresa
            ),
            '[]'::JSONB
        )
        INTO v_por_empresa
        FROM (
            SELECT E.NOM_EMPRESA AS empresa, COUNT(*) AS cantidad
            FROM LOGS_CLICS_WEB_EXTERNOS L
            JOIN EMPRESAS E ON E.ID_EMPRESA = L.ID_EMPRESA
            GROUP BY E.ID_EMPRESA, E.NOM_EMPRESA
        ) datos;
    ELSE
        v_por_empresa := '[]'::JSONB;
    END IF;

    SELECT COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'fecha_hora', datos.fecha_hora,
                'empresa', datos.empresa,
                'categoria', datos.categoria,
                'id_producto', datos.id_producto,
                'ciudad', datos.ciudad,
                'dispositivo', datos.dispositivo
            )
            ORDER BY datos.fecha_hora DESC, datos.id_click DESC
        ),
        '[]'::JSONB
    )
    INTO v_recientes
    FROM (
        SELECT
            L.ID_CLICK AS id_click,
            L.FECHA_HORA AS fecha_hora,
            COALESCE(E.NOM_EMPRESA, 'Contacto artesanal') AS empresa,
            L.TIPO_CATEGORIA AS categoria,
            L.ID_PRODUCTO AS id_producto,
            C.NOM_CIUDAD AS ciudad,
            L.USER_AGENT AS dispositivo
        FROM LOGS_CLICS_WEB_EXTERNOS L
        LEFT JOIN EMPRESAS E ON E.ID_EMPRESA = L.ID_EMPRESA
        LEFT JOIN CIUDADES C ON C.ID_CIUDAD = L.ID_CIUDAD
        WHERE p_id_empresa IS NULL OR L.ID_EMPRESA = p_id_empresa
        ORDER BY L.FECHA_HORA DESC, L.ID_CLICK DESC
        LIMIT 15
    ) datos;

    RETURN JSONB_BUILD_OBJECT(
        'resumen', v_resumen,
        'por_categoria', v_por_categoria,
        'por_empresa', v_por_empresa,
        'recientes', v_recientes
    );
END;
$$ LANGUAGE plpgsql STABLE;
