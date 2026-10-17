CREATE OR REPLACE FUNCTION fn_login_artesano(
    p_email USUARIOS_ECOMMERCE.EMAIL_LOGIN%TYPE,
    p_hash  USUARIOS_ECOMMERCE.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok          BOOLEAN,
    mensaje     TEXT,
    id_persona  PERSONAS_ECOMMERCE.ID_PERSONA_ECOMMERCE%TYPE,
    nombre      PERSONAS_ECOMMERCE.NOM_PERSONA_ECOMMERCE%TYPE,
    apellido    PERSONAS_ECOMMERCE.APE_PERSONA_ECOMMERCE%TYPE,
    email_login USUARIOS_ECOMMERCE.EMAIL_LOGIN%TYPE,
    estado      USUARIOS_ECOMMERCE.ESTADO%TYPE
) AS
$$
DECLARE
    v_id       PERSONAS_ECOMMERCE.ID_PERSONA_ECOMMERCE%TYPE;
    v_nombre   PERSONAS_ECOMMERCE.NOM_PERSONA_ECOMMERCE%TYPE;
    v_apellido PERSONAS_ECOMMERCE.APE_PERSONA_ECOMMERCE%TYPE;
    v_email    USUARIOS_ECOMMERCE.EMAIL_LOGIN%TYPE;
    v_estado   USUARIOS_ECOMMERCE.ESTADO%TYPE;
BEGIN
    SELECT p.ID_PERSONA_ECOMMERCE, p.NOM_PERSONA_ECOMMERCE, p.APE_PERSONA_ECOMMERCE, u.EMAIL_LOGIN, u.ESTADO
    INTO v_id, v_nombre, v_apellido, v_email, v_estado
    FROM USUARIOS_ECOMMERCE u
    JOIN PERSONAS_ECOMMERCE p ON p.ID_PERSONA_ECOMMERCE = u.ID_PERSONA_ECOMMERCE
    WHERE u.EMAIL_LOGIN ILIKE p_email
      AND u.CONTRASENA  = p_hash;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Correo o contraseña incorrectos.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50),
            NULL::VARCHAR(254),
            NULL::VARCHAR(10);
        RETURN;
    END IF;

    IF v_estado = 'PENDIENTE' THEN
        RETURN QUERY SELECT FALSE, 'Tu cuenta está pendiente de aprobación. Espera a que un administrador la revise.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50),
            NULL::VARCHAR(254),
            NULL::VARCHAR(10);
        RETURN;
    END IF;

    IF v_estado = 'INACTIVO' THEN
        RETURN QUERY SELECT FALSE, 'Tu cuenta está inactiva. Contacta al administrador.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50),
            NULL::VARCHAR(254),
            NULL::VARCHAR(10);
        RETURN;
    END IF;

    RETURN QUERY SELECT TRUE, 'OK'::TEXT, v_id, v_nombre, v_apellido, v_email, v_estado;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_login_artesano - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error interno de datos.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50),
            NULL::VARCHAR(254),
            NULL::VARCHAR(10);
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_login_artesano - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Error interno de datos.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50),
            NULL::VARCHAR(254),
            NULL::VARCHAR(10);
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_login_artesano - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El inicio de sesión está siendo procesado, intenta de nuevo.'::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50),
            NULL::VARCHAR(254),
            NULL::VARCHAR(10);
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_login_artesano: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error interno: ' || SQLERRM)::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50),
            NULL::VARCHAR(254),
            NULL::VARCHAR(10);
END;
$$
LANGUAGE plpgsql;