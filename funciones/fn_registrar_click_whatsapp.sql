CREATE OR REPLACE FUNCTION fn_registrar_click_whatsapp(
    p_categoria VARCHAR(50),
    p_id_producto VARCHAR(10),
    p_user_agent TEXT
)
RETURNS BIGINT
AS $$
DECLARE
    v_id_empresa EMPRESAS.ID_EMPRESA%TYPE;
    v_id_click LOGS_CLICS_WEB_EXTERNOS.ID_CLICK%TYPE;
BEGIN
    IF p_categoria = 'Hospedaje' THEN
        SELECT H.ID_EMPRESA
        INTO v_id_empresa
        FROM HOSPEDAJE H
        WHERE H.ID_HOSPEDAJE::VARCHAR = p_id_producto
          AND H.DISPONIBILIDAD = TRUE;
    ELSIF p_categoria = 'Plan' THEN
        SELECT P.ID_EMPRESA
        INTO v_id_empresa
        FROM PLANES_TURISTICOS P
        WHERE P.ID_PLAN_TURISTICO::VARCHAR = p_id_producto
          AND P.DISPONIBILIDAD = TRUE;
    ELSIF p_categoria = 'Transporte' THEN
        SELECT T.ID_EMPRESA
        INTO v_id_empresa
        FROM TRANSPORTE T
        WHERE T.ID_TRANSPORTE::VARCHAR = p_id_producto
          AND T.DISPONIBILIDAD = TRUE;
    ELSIF p_categoria = 'Artesanía' THEN
        SELECT NULL::VARCHAR(10)
        INTO v_id_empresa
        FROM PRODUCTOS_ARTESANALES P
        WHERE P.ID_PRODUCTO::VARCHAR = p_id_producto;
    ELSE
        RAISE EXCEPTION 'Categoría de producto no válida.'
            USING ERRCODE = '22023';
    END IF;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    INSERT INTO LOGS_CLICS_WEB_EXTERNOS
        (FECHA_HORA, ID_EMPRESA, ID_PRODUCTO, TIPO_CATEGORIA, USER_AGENT)
    VALUES
        (
            CURRENT_TIMESTAMP,
            v_id_empresa,
            p_id_producto,
            p_categoria,
            LEFT(COALESCE(NULLIF(BTRIM(p_user_agent), ''), 'Desconocido'), 255)
        )
    RETURNING ID_CLICK INTO v_id_click;

    RETURN v_id_click;
END;
$$ LANGUAGE plpgsql;
