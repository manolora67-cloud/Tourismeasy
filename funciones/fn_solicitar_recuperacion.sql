CREATE OR REPLACE FUNCTION fn_solicitar_recuperacion(
    p_email          TOKENS_RECUPERACION.EMAIL%TYPE,
    p_token          TOKENS_RECUPERACION.TOKEN%TYPE,
    p_fecha_creacion TOKENS_RECUPERACION.FECHA_CREACION%TYPE,
    p_fecha_expira   TOKENS_RECUPERACION.FECHA_EXPIRA%TYPE
)
RETURNS TABLE (
    ok     BOOLEAN,
    existe BOOLEAN
) AS
$$
DECLARE
    v_id_usuario USUARIOS.ID_PERSONA%TYPE;
    v_id_empresa USUARIOS_EMPRESA.ID_EMPRESA%TYPE;
    v_id_persona_ecommerce USUARIOS_ECOMMERCE.ID_PERSONA_ECOMMERCE%TYPE;
BEGIN
    SELECT ID_PERSONA INTO v_id_usuario FROM USUARIOS WHERE EMAIL_LOGIN = p_email;
    SELECT ID_EMPRESA INTO v_id_empresa FROM USUARIOS_EMPRESA WHERE EMAIL_LOGIN = p_email;
    SELECT ID_PERSONA_ECOMMERCE INTO v_id_persona_ecommerce
    FROM USUARIOS_ECOMMERCE WHERE EMAIL_LOGIN = p_email;

    IF v_id_usuario IS NULL AND v_id_empresa IS NULL AND v_id_persona_ecommerce IS NULL THEN
        RETURN QUERY SELECT TRUE, FALSE;
        RETURN;
    END IF;

    IF (CASE WHEN v_id_usuario IS NULL THEN 0 ELSE 1 END
        + CASE WHEN v_id_empresa IS NULL THEN 0 ELSE 1 END
        + CASE WHEN v_id_persona_ecommerce IS NULL THEN 0 ELSE 1 END) <> 1 THEN
        RETURN QUERY SELECT FALSE, FALSE;
        RETURN;
    END IF;

    UPDATE TOKENS_RECUPERACION SET USADO = TRUE WHERE EMAIL = p_email AND USADO = FALSE;

    INSERT INTO TOKENS_RECUPERACION (
        EMAIL, ID_USUARIO, ID_EMPRESA, ID_PERSONA_ECOMMERCE,
        TOKEN, FECHA_CREACION, FECHA_EXPIRA, USADO
    )
    VALUES (
        p_email, v_id_usuario, v_id_empresa, v_id_persona_ecommerce,
        p_token, p_fecha_creacion, p_fecha_expira, FALSE
    );

    RETURN QUERY SELECT TRUE, TRUE;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_solicitar_recuperacion - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, FALSE;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_solicitar_recuperacion - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, FALSE;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_solicitar_recuperacion - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, FALSE;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_solicitar_recuperacion: %', SQLERRM;
        RETURN QUERY SELECT FALSE, FALSE;
END;
$$
LANGUAGE plpgsql;