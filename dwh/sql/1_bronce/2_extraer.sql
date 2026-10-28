/*
ETAPA 1 - EXTRACCION: copia las filas de cada tabla de public a bronce.
Primero vacia cada copia para que no queden filas duplicadas.
Al terminar cada tabla, muestra un aviso con su nombre.
*/

BEGIN;

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
            'TRUNCATE TABLE BRONCE.%I', nombre_tabla
        );

        EXECUTE FORMAT
        (
            'INSERT INTO BRONCE.%I SELECT * FROM PUBLIC.%I', nombre_tabla, nombre_tabla
        );

        RAISE NOTICE 'Tabla % copiada', nombre_tabla;
    END LOOP;
END $$;

COMMIT;