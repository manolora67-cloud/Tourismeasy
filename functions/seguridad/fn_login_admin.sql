CREATE OR REPLACE FUNCTION fn_login_admin(
    p_email USUARIOS.EMAIL_LOGIN%TYPE,
    p_hash  USUARIOS.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok          BOOLEAN,
    mensaje     TEXT,
    id_persona  USUARIOS.ID_PERSONA%TYPE,
    rol         VARCHAR(10),
    email_login USUARIOS.EMAIL_LOGIN%TYPE,
    nom_persona USUARIOS.NOM_PERSONA%TYPE,
    ape_persona USUARIOS.APE_PERSONA%TYPE
) AS
$$
DECLARE
    v_id_persona  USUARIOS.ID_PERSONA%TYPE;
    v_rol         VARCHAR(10);
    v_email_login USUARIOS.EMAIL_LOGIN%TYPE;
    v_estado      USUARIOS.ESTADO%TYPE;
    v_nom_persona USUARIOS.NOM_PERSONA%TYPE;
    v_ape_persona USUARIOS.APE_PERSONA%TYPE;
BEGIN
    SELECT u.ID_PERSONA, 'admin'::VARCHAR(10), u.EMAIL_LOGIN, u.ESTADO, u.NOM_PERSONA, u.APE_PERSONA
    INTO v_id_persona, v_rol, v_email_login, v_estado, v_nom_persona, v_ape_persona
    FROM USUARIOS u
    WHERE u.EMAIL_LOGIN ILIKE p_email
      AND u.CONTRASENA  = p_hash;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Correo o contraseña incorrectos.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50);
        RETURN;
    END IF;

    IF v_estado <> 'ACTIVO' THEN
        RETURN QUERY SELECT FALSE, 'Tu cuenta está inactiva. Contacta al soporte.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50);
        RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'OK'::TEXT, v_id_persona, v_rol, v_email_login, v_nom_persona, v_ape_persona;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_login_admin - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error interno de datos.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50);
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_login_admin - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error interno de datos.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50);
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_login_admin - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El inicio de sesión está siendo procesado, intenta de nuevo.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50);
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_login_admin: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error interno: ' || SQLERRM)::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50);
END;
$$
LANGUAGE plpgsql;