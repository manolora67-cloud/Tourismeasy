CREATE OR REPLACE FUNCTION fn_actualizar_perfil_admin(
    p_id       USUARIOS.ID_PERSONA%TYPE,
    p_nombre   PERSONAS.NOM_PERSONA%TYPE,
    p_apellido PERSONAS.APE_PERSONA%TYPE,
    p_celular  PERSONAS.NUM_CEL_PERSONA%TYPE,
    p_email    PERSONAS.EMAIL_PERSONA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM USUARIOS WHERE ID_PERSONA = p_id AND ROL = 'admin') THEN
        RETURN QUERY SELECT FALSE, 'No autorizado.'::TEXT;
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM USUARIOS WHERE EMAIL_LOGIN = p_email AND ID_PERSONA <> p_id) THEN
        RETURN QUERY SELECT FALSE, 'Ese correo ya está en uso por otra cuenta.'::TEXT;
        RETURN;
    END IF;

    UPDATE PERSONAS
    SET NOM_PERSONA     = p_nombre,
        APE_PERSONA     = p_apellido,
        NUM_CEL_PERSONA = COALESCE(NULLIF(p_celular, ''), NUM_CEL_PERSONA),
        EMAIL_PERSONA   = p_email
    WHERE ID_PERSONA = p_id;

    UPDATE USUARIOS
    SET EMAIL_LOGIN = p_email
    WHERE ID_PERSONA = p_id;

    RETURN QUERY SELECT TRUE, 'Perfil actualizado correctamente.'::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_perfil_admin - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error: usuario no encontrado.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_actualizar_perfil_admin - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Los datos ingresados no cumplen el formato requerido.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_actualizar_perfil_admin - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El perfil está siendo modificado, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_actualizar_perfil_admin: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('No se pudo actualizar el perfil: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;