CREATE OR REPLACE FUNCTION fn_login_social_persona(
    p_email     USUARIOS.EMAIL_LOGIN%TYPE,
    p_proveedor VARCHAR(20) DEFAULT 'google'
)
RETURNS TABLE (
    ok          BOOLEAN,
    mensaje     TEXT,
    id_persona  PERSONAS.ID_PERSONA%TYPE,
    rol         USUARIOS.ROL%TYPE,
    email_login USUARIOS.EMAIL_LOGIN%TYPE,
    nom_persona PERSONAS.NOM_PERSONA%TYPE,
    ape_persona PERSONAS.APE_PERSONA%TYPE
) AS
$$
DECLARE
    v_id_persona  PERSONAS.ID_PERSONA%TYPE;
    v_rol         USUARIOS.ROL%TYPE;
    v_email_login USUARIOS.EMAIL_LOGIN%TYPE;
    v_estado      USUARIOS.ESTADO%TYPE;
    v_nom_persona PERSONAS.NOM_PERSONA%TYPE;
    v_ape_persona PERSONAS.APE_PERSONA%TYPE;
BEGIN
    -- A diferencia de fn_login_persona, aquí NO se compara CONTRASENA:
    -- la identidad ya fue verificada por Google/Facebook antes de llamar
    -- a esta función. Solo confirmamos que el email exista y esté activo.
    SELECT u.ID_PERSONA, u.ROL, u.EMAIL_LOGIN, u.ESTADO, p.NOM_PERSONA, p.APE_PERSONA
    INTO v_id_persona, v_rol, v_email_login, v_estado, v_nom_persona, v_ape_persona
    FROM USUARIOS u
    JOIN PERSONAS p ON p.ID_PERSONA = u.ID_PERSONA
    WHERE u.EMAIL_LOGIN ILIKE p_email
      AND u.ROL IN ('viajero', 'admin');

    IF NOT FOUND THEN
        -- No es un error: significa "cuenta nueva", el backend debe pedir
        -- documento y celular antes de registrar.
        RETURN QUERY SELECT FALSE, 'CUENTA_NUEVA'::TEXT,
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

    BEGIN
        PERFORM fn_registrar_auditoria(
            v_id_persona,
            'Inicio de sesión social',
            'Sesiones',
            INITCAP(v_rol) || ': ' || v_email_login || ' (' || p_proveedor || ')',
            'info'
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'fn_login_social_persona - auditoría no crítica: %', SQLERRM;
    END;

    RETURN QUERY SELECT TRUE, 'OK'::TEXT, v_id_persona, v_rol, v_email_login, v_nom_persona, v_ape_persona;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_login_social_persona: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error interno: ' || SQLERRM)::TEXT,
            NULL::VARCHAR(10),
            NULL::VARCHAR(10),
            NULL::VARCHAR(254),
            NULL::VARCHAR(50),
            NULL::VARCHAR(50);
END;
$$
LANGUAGE plpgsql;
