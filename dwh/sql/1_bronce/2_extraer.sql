/*
ETAPA 1 - EXTRACCION: copia las filas de cada tabla de public a bronce.
Primero vacia cada copia para que no queden filas duplicadas.
*/

BEGIN;

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
        EXECUTE FORMAT('TRUNCATE TABLE BRONCE.%I', nom_tabla);
        EXECUTE FORMAT(
            'INSERT INTO BRONCE.%I SELECT * FROM PUBLIC.%I',
            nom_tabla,
            nom_tabla
        );
        RAISE NOTICE 'Tabla % copiada', nom_tabla;
    END LOOP;
END $$;

COMMIT;
