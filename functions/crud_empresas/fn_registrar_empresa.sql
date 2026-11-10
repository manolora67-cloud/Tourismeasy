CREATE OR REPLACE FUNCTION fn_registrar_empresa(
    p_nit           EMPRESAS.ID_EMPRESA%TYPE,
    p_nombre        EMPRESAS.NOM_EMPRESA%TYPE,
    p_email_inst    EMPRESAS.EMAIL_INSTITU_EMPRESA%TYPE,
    p_contacto      EMPRESAS.NUM_CONTACTO_EMPRESA%TYPE,
    p_id_ciudad     EMPRESAS.ID_CIUDAD%TYPE,
    p_tipo_servicio EMPRESAS.TIPO_SERVICIO%TYPE,
    p_email_login   USUARIOS_EMPRESA.EMAIL_LOGIN%TYPE,
    p_hash          USUARIOS_EMPRESA.CONTRASENA%TYPE
)
RETURNS TABLE (
    ok      BOOLEAN,
    mensaje TEXT
) AS
$$
BEGIN
    IF NOT fn_validar_documento(p_nit, 10, 10) THEN
        RETURN QUERY SELECT FALSE, 'El NIT debe tener exactamente 10 dígitos.'::TEXT;
        RETURN;
    END IF;

    IF NOT fn_validar_nombre(p_nombre, 2, 50) THEN
        RETURN QUERY SELECT FALSE, 'La razón social debe tener entre 2 y 50 caracteres.'::TEXT;
        RETURN;
    END IF;

    IF NOT fn_validar_correo(p_email_inst) OR NOT fn_validar_correo(p_email_login) THEN
        RETURN QUERY SELECT FALSE, 'Correo electrónico inválido.'::TEXT;
        RETURN;
    END IF;

    IF NOT fn_validar_celular(p_contacto) THEN
        RETURN QUERY SELECT FALSE, 'Número de contacto inválido.'::TEXT;
        RETURN;
    END IF;

    p_nit := BTRIM(p_nit);
    p_nombre := BTRIM(p_nombre);
    p_email_inst := BTRIM(p_email_inst);
    p_contacto := BTRIM(p_contacto);
    p_email_login := BTRIM(p_email_login);

    IF EXISTS (SELECT 1 FROM EMPRESAS WHERE ID_EMPRESA = p_nit) THEN
        RETURN QUERY SELECT FALSE, 'Este NIT ya está registrado.'::TEXT;
        RETURN;
    END IF;

    PERFORM pg_advisory_xact_lock(HASHTEXT(LOWER(BTRIM(p_email_login))));

    IF EXISTS (SELECT 1 FROM USUARIOS_EMPRESA WHERE LOWER(EMAIL_LOGIN) = LOWER(BTRIM(p_email_login))) THEN
        RETURN QUERY SELECT FALSE, 'Este correo ya está registrado.'::TEXT;
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM CIUDADES WHERE ID_CIUDAD = p_id_ciudad) THEN
        RETURN QUERY SELECT FALSE, 'Ciudad no válida.'::TEXT;
        RETURN;
    END IF;

    INSERT INTO EMPRESAS (ID_EMPRESA, NOM_EMPRESA, EMAIL_INSTITU_EMPRESA, NUM_CONTACTO_EMPRESA, ID_CIUDAD, TIPO_SERVICIO)
    VALUES (p_nit, p_nombre, p_email_inst, p_contacto, p_id_ciudad, p_tipo_servicio);

    INSERT INTO USUARIOS_EMPRESA (ID_EMPRESA, EMAIL_LOGIN, CONTRASENA, ESTADO)
    VALUES (p_nit, p_email_login, p_hash, 'PENDIENTE');

    PERFORM fn_registrar_auditoria(
        NULL,
        'Solicitud de empresa creada',
        'Solicitudes',
        'AUDIT_JSON:' || JSONB_BUILD_OBJECT(
            'detalle', p_nombre || ' (NIT ' || p_nit || ')',
            'reg_anterior', NULL,
            'reg_nuevo', JSONB_BUILD_OBJECT(
                'nit', p_nit,
                'nombre', p_nombre,
                'correo_institucional', p_email_inst,
                'contacto', p_contacto,
                'id_ciudad', p_id_ciudad,
                'tipo_servicio', p_tipo_servicio,
                'estado', 'PENDIENTE'
            )
        )::TEXT,
        'info',
        p_nit,
        NULL
    );

    RETURN QUERY SELECT TRUE, 'Solicitud enviada. Un administrador revisará tu cuenta pronto.'::TEXT;

EXCEPTION
    WHEN FOREIGN_KEY_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_empresa - FK inválida: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Ciudad no válida.'::TEXT;
    WHEN CHECK_VIOLATION THEN
        RAISE NOTICE 'fn_registrar_empresa - Check violado: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'Los datos ingresados no cumplen el formato requerido.'::TEXT;
    WHEN LOCK_NOT_AVAILABLE THEN
        RAISE NOTICE 'fn_registrar_empresa - Fila bloqueada: %', SQLERRM;
        RETURN QUERY SELECT FALSE, 'El registro está siendo procesado, intenta de nuevo.'::TEXT;
    WHEN OTHERS THEN
        RAISE NOTICE 'fn_registrar_empresa: %', SQLERRM;
        RETURN QUERY SELECT FALSE, ('Error al registrar la empresa: ' || SQLERRM)::TEXT;
END;
$$
LANGUAGE plpgsql;