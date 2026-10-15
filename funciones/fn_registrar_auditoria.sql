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
BEGIN
    INSERT INTO AUDITORIA (
        FECHA_HORA, ID_USUARIO, ID_EMPRESA, ID_PERSONA_ECOMMERCE,
        NOM_OPERACION, DETALLE, NIVEL, TABLA_AFECTADA
    )
    VALUES (
        NOW(), p_id_usuario, p_id_empresa, p_id_persona_ecommerce,
        p_accion, p_detalle, p_nivel, p_modulo
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