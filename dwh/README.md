# DWH TourismEasy

Esta guia explica como preparar Bronce y transformar sus datos en Plata. La idea es avanzar por pasos: primero guardar una copia de los datos originales y despues organizar solo la informacion que se necesita para analizar.

## Antes de empezar

La base de datos de TourismEasy debe existir y tener sus tablas originales en `public`. Ejecuta los archivos con el cliente de PostgreSQL que usan en clase y sigue este orden.

## 1. Crear los espacios del DWH

Archivo: `sql/0_admin/0_esquemas.sql`

Este archivo crea tres esquemas dentro de la base: `BRONCE`, `PLATA` y `ORO`. Piensa en ellos como espacios separados para ordenar las tablas del DWH.

`IF NOT EXISTS` quiere decir que PostgreSQL solo crea cada esquema si todavia no existe. Ejecuta este archivo primero, porque las tablas de Bronce necesitan ese espacio para poder crearse.

## 2. Preparar las tablas vacias de Bronce

Archivo: `sql/1_bronce/1_tablas.sql`

Este archivo busca las tablas originales que estan en `public` y prepara una copia vacia de cada una dentro de `BRONCE`. No hace falta escribir una instruccion por cada tabla: PostgreSQL revisa la lista y repite el trabajo por nosotros.

En palabras sencillas:

- `PG_TABLES` es la lista que PostgreSQL tiene de las tablas existentes.
- `DO` le dice a PostgreSQL que ejecute un bloque de instrucciones.
- `FOR ... LOOP` repite las instrucciones para cada tabla de la lista. `END LOOP` marca el final de lo que se repite.
- `nombre_tabla` guarda el nombre de la tabla que se esta procesando.
- `FORMAT` arma el comando SQL. `%I` indica que el valor que se inserta es un nombre de objeto, en este caso una tabla.
- `EXECUTE` ejecuta el comando que se acaba de armar.
- `WITH NO DATA` copia las columnas y sus tipos, pero deja la tabla sin filas.
- `IF NOT EXISTS` evita crear otra vez una tabla que ya exista.

Por ejemplo, cuando encuentra `CIUDADES`, prepara una tabla vacia equivalente a:

```sql
CREATE TABLE IF NOT EXISTS BRONCE.CIUDADES AS
SELECT * FROM PUBLIC.CIUDADES WITH NO DATA;
```

Este paso crea la estructura, pero no copia los registros. Las tablas de Bronce tienen las columnas y los tipos de la fuente, pero no copian sus claves, restricciones, valores predeterminados ni indices.

## 3. Copiar los registros a Bronce

Archivo: `sql/1_bronce/2_extraer.sql`

Este archivo vuelve a recorrer las tablas de `public`. Para cada una, vacia su copia en Bronce y despues copia todos los registros desde la tabla original. Al terminar cada tabla, muestra un aviso con su nombre.

Usa el mismo ciclo explicado en el paso anterior. La diferencia es lo que hace en cada vuelta:

1. `TRUNCATE` vacia la copia de Bronce. Si la tabla esta vacia, no borra nada; si ya tenia datos de una ejecucion anterior, los quita para no duplicarlos.
2. `INSERT INTO ... SELECT *` copia todos los registros de la tabla original a su copia.
3. `RAISE NOTICE` muestra un aviso para indicar que termino esa tabla.

Por ejemplo, para `CIUDADES`, vacia `BRONCE.CIUDADES` y luego copia sus registros desde `PUBLIC.CIUDADES`.

`BEGIN` y `COMMIT` marcan el inicio y el final de la transaccion. PostgreSQL confirma la copia al llegar al final correctamente.

## 4. Crear las tablas de Plata

Archivo: `sql/2_plata/1_tablas.sql`

Este archivo crea el esquema `PLATA` y cinco tablas: `DIM_EMPRESAS`, `HIST_HOSPEDAJES`, `HIST_PLANES`, `HIST_TRANSPORTES` y `HIST_ARTESANIAS`. Las cuatro tablas `HIST_...` guardan una foto diaria por entidad.

## 5. Cargar los datos de Bronce a Plata

Archivo: `sql/2_plata/2_transformar.sql`

Este archivo contiene las cinco cargas diarias. La carga de empresas reemplaza la tabla para copiar el estado actual. Las otras cuatro cargas borran primero las filas de hoy y luego guardan una nueva foto desde Bronce; asi se puede ejecutar otra vez en el mismo dia sin duplicar esa foto. `TRIM` quita espacios y `CAST` convierte los tipos cuando hace falta.

Ejecuta `1_tablas.sql` una vez para crear las tablas; despues ejecuta `2_transformar.sql` cada dia para refrescar los datos.

**Importante:** este diseño de Plata usa tablas distintas a las que lee el script de Oro actual. No ejecutes la carga de Oro con esta estructura hasta adaptar Oro para leer las cinco tablas nuevas de Plata.

## Orden de ejecucion explicado en esta guia

1. `sql/0_admin/0_esquemas.sql`: crear los espacios del DWH.
2. `sql/1_bronce/1_tablas.sql`: preparar las copias vacias de las tablas originales.
3. `sql/1_bronce/2_extraer.sql`: copiar los registros originales a Bronce.
4. `sql/2_plata/1_tablas.sql`: crear el esquema y las cinco tablas de Plata.
5. `sql/2_plata/2_transformar.sql`: ejecutar las cargas diarias de Plata.
