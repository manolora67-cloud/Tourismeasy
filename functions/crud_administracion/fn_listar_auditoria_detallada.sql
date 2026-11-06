CREATE OR REPLACE FUNCTION fn_listar_auditoria_detallada()
RETURNS TABLE (
    fecha          TIMESTAMP,
    usuario        TEXT,
    accion         TEXT,
    modulo         TEXT,
    detalle        TEXT,
    nivel          TEXT,
    reg_anterior   JSONB,
    reg_nuevo      JSONB
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        a.FECHA_HORA::timestamp,
        COALESCE(u.EMAIL_LOGIN, ue.EMAIL_LOGIN, uec.EMAIL_LOGIN, 'Sistema / desconocido')::text,
        a.NOM_OPERACION::text,
        a.TABLA_AFECTADA::text,
        a.DETALLE::text,
        a.NIVEL::text,
        a.REG_ANTERIOR,
        a.REG_NUEVO
    FROM AUDITORIA a
    LEFT JOIN USUARIOS u ON u.ID_PERSONA::text = a.ID_USUARIO
    LEFT JOIN USUARIOS_EMPRESA ue ON ue.ID_EMPRESA::text = a.ID_EMPRESA
    LEFT JOIN USUARIOS_ECOMMERCE uec ON uec.ID_PERSONA_ECOMMERCE::text = a.ID_PERSONA_ECOMMERCE
    ORDER BY a.FECHA_HORA DESC
    LIMIT 100;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_listar_auditoria_detallada - FK inválida: %', SQLERRM;
        RETURN;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_listar_auditoria_detallada - Check violado: %', SQLERRM;
        RETURN;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_listar_auditoria_detallada - Tabla bloqueada: %', SQLERRM;
        RETURN;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_listar_auditoria_detallada - Error inesperado: %', SQLERRM;
        RETURN;
END;
$$
LANGUAGE plpgsql;
