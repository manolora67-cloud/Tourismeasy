/*
ETAPA 1 - EXTRACCION: crea automaticamente una copia vacia por cada tabla de public.
WITH NO DATA copia las columnas y sus tipos, pero no las filas.
Las filas se copian en 2_extraer.sql.
Estas copias conservan los datos originales para transformarlos despues.
*/

DO $$
DECLARE
    nom_tabla TEXT;
BEGIN
    FOR nom_tabla IN
        SELECT TABLENAME
        FROM PG_TABLES
        WHERE SCHEMANAME = 'public'
        ORDER BY TABLENAME
    LOOP
        EXECUTE FORMAT(
            'CREATE TABLE IF NOT EXISTS BRONCE.%I AS SELECT * FROM PUBLIC.%I WITH NO DATA',
            nom_tabla,
            nom_tabla
        );
    END LOOP;
END $$;
