CREATE OR REPLACE FUNCTION fn_actualizar_perfil_empresa(
    p_id          EMPRESAS.ID_EMPRESA%TYPE,
    p_nombre      EMPRESAS.NOM_EMPRESA%TYPE,
    p_email_inst  EMPRESAS.EMAIL_INSTITU_EMPRESA%TYPE,
    p_contacto    EMPRESAS.NUM_CONTACTO_EMPRESA%TYPE,
    p_id_ciudad   EMPRESAS.ID_CIUDAD%TYPE,
    p_email_login USUARIOS_EMPRESA.EMAIL_LOGIN%TYPE,
    p_descripcion EMPRESAS.DESCRIPCION%TYPE
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
    v_descripcion_actual EMPRESAS.DESCRIPCION%TYPE;
    v_estado_cuenta USUARIOS_EMPRESA.ESTADO%TYPE;
    v_mes_actual DATE := DATE_TRUNC('month', CURRENT_TIMESTAMP::TIMESTAMP)::DATE;
    v_mes_edicion DATE;
    v_ediciones_mes INTEGER := 0;
    v_limite_mensual CONFIGURACION_LIMITE_PERFIL_EMPRESA.LIMITE_MENSUAL%TYPE;
BEGIN
    SELECT u.FECHA_ULTIMA_EDICION_PERFIL, e.NOM_EMPRESA,
           e.EMAIL_INSTITU_EMPRESA, e.NUM_CONTACTO_EMPRESA,
           e.ID_CIUDAD, u.EMAIL_LOGIN, e.DESCRIPCION, u.ESTADO
    INTO v_ultima_edicion, v_nombre_actual, v_email_inst_actual,
         v_contacto_actual, v_ciudad_actual, v_email_login_actual,
         v_descripcion_actual, v_estado_cuenta
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

    IF NOT fn_validar_nombre(p_nombre, 2, 50)
       OR NOT fn_validar_correo(p_email_inst)
       OR NOT fn_validar_correo(p_email_login)
       OR NOT fn_validar_celular(p_contacto)
       OR NOT fn_validar_codigo_ciudad(p_id_ciudad)
       OR NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = BTRIM(p_id_ciudad)) THEN
        RETURN QUERY SELECT FALSE, 'Revisa el nombre, los correos, el teléfono y el municipio.'::TEXT, 'INVALID_DATA'::TEXT, NULL::TIMESTAMP, FALSE;
        RETURN;
    END IF;

    p_nombre := BTRIM(p_nombre);
    p_email_inst := BTRIM(p_email_inst);
    p_contacto := BTRIM(p_contacto);
    p_email_login := BTRIM(p_email_login);
    p_id_ciudad := BTRIM(p_id_ciudad);
    p_descripcion := NULLIF(BTRIM(p_descripcion), '');

    IF v_nombre_actual IS NOT DISTINCT FROM BTRIM(p_nombre)
       AND v_email_inst_actual IS NOT DISTINCT FROM BTRIM(p_email_inst)
       AND v_contacto_actual IS NOT DISTINCT FROM BTRIM(p_contacto)
       AND v_ciudad_actual IS NOT DISTINCT FROM p_id_ciudad
       AND v_email_login_actual IS NOT DISTINCT FROM BTRIM(p_email_login)
       AND v_descripcion_actual IS NOT DISTINCT FROM p_descripcion THEN
        RETURN QUERY SELECT TRUE, 'No hay cambios para guardar.'::TEXT, 'NO_CHANGES'::TEXT, NULL::TIMESTAMP, FALSE;
        RETURN;
    END IF;

    SELECT LIMITE_MENSUAL
    INTO v_limite_mensual
    FROM CONFIGURACION_LIMITE_PERFIL_EMPRESA
    WHERE ID_CONFIG = 1
    FOR SHARE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la configuración del límite de edición de perfil.';
    END IF;

    INSERT INTO EDICIONES_PERFIL_EMPRESA (ID_EMPRESA, MES, CANTIDAD)
    VALUES (p_id, v_mes_actual, 0)
    ON CONFLICT (ID_EMPRESA) DO NOTHING;

    SELECT MES, CANTIDAD
    INTO v_mes_edicion, v_ediciones_mes
    FROM EDICIONES_PERFIL_EMPRESA
    WHERE ID_EMPRESA = p_id
    FOR UPDATE;

    IF v_mes_edicion <> v_mes_actual THEN
        v_ediciones_mes := 0;
    END IF;

    IF v_ediciones_mes >= v_limite_mensual THEN
        RETURN QUERY SELECT FALSE,
            FORMAT('Alcanzaste el límite de %s cambios de perfil permitidos este mes.', v_limite_mensual)::TEXT,
            'MONTHLY_LIMIT'::TEXT,
            (v_mes_actual + INTERVAL '1 month')::TIMESTAMP,
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
        ID_CIUDAD = p_id_ciudad,
        DESCRIPCION = p_descripcion
    WHERE ID_EMPRESA = p_id;

    UPDATE USUARIOS_EMPRESA
    SET EMAIL_LOGIN = BTRIM(p_email_login),
        FECHA_ULTIMA_EDICION_PERFIL = CURRENT_TIMESTAMP::TIMESTAMP
    WHERE ID_EMPRESA = p_id;

    PERFORM fn_registrar_auditoria(
        NULL,
        'Perfil de empresa actualizado',
        'Empresas',
        'AUDIT_JSON:' || JSONB_BUILD_OBJECT(
            'detalle', BTRIM(p_nombre) || ' (NIT ' || p_id || ')',
            'reg_anterior', JSONB_BUILD_OBJECT(
                'nombre', v_nombre_actual,
                'correo_institucional', v_email_inst_actual,
                'contacto', v_contacto_actual,
                'id_ciudad', v_ciudad_actual,
                'correo_acceso', v_email_login_actual,
                'descripcion', v_descripcion_actual
            ),
            'reg_nuevo', JSONB_BUILD_OBJECT(
                'nombre', BTRIM(p_nombre),
                'correo_institucional', BTRIM(p_email_inst),
                'contacto', BTRIM(p_contacto),
                'id_ciudad', p_id_ciudad,
                'correo_acceso', BTRIM(p_email_login),
                'descripcion', p_descripcion
            )
        )::TEXT,
        'info',
        p_id,
        NULL
    );

    UPDATE EDICIONES_PERFIL_EMPRESA
    SET MES = v_mes_actual,
        CANTIDAD = v_ediciones_mes + 1
    WHERE ID_EMPRESA = p_id;

    RETURN QUERY SELECT TRUE, 'Perfil actualizado correctamente.'::TEXT, 'UPDATED'::TEXT, NULL::TIMESTAMP, TRUE;
EXCEPTION
    WHEN UNIQUE_VIOLATION THEN
        RETURN QUERY SELECT FALSE, 'Ese correo de acceso ya está registrado por otra empresa.'::TEXT, 'EMAIL_TAKEN'::TEXT, NULL::TIMESTAMP, FALSE;
END;
$$ LANGUAGE plpgsql;
