CREATE OR REPLACE FUNCTION fn_actualizar_perfil_empresa(
    p_id          EMPRESAS.ID_EMPRESA%TYPE,
    p_nombre      EMPRESAS.NOM_EMPRESA%TYPE,
    p_email_inst  EMPRESAS.EMAIL_INSTITU_EMPRESA%TYPE,
    p_contacto    EMPRESAS.NUM_CONTACTO_EMPRESA%TYPE,
    p_id_ciudad   EMPRESAS.ID_CIUDAD%TYPE,
    p_email_login USUARIOS_EMPRESA.EMAIL_LOGIN%TYPE
)
RETURNS TABLE (
    ok BOOLEAN,
    mensaje TEXT,
    codigo TEXT,
    proxima_edicion TIMESTAMP,
    actualizado BOOLEAN
) AS
$$
DECLARE
    v_ultima_edicion USUARIOS_EMPRESA.FECHA_ULTIMA_EDICION_PERFIL%TYPE;
    v_nombre_actual EMPRESAS.NOM_EMPRESA%TYPE;
    v_email_inst_actual EMPRESAS.EMAIL_INSTITU_EMPRESA%TYPE;
    v_contacto_actual EMPRESAS.NUM_CONTACTO_EMPRESA%TYPE;
    v_ciudad_actual EMPRESAS.ID_CIUDAD%TYPE;
    v_email_login_actual USUARIOS_EMPRESA.EMAIL_LOGIN%TYPE;
    v_estado_cuenta USUARIOS_EMPRESA.ESTADO%TYPE;
BEGIN
    SELECT u.FECHA_ULTIMA_EDICION_PERFIL, e.NOM_EMPRESA,
           e.EMAIL_INSTITU_EMPRESA, e.NUM_CONTACTO_EMPRESA,
           e.ID_CIUDAD, u.EMAIL_LOGIN, u.ESTADO
    INTO v_ultima_edicion, v_nombre_actual, v_email_inst_actual,
         v_contacto_actual, v_ciudad_actual, v_email_login_actual, v_estado_cuenta
    FROM EMPRESAS e
    JOIN USUARIOS_EMPRESA u ON u.ID_EMPRESA = e.ID_EMPRESA
    WHERE e.ID_EMPRESA = p_id
    FOR UPDATE OF e, u;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Empresa no encontrada.'::TEXT, 'NOT_FOUND'::TEXT, NULL::TIMESTAMP, FALSE;
        RETURN;
    END IF;

    IF v_estado_cuenta <> 'ACTIVO' THEN
        RETURN QUERY SELECT FALSE, 'Solo las cuentas de empresa aprobadas pueden actualizar el perfil.'::TEXT,
            'ACCOUNT_NOT_ACTIVE'::TEXT, NULL::TIMESTAMP, FALSE;
        RETURN;
    END IF;

    IF p_nombre IS NULL OR LENGTH(BTRIM(p_nombre)) < 2 OR LENGTH(p_nombre) > 50
       OR p_email_inst IS NULL OR p_email_inst !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
       OR p_email_login IS NULL OR p_email_login !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
       OR p_contacto IS NULL OR p_contacto !~ '^\+?[0-9]{7,15}$'
       OR p_id_ciudad IS NULL
       OR NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = p_id_ciudad) THEN
        RETURN QUERY SELECT FALSE, 'Revisa el nombre, los correos, el teléfono y el municipio.'::TEXT, 'INVALID_DATA'::TEXT, NULL::TIMESTAMP, FALSE;
        RETURN;
    END IF;

    IF v_nombre_actual IS NOT DISTINCT FROM BTRIM(p_nombre)
       AND v_email_inst_actual IS NOT DISTINCT FROM BTRIM(p_email_inst)
       AND v_contacto_actual IS NOT DISTINCT FROM BTRIM(p_contacto)
       AND v_ciudad_actual IS NOT DISTINCT FROM p_id_ciudad
       AND v_email_login_actual IS NOT DISTINCT FROM BTRIM(p_email_login) THEN
        RETURN QUERY SELECT TRUE, 'No hay cambios para guardar.'::TEXT, 'NO_CHANGES'::TEXT, NULL::TIMESTAMP, FALSE;
        RETURN;
    END IF;

    IF v_ultima_edicion IS NOT NULL
       AND DATE_TRUNC('month', v_ultima_edicion) = DATE_TRUNC('month', CURRENT_TIMESTAMP::TIMESTAMP) THEN
        RETURN QUERY SELECT FALSE,
            'Los datos del perfil solo se pueden actualizar una vez por mes.'::TEXT,
            'MONTHLY_LIMIT'::TEXT,
            (DATE_TRUNC('month', v_ultima_edicion) + INTERVAL '1 month')::TIMESTAMP,
            FALSE;
        RETURN;
    END IF;

    PERFORM pg_advisory_xact_lock(HASHTEXT(LOWER(BTRIM(p_email_login))));

    IF EXISTS (
        SELECT 1 FROM USUARIOS_EMPRESA
        WHERE LOWER(EMAIL_LOGIN) = LOWER(BTRIM(p_email_login))
          AND ID_EMPRESA <> p_id
    ) THEN
        RETURN QUERY SELECT FALSE, 'Ese correo de acceso ya está registrado por otra empresa.'::TEXT, 'EMAIL_TAKEN'::TEXT, NULL::TIMESTAMP, FALSE;
        RETURN;
    END IF;

    UPDATE EMPRESAS
    SET NOM_EMPRESA = BTRIM(p_nombre),
        EMAIL_INSTITU_EMPRESA = BTRIM(p_email_inst),
        NUM_CONTACTO_EMPRESA = BTRIM(p_contacto),
        ID_CIUDAD = p_id_ciudad
    WHERE ID_EMPRESA = p_id;

    UPDATE USUARIOS_EMPRESA
    SET EMAIL_LOGIN = BTRIM(p_email_login),
        FECHA_ULTIMA_EDICION_PERFIL = CURRENT_TIMESTAMP::TIMESTAMP
    WHERE ID_EMPRESA = p_id;

    RETURN QUERY SELECT TRUE, 'Perfil actualizado correctamente.'::TEXT, 'UPDATED'::TEXT, NULL::TIMESTAMP, TRUE;
EXCEPTION
    WHEN UNIQUE_VIOLATION THEN
        RETURN QUERY SELECT FALSE, 'Ese correo de acceso ya está registrado por otra empresa.'::TEXT, 'EMAIL_TAKEN'::TEXT, NULL::TIMESTAMP, FALSE;
END;
$$ LANGUAGE plpgsql;
