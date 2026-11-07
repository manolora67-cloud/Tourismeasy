-- El tipo de retorno ahora incluye métricas adicionales; PostgreSQL exige recrear la función.
DROP FUNCTION IF EXISTS fn_estadisticas_empresa(VARCHAR);

CREATE OR REPLACE FUNCTION fn_estadisticas_empresa(p_id EMPRESAS.ID_EMPRESA%TYPE)
RETURNS TABLE (
    tipo EMPRESAS.TIPO_SERVICIO%TYPE,
    servicios_publicados BIGINT,
    servicios_label TEXT,
    accesibilidad JSONB,
    servicios_totales BIGINT,
    clics_whatsapp_30_dias BIGINT
) AS
$$
DECLARE
    v_tipo EMPRESAS.TIPO_SERVICIO%TYPE;
BEGIN
    SELECT e.TIPO_SERVICIO INTO v_tipo FROM EMPRESAS e WHERE e.ID_EMPRESA = p_id;
    IF NOT FOUND THEN RETURN; END IF;

    IF v_tipo = 'TRANSPORTE' THEN
        RETURN QUERY SELECT v_tipo,
            (SELECT COUNT(*) FROM TRANSPORTE t WHERE t.ID_EMPRESA = p_id AND t.DISPONIBILIDAD),
            'Transporte publicado'::TEXT,
            '[]'::JSONB,
            (SELECT COUNT(*) FROM TRANSPORTE t WHERE t.ID_EMPRESA = p_id),
            (SELECT COUNT(*) FROM LOGS_CLICS_WEB_EXTERNOS l
             WHERE l.ID_EMPRESA = p_id
               AND l.FECHA_HORA >= CURRENT_TIMESTAMP - INTERVAL '30 days');
    ELSIF v_tipo = 'HOSPEDAJE' THEN
        RETURN QUERY SELECT v_tipo,
            (SELECT COUNT(*) FROM HOSPEDAJE h WHERE h.ID_EMPRESA = p_id AND h.DISPONIBILIDAD),
            'Hospedaje publicado'::TEXT,
            COALESCE((SELECT JSONB_AGG(x.valor ORDER BY x.valor) FROM (
                SELECT DISTINCT BTRIM(h.ACCESIBILIDAD) AS valor FROM HOSPEDAJE h
                WHERE h.ID_EMPRESA = p_id AND NULLIF(BTRIM(h.ACCESIBILIDAD), '') IS NOT NULL
            ) x), '[]'::JSONB),
            (SELECT COUNT(*) FROM HOSPEDAJE h WHERE h.ID_EMPRESA = p_id),
            (SELECT COUNT(*) FROM LOGS_CLICS_WEB_EXTERNOS l
             WHERE l.ID_EMPRESA = p_id
               AND l.FECHA_HORA >= CURRENT_TIMESTAMP - INTERVAL '30 days');
    ELSIF v_tipo = 'PLANES' THEN
        RETURN QUERY SELECT v_tipo,
            (SELECT COUNT(*) FROM PLANES_TURISTICOS p WHERE p.ID_EMPRESA = p_id AND p.DISPONIBILIDAD),
            'Plan publicado'::TEXT,
            COALESCE((SELECT JSONB_AGG(x.valor ORDER BY x.valor) FROM (
                SELECT DISTINCT BTRIM(p.ACCESIBILIDAD) AS valor FROM PLANES_TURISTICOS p
                WHERE p.ID_EMPRESA = p_id AND NULLIF(BTRIM(p.ACCESIBILIDAD), '') IS NOT NULL
            ) x), '[]'::JSONB),
            (SELECT COUNT(*) FROM PLANES_TURISTICOS p WHERE p.ID_EMPRESA = p_id),
            (SELECT COUNT(*) FROM LOGS_CLICS_WEB_EXTERNOS l
             WHERE l.ID_EMPRESA = p_id
               AND l.FECHA_HORA >= CURRENT_TIMESTAMP - INTERVAL '30 days');
    ELSE
        RETURN QUERY SELECT v_tipo, 0::BIGINT, 'Servicio no reconocido'::TEXT,
            '[]'::JSONB, 0::BIGINT, 0::BIGINT;
    END IF;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN RAISE NOTICE 'fn_estadisticas_empresa - FK inválida: %', SQLERRM; RETURN;
    WHEN CHECK_VIOLATION THEN RAISE NOTICE 'fn_estadisticas_empresa - Check violado: %', SQLERRM; RETURN;
    WHEN LOCK_NOT_AVAILABLE THEN RAISE NOTICE 'fn_estadisticas_empresa - Tabla bloqueada: %', SQLERRM; RETURN;
    WHEN OTHERS THEN RAISE NOTICE 'fn_estadisticas_empresa: %', SQLERRM; RETURN;
END;
$$ LANGUAGE plpgsql;
