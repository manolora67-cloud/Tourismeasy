BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'empresas'
          AND column_name = 'descripcion'
    ) THEN
        ALTER TABLE EMPRESAS ADD COLUMN DESCRIPCION TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'transporte'
          AND column_name = 'accesibilidad'
    ) THEN
        ALTER TABLE TRANSPORTE ADD COLUMN ACCESIBILIDAD VARCHAR;
    END IF;
END;
$$;

ALTER TABLE HOSPEDAJE
    ALTER COLUMN ACCESIBILIDAD TYPE VARCHAR,
    ALTER COLUMN ACCESIBILIDAD DROP NOT NULL;

ALTER TABLE HOSPEDAJE
    DROP CONSTRAINT IF EXISTS hospedaje_accesibilidad_check,
    DROP CONSTRAINT IF EXISTS ck_hospedaje_accesibilidad,
    ADD CONSTRAINT ck_hospedaje_accesibilidad
        CHECK (ACCESIBILIDAD IS NULL OR LENGTH(BTRIM(ACCESIBILIDAD)) >= 3);

ALTER TABLE PLANES_TURISTICOS
    ALTER COLUMN ACCESIBILIDAD TYPE VARCHAR,
    ALTER COLUMN ACCESIBILIDAD DROP NOT NULL;

ALTER TABLE PLANES_TURISTICOS
    DROP CONSTRAINT IF EXISTS planes_turisticos_accesibilidad_check,
    DROP CONSTRAINT IF EXISTS ck_planes_turisticos_accesibilidad,
    ADD CONSTRAINT ck_planes_turisticos_accesibilidad
        CHECK (ACCESIBILIDAD IS NULL OR LENGTH(BTRIM(ACCESIBILIDAD)) >= 3);

ALTER TABLE TRANSPORTE
    DROP CONSTRAINT IF EXISTS transporte_accesibilidad_check,
    DROP CONSTRAINT IF EXISTS ck_transporte_accesibilidad,
    ADD CONSTRAINT ck_transporte_accesibilidad
        CHECK (ACCESIBILIDAD IS NULL OR LENGTH(BTRIM(ACCESIBILIDAD)) >= 3);

COMMIT;
