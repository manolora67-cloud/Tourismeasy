CREATE OR REPLACE FUNCTION fn_informe_mensual_admin(
    p_mes DATE
)
RETURNS JSONB AS
$$
DECLARE
    v_inicio DATE := DATE_TRUNC('month', p_mes)::DATE;
    v_inicio_anterior DATE := (DATE_TRUNC('month', p_mes) - INTERVAL '1 month')::DATE;
    v_fin DATE := (DATE_TRUNC('month', p_mes) + INTERVAL '1 month')::DATE;
    v_fin_anterior DATE := DATE_TRUNC('month', p_mes)::DATE;
    v_empresas INTEGER;
    v_empresas_anterior INTEGER;
    v_clicks BIGINT;
    v_clicks_anterior BIGINT;
    v_top_empresas JSONB;
    v_top_empresas_anterior JSONB;
BEGIN
    SELECT COUNT(*)::INTEGER
    INTO v_empresas
    FROM USUARIOS_EMPRESA
    WHERE FECHA_REGISTRO >= v_inicio
      AND FECHA_REGISTRO < v_fin;

    SELECT COUNT(*)::INTEGER
    INTO v_empresas_anterior
    FROM USUARIOS_EMPRESA
    WHERE FECHA_REGISTRO >= v_inicio_anterior
      AND FECHA_REGISTRO < v_fin_anterior;

    SELECT COUNT(*)
    INTO v_clicks
    FROM LOGS_CLICS_WEB_EXTERNOS
    WHERE FECHA_HORA >= v_inicio
      AND FECHA_HORA < v_fin;

    SELECT COUNT(*)
    INTO v_clicks_anterior
    FROM LOGS_CLICS_WEB_EXTERNOS
    WHERE FECHA_HORA >= v_inicio_anterior
      AND FECHA_HORA < v_fin_anterior;

    SELECT COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'empresa', ranking.empresa,
                'clics', ranking.clics
            )
            ORDER BY ranking.clics DESC, ranking.empresa
        ),
        '[]'::JSONB
    )
    INTO v_top_empresas
    FROM (
        SELECT E.NOM_EMPRESA AS empresa, COUNT(*) AS clics
        FROM LOGS_CLICS_WEB_EXTERNOS L
        JOIN EMPRESAS E ON E.ID_EMPRESA = L.ID_EMPRESA
        WHERE L.FECHA_HORA >= v_inicio
          AND L.FECHA_HORA < v_fin
        GROUP BY E.ID_EMPRESA, E.NOM_EMPRESA
        ORDER BY COUNT(*) DESC, E.NOM_EMPRESA
        LIMIT 5
    ) ranking;

    SELECT COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'empresa', ranking.empresa,
                'clics', ranking.clics
            )
            ORDER BY ranking.clics DESC, ranking.empresa
        ),
        '[]'::JSONB
    )
    INTO v_top_empresas_anterior
    FROM (
        SELECT E.NOM_EMPRESA AS empresa, COUNT(*) AS clics
        FROM LOGS_CLICS_WEB_EXTERNOS L
        JOIN EMPRESAS E ON E.ID_EMPRESA = L.ID_EMPRESA
        WHERE L.FECHA_HORA >= v_inicio_anterior
          AND L.FECHA_HORA < v_fin_anterior
        GROUP BY E.ID_EMPRESA, E.NOM_EMPRESA
        ORDER BY COUNT(*) DESC, E.NOM_EMPRESA
        LIMIT 5
    ) ranking;

    RETURN JSONB_BUILD_OBJECT(
        'mes', TO_CHAR(v_inicio, 'YYYY-MM'),
        'mes_anterior', TO_CHAR(v_inicio_anterior, 'YYYY-MM'),
        'empresas_nuevas', JSONB_BUILD_OBJECT(
            'mes', v_empresas,
            'mes_anterior', v_empresas_anterior,
            'variacion_porcentual', CASE
                WHEN v_empresas_anterior = 0 THEN NULL
                ELSE ROUND(((v_empresas - v_empresas_anterior)::NUMERIC * 100) / v_empresas_anterior, 1)
            END
        ),
        'clics_whatsapp', JSONB_BUILD_OBJECT(
            'mes', v_clicks,
            'mes_anterior', v_clicks_anterior,
            'variacion_porcentual', CASE
                WHEN v_clicks_anterior = 0 THEN NULL
                ELSE ROUND(((v_clicks - v_clicks_anterior)::NUMERIC * 100) / v_clicks_anterior, 1)
            END,
            'empresas_mas_contactadas', v_top_empresas,
            'empresas_mas_contactadas_mes_anterior', v_top_empresas_anterior
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_informe_mensual_admin: %', SQLERRM;
        RAISE;
END;
$$
LANGUAGE plpgsql STABLE;
