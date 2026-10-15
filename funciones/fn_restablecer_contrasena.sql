CREATE OR REPLACE FUNCTION fn_restablecer_contrasena(
    p_token TOKENS_RECUPERACION.TOKEN%TYPE,
    p_hash  USUARIOS.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
DECLARE
    v_id_usuario TOKENS_RECUPERACION.ID_USUARIO%TYPE;
    v_id_empresa TOKENS_RECUPERACION.ID_EMPRESA%TYPE;
BEGIN
    SELECT ID_USUARIO, ID_EMPRESA
    INTO v_id_usuario, v_id_empresa
    FROM TOKENS_RECUPERACION
    WHERE TOKEN = p_token AND USADO = FALSE AND FECHA_EXPIRA > NOW();

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'El enlace ha expirado o ya fue utilizado. Solicita uno nuevo.'::TEXT;
        RETURN;
    END IF;

    IF v_id_usuario IS NOT NULL THEN
        UPDATE USUARIOS SET CONTRASENA = p_hash WHERE ID_PERSONA = v_id_usuario;
    ELSIF v_id_empresa IS NOT NULL THEN
        UPDATE USUARIOS_EMPRESA SET CONTRASENA = p_hash WHERE ID_EMPRESA = v_id_empresa;
    END IF;

    UPDATE TOKENS_RECUPERACION SET USADO = TRUE WHERE TOKEN = p_token;

    RETURN QUERY SELECT TRUE, 'Tu contraseña ha sido actualizada con éxito.'::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_restablecer_contrasena - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error interno: usuario no válido.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_restablecer_contrasena - Hash inválido: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La contraseña recibida no tiene un formato válido.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_restablecer_contrasena - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La solicitud ya está siendo procesada, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_restablecer_contrasena: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error interno: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;