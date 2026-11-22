BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'configuracion_seguridad'
          AND column_name = 'control'
    ) THEN
        ALTER TABLE CONFIGURACION_SEGURIDAD RENAME COLUMN CONTROL TO ID_CONTROL;
    END IF;
END;
$$;

ALTER TABLE CONFIGURACION_SEGURIDAD
    DROP CONSTRAINT IF EXISTS configuracion_seguridad_control_check,
    DROP CONSTRAINT IF EXISTS ck_configuracion_seguridad_control,
    DROP CONSTRAINT IF EXISTS configuracion_seguridad_id_control_check,
    DROP CONSTRAINT IF EXISTS ck_configuracion_seguridad_id_control,
    ADD CONSTRAINT ck_configuracion_seguridad_id_control
        CHECK (ID_CONTROL IN (
            'inicio_sesion',
            'cambio_contrasena',
            'solicitud_recuperacion',
            'enlace_recuperacion',
            'solicitud_dispositivo',
            'codigo_dispositivo'
        ));

COMMIT;
