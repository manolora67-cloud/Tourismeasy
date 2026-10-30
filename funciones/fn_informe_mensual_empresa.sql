CREATE OR REPLACE FUNCTION fn_informe_mensual_empresa(
    p_id_empresa EMPRESAS.ID_EMPRESA%TYPE,
    p_mes DATE
)
RETURNS JSONB
AS $$
DECLARE
    v_inicio DATE := DATE_TRUNC('month', p_mes)::DATE;
    v_inicio_anterior DATE := (DATE_TRUNC('month', p_mes) - INTERVAL '1 month')::DATE;
    v_fin DATE := (DATE_TRUNC('month', p_mes) + INTERVAL '1 month')::DATE;
    v_fin_anterior DATE := DATE_TRUNC('month', p_mes)::DATE;
    v_empresa EMPRESAS.NOM_EMPRESA%TYPE;
    v_clics_mes BIGINT;
    v_clics_mes_anterior BIGINT;
    v_publicaciones JSONB;
BEGIN
    IF p_id_empresa IS NULL OR NOT EXISTS (
        SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = p_id_empresa
    ) THEN
        RAISE EXCEPTION 'No se encontró la empresa.'
            USING ERRCODE = '22023';
    END IF;

    IF v_inicio >= DATE_TRUNC('month', CURRENT_DATE)::DATE THEN
        RAISE EXCEPTION 'Solo se pueden generar boletines de meses completos.'
            USING ERRCODE = '22023';
    END IF;

    SELECT NOM_EMPRESA
    INTO v_empresa
    FROM EMPRESAS
    WHERE ID_EMPRESA = p_id_empresa;

    SELECT COUNT(*)
    INTO v_clics_mes
    FROM LOGS_CLICS_WEB_EXTERNOS
    WHERE ID_EMPRESA = p_id_empresa
      AND FECHA_HORA >= v_inicio
      AND FECHA_HORA < v_fin;

    SELECT COUNT(*)
    INTO v_clics_mes_anterior
    FROM LOGS_CLICS_WEB_EXTERNOS
    WHERE ID_EMPRESA = p_id_empresa
      AND FECHA_HORA >= v_inicio_anterior
      AND FECHA_HORA < v_fin_anterior;

    SELECT COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'publicacion', ranking.publicacion,
                'categoria', ranking.categoria,
                'clics_mes', ranking.clics_mes,
                'clics_totales', ranking.clics_totales
            )
            ORDER BY ranking.clics_mes DESC, ranking.publicacion
        ),
        '[]'::JSONB
    )
    INTO v_publicaciones
    FROM (
        SELECT
            COALESCE(
                CASE L.TIPO_CATEGORIA
                    WHEN 'Transporte' THEN NULLIF(BTRIM(CONCAT_WS(' → ', T.ORIGEN, T.DESTINO)), '')
                    WHEN 'Hospedaje' THEN NULLIF(BTRIM(H.NOM_HOSPEDAJE), '')
                    WHEN 'Plan' THEN NULLIF(BTRIM(P.NOM_PLAN_TURISTICO), '')
                END,
                'Publicación #' || L.ID_PRODUCTO
            ) AS publicacion,
            L.TIPO_CATEGORIA AS categoria,
            COUNT(*) FILTER (
                WHERE L.FECHA_HORA >= v_inicio
                  AND L.FECHA_HORA < v_fin
            ) AS clics_mes,
            COUNT(*) AS clics_totales
        FROM LOGS_CLICS_WEB_EXTERNOS L
        LEFT JOIN TRANSPORTE T
            ON L.TIPO_CATEGORIA = 'Transporte'
           AND T.ID_TRANSPORTE::VARCHAR = L.ID_PRODUCTO
           AND T.ID_EMPRESA = p_id_empresa
        LEFT JOIN HOSPEDAJE H
            ON L.TIPO_CATEGORIA = 'Hospedaje'
           AND H.ID_HOSPEDAJE::VARCHAR = L.ID_PRODUCTO
           AND H.ID_EMPRESA = p_id_empresa
        LEFT JOIN PLANES_TURISTICOS P
            ON L.TIPO_CATEGORIA = 'Plan'
           AND P.ID_PLAN_TURISTICO::VARCHAR = L.ID_PRODUCTO
           AND P.ID_EMPRESA = p_id_empresa
        WHERE L.ID_EMPRESA = p_id_empresa
        GROUP BY L.TIPO_CATEGORIA, L.ID_PRODUCTO,
                 T.ORIGEN, T.DESTINO, H.NOM_HOSPEDAJE, P.NOM_PLAN_TURISTICO
        HAVING COUNT(*) FILTER (
            WHERE L.FECHA_HORA >= v_inicio
              AND L.FECHA_HORA < v_fin
        ) > 0
        ORDER BY clics_mes DESC, publicacion
        LIMIT 5
    ) ranking;

    RETURN JSONB_BUILD_OBJECT(
        'empresa', v_empresa,
        'mes', TO_CHAR(v_inicio, 'YYYY-MM'),
        'mes_anterior', TO_CHAR(v_inicio_anterior, 'YYYY-MM'),
        'clics_whatsapp', JSONB_BUILD_OBJECT(
            'mes', v_clics_mes,
            'mes_anterior', v_clics_mes_anterior,
            'variacion_porcentual', CASE
                WHEN v_clics_mes_anterior = 0 THEN NULL
                ELSE ROUND(
                    ((v_clics_mes - v_clics_mes_anterior)::NUMERIC * 100)
                    / v_clics_mes_anterior,
                    1
                )
            END
        ),
        'publicaciones_mas_contactadas', v_publicaciones
    );
END;
$$ LANGUAGE plpgsql STABLE;
