CREATE OR REPLACE FUNCTION fn_actualizar_contacto_artesano(
    p_id USUARIOS_ECOMMERCE.ID_PERSONA_ECOMMERCE%TYPE,
    p_email USUARIOS_ECOMMERCE.EMAIL_LOGIN%TYPE,
    p_telefono PERSONAS_ECOMMERCE.NUM_CEL_PERSONA_ECOMMERCE%TYPE
)
RETURNS TABLE (
    ok BOOLEAN,
    mensaje TEXT,
    email TEXT,
    telefono TEXT
) AS
$$
DECLARE
    v_email_actual USUARIOS_ECOMMERCE.EMAIL_LOGIN%TYPE;
    v_telefono_actual PERSONAS_ECOMMERCE.NUM_CEL_PERSONA_ECOMMERCE%TYPE;
    v_estado USUARIOS_ECOMMERCE.ESTADO%TYPE;
BEGIN
    SELECT u.EMAIL_LOGIN, p.NUM_CEL_PERSONA_ECOMMERCE, u.ESTADO
    INTO v_email_actual, v_telefono_actual, v_estado
    FROM USUARIOS_ECOMMERCE u
    JOIN PERSONAS_ECOMMERCE p
      ON p.ID_PERSONA_ECOMMERCE = u.ID_PERSONA_ECOMMERCE
    WHERE u.ID_PERSONA_ECOMMERCE = p_id
    FOR UPDATE OF u, p;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'No se encontró la cuenta del artesano.'::TEXT, NULL::TEXT, NULL::TEXT;
        RETURN;
    END IF;

    IF v_estado <> 'ACTIVO' THEN
        RETURN QUERY SELECT FALSE, 'La cuenta no está activa y no puede actualizar sus datos.'::TEXT,
            NULL::TEXT, NULL::TEXT;
        RETURN;
    END IF;

    IF p_email IS NULL OR LENGTH(BTRIM(p_email)) > 254
       OR BTRIM(p_email) !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
       OR p_telefono IS NULL OR BTRIM(p_telefono) !~ '^\+?[0-9]{7,15}$' THEN
        RETURN QUERY SELECT FALSE, 'Revisa que el correo y el teléfono tengan un formato válido.'::TEXT,
            NULL::TEXT, NULL::TEXT;
        RETURN;
    END IF;

    IF v_email_actual IS NOT DISTINCT FROM BTRIM(p_email)
       AND v_telefono_actual IS NOT DISTINCT FROM BTRIM(p_telefono) THEN
        RETURN QUERY SELECT TRUE, 'No hay cambios para guardar.'::TEXT,
            v_email_actual::TEXT, v_telefono_actual::TEXT;
        RETURN;
    END IF;

    PERFORM pg_advisory_xact_lock(HASHTEXT(LOWER(BTRIM(p_email))));

    IF EXISTS (
        SELECT 1
        FROM USUARIOS_ECOMMERCE
        WHERE LOWER(EMAIL_LOGIN) = LOWER(BTRIM(p_email))
          AND ID_PERSONA_ECOMMERCE <> p_id
    ) THEN
        RETURN QUERY SELECT FALSE, 'Ese correo ya está registrado por otra cuenta de artesano.'::TEXT,
            NULL::TEXT, NULL::TEXT;
        RETURN;
    END IF;

    UPDATE USUARIOS_ECOMMERCE
    SET EMAIL_LOGIN = BTRIM(p_email)
    WHERE ID_PERSONA_ECOMMERCE = p_id;

    UPDATE PERSONAS_ECOMMERCE
    SET EMAIL_PERSONA_ECOMMERCE = BTRIM(p_email),
        NUM_CEL_PERSONA_ECOMMERCE = BTRIM(p_telefono)
    WHERE ID_PERSONA_ECOMMERCE = p_id;

    RETURN QUERY SELECT TRUE, 'Datos de contacto actualizados correctamente.'::TEXT,
        BTRIM(p_email), BTRIM(p_telefono);
EXCEPTION
    WHEN UNIQUE_VIOLATION THEN
        RETURN QUERY SELECT FALSE, 'Ese correo ya está registrado por otra cuenta de artesano.'::TEXT,
            NULL::TEXT, NULL::TEXT;
END;
$$
LANGUAGE plpgsql;
