CREATE OR REPLACE FUNCTION fn_actualizar_contrasena_admin(
    p_id           USUARIOS.ID_PERSONA%TYPE,
    p_hash_actual  USUARIOS.CONTRASENA%TYPE,
    p_hash_nuevo   USUARIOS.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
BEGIN
    UPDATE USUARIOS
    SET CONTRASENA = p_hash_nuevo
    WHERE ID_PERSONA = p_id
      AND CONTRASENA = p_hash_actual;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'No se pudo validar la cuenta. Inicia sesión nuevamente.'::TEXT;
        RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'Contraseña actualizada correctamente.'::TEXT;

EXCEPTION
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_contrasena_admin - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La contraseña nueva no tiene un formato válido.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_actualizar_contrasena_admin - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'La cuenta está siendo modificada, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_actualizar_contrasena_admin: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'No se pudo actualizar la contraseña.'::TEXT;
END;
$$
LANGUAGE plpgsql;
