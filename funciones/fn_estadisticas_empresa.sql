CREATE OR REPLACE FUNCTION fn_estadisticas_empresa(p_id EMPRESAS.ID_EMPRESA%TYPE)
RETURNS TABLE (
    tipo EMPRESAS.TIPO_SERVICIO%TYPE,
    servicios_publicados BIGINT,
    servicios_label TEXT,
    accesibilidad JSONB
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
            'Transporte publicado'::TEXT, '[]'::JSONB;
    ELSIF v_tipo = 'HOSPEDAJE' THEN
        RETURN QUERY SELECT v_tipo,
            (SELECT COUNT(*) FROM HOSPEDAJE h WHERE h.ID_EMPRESA = p_id AND h.DISPONIBILIDAD),
            'Hospedaje publicado'::TEXT,
            COALESCE((SELECT JSONB_AGG(x.valor ORDER BY x.valor) FROM (
                SELECT DISTINCT BTRIM(h.ACCESIBILIDAD) AS valor FROM HOSPEDAJE h
                WHERE h.ID_EMPRESA = p_id AND NULLIF(BTRIM(h.ACCESIBILIDAD), '') IS NOT NULL
            ) x), '[]'::JSONB);
    ELSIF v_tipo = 'PLANES' THEN
        RETURN QUERY SELECT v_tipo,
            (SELECT COUNT(*) FROM PLANES_TURISTICOS p WHERE p.ID_EMPRESA = p_id AND p.DISPONIBILIDAD),
            'Plan publicado'::TEXT,
            COALESCE((SELECT JSONB_AGG(x.valor ORDER BY x.valor) FROM (
                SELECT DISTINCT BTRIM(p.ACCESIBILIDAD) AS valor FROM PLANES_TURISTICOS p
                WHERE p.ID_EMPRESA = p_id AND NULLIF(BTRIM(p.ACCESIBILIDAD), '') IS NOT NULL
            ) x), '[]'::JSONB);
    ELSE
        RETURN QUERY SELECT v_tipo, 0::BIGINT, 'Servicio no reconocido'::TEXT, '[]'::JSONB;
    END IF;
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN RAISE NOTICE 'fn_estadisticas_empresa - FK inválida: %', SQLERRM; RETURN;
    WHEN CHECK_VIOLATION THEN RAISE NOTICE 'fn_estadisticas_empresa - Check violado: %', SQLERRM; RETURN;
    WHEN LOCK_NOT_AVAILABLE THEN RAISE NOTICE 'fn_estadisticas_empresa - Tabla bloqueada: %', SQLERRM; RETURN;
    WHEN OTHERS THEN RAISE NOTICE 'fn_estadisticas_empresa: %', SQLERRM; RETURN;
END;
$$ LANGUAGE plpgsql;
