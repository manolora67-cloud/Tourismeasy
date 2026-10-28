/*
ETAPA 1 - EXTRACCION: crea automaticamente una copia vacia por cada tabla de public, WITH NO DATA copia las columnas y sus tipos, 
pero no las filas. Las filas se copian en 2_extraer.sql.
Estas copias no conservan claves ni restricciones; son por decir una zona de aterrizaje,
osea donde se dejan caer los datos crudos para luego transformarlos y limpiarlos.
*/

DO $$
DECLARE
    nombre_tabla TEXT;
BEGIN
    FOR nombre_tabla IN
        SELECT TABLENAME
        FROM PG_TABLES
        WHERE SCHEMANAME = 'public'
        ORDER BY TABLENAME
    LOOP
        EXECUTE FORMAT
        (
            'CREATE TABLE IF NOT EXISTS BRONCE.%I AS SELECT * FROM PUBLIC.%I WITH NO DATA', nombre_tabla, nombre_tabla
        );
    END LOOP;
END $$;