BEGIN;

ALTER TABLE INTENTOS_SEGURIDAD
    DROP CONSTRAINT IF EXISTS intentos_seguridad_control_fkey,
    DROP CONSTRAINT IF EXISTS fk_intentos_seguridad_control;

ALTER TABLE BLOQUEOS_SEGURIDAD
    DROP CONSTRAINT IF EXISTS bloqueos_seguridad_control_fkey,
    DROP CONSTRAINT IF EXISTS fk_bloqueos_seguridad_control;

ALTER TABLE CONFIGURACION_SEGURIDAD
    DROP CONSTRAINT IF EXISTS configuracion_seguridad_control_check,
    DROP CONSTRAINT IF EXISTS ck_configuracion_seguridad_control;

UPDATE CONFIGURACION_SEGURIDAD
SET CONTROL = CASE CONTROL
    WHEN 'login' THEN 'inicio_sesion'
    WHEN 'password_change' THEN 'cambio_contrasena'
    WHEN 'recovery_request' THEN 'solicitud_recuperacion'
    WHEN 'recovery_link' THEN 'enlace_recuperacion'
    WHEN 'device_request' THEN 'solicitud_dispositivo'
    WHEN 'device_code' THEN 'codigo_dispositivo'
    ELSE CONTROL
END;

UPDATE INTENTOS_SEGURIDAD
SET CONTROL = CASE CONTROL
    WHEN 'login' THEN 'inicio_sesion'
    WHEN 'password_change' THEN 'cambio_contrasena'
    WHEN 'recovery_request' THEN 'solicitud_recuperacion'
    WHEN 'recovery_link' THEN 'enlace_recuperacion'
    WHEN 'device_request' THEN 'solicitud_dispositivo'
    WHEN 'device_code' THEN 'codigo_dispositivo'
    ELSE CONTROL
END;

UPDATE BLOQUEOS_SEGURIDAD
SET CONTROL = CASE CONTROL
    WHEN 'login' THEN 'inicio_sesion'
    WHEN 'password_change' THEN 'cambio_contrasena'
    WHEN 'recovery_request' THEN 'solicitud_recuperacion'
    WHEN 'recovery_link' THEN 'enlace_recuperacion'
    WHEN 'device_request' THEN 'solicitud_dispositivo'
    WHEN 'device_code' THEN 'codigo_dispositivo'
    ELSE CONTROL
END;

ALTER TABLE CONFIGURACION_SEGURIDAD
    ADD CONSTRAINT ck_configuracion_seguridad_control
        CHECK (CONTROL IN (
            'inicio_sesion',
            'cambio_contrasena',
            'solicitud_recuperacion',
            'enlace_recuperacion',
            'solicitud_dispositivo',
            'codigo_dispositivo'
        ));

ALTER TABLE INTENTOS_SEGURIDAD
    ADD CONSTRAINT fk_intentos_seguridad_control
        FOREIGN KEY (CONTROL) REFERENCES CONFIGURACION_SEGURIDAD(CONTROL);

ALTER TABLE BLOQUEOS_SEGURIDAD
    ADD CONSTRAINT fk_bloqueos_seguridad_control
        FOREIGN KEY (CONTROL) REFERENCES CONFIGURACION_SEGURIDAD(CONTROL);

COMMIT;
