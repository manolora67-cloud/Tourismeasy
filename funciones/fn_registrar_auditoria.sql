CREATE OR REPLACE FUNCTION fn_registrar_auditoria(
    p_id_usuario            AUDITORIA.ID_USUARIO%TYPE,
    p_accion                AUDITORIA.NOM_OPERACION%TYPE,
    p_modulo                AUDITORIA.TABLA_AFECTADA%TYPE,
    p_detalle               AUDITORIA.DETALLE%TYPE,
    p_nivel                 AUDITORIA.NIVEL%TYPE DEFAULT 'info',
    p_id_empresa            AUDITORIA.ID_EMPRESA%TYPE DEFAULT NULL,
    p_id_persona_ecommerce  AUDITORIA.ID_PERSONA_ECOMMERCE%TYPE DEFAULT NULL
)
RETURNS VOID AS
$$
DECLARE
    v_detalle AUDITORIA.DETALLE%TYPE := p_detalle;
    v_payload JSONB;
    v_reg_anterior AUDITORIA.REG_ANTERIOR%TYPE;
    v_reg_nuevo AUDITORIA.REG_NUEVO%TYPE;
BEGIN
    IF LEFT(COALESCE(p_detalle, ''), 11) = 'AUDIT_JSON:' THEN
        v_payload := SUBSTRING(p_detalle FROM 12)::JSONB;
        IF JSONB_TYPEOF(v_payload) <> 'object'
           OR NOT (v_payload ? 'detalle')
           OR NOT (v_payload ? 'reg_anterior')
           OR NOT (v_payload ? 'reg_nuevo') THEN
            RAISE EXCEPTION 'El detalle estructurado de auditoría no tiene el formato esperado.';
        END IF;

        v_detalle := v_payload->>'detalle';
        v_reg_anterior := NULLIF(v_payload->'reg_anterior', 'null'::JSONB);
        v_reg_nuevo := NULLIF(v_payload->'reg_nuevo', 'null'::JSONB);
    END IF;

    INSERT INTO AUDITORIA (
        FECHA_HORA, ID_USUARIO, ID_EMPRESA, ID_PERSONA_ECOMMERCE,
        NOM_OPERACION, DETALLE, NIVEL, TABLA_AFECTADA, REG_ANTERIOR, REG_NUEVO
    )
    VALUES (
        NOW(), p_id_usuario, p_id_empresa, p_id_persona_ecommerce,
        p_accion, v_detalle, p_nivel, p_modulo, v_reg_anterior, v_reg_nuevo
    );
EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_auditoria - FK inválida (ID_USUARIO no existe): %', SQLERRM;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_auditoria - Check violado (formato de algún campo): %', SQLERRM;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_registrar_auditoria - Tabla bloqueada, reintenta: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_registrar_auditoria - Error inesperado: %', SQLERRM;
END;
$$
LANGUAGE plpgsql;