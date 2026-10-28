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

Este archivo crea cuatro tablas para guardar la informacion preparada:

- `EMPRESA`: los datos necesarios para identificar cada empresa.
- `OFERTA_SNAPSHOT`: una fotografia diaria de hospedajes, planes y transportes.
- `PRODUCTO_SNAPSHOT`: una fotografia diaria de los productos artesanales.
- `RESENA`: la puntuacion de cada resena y el total actual de sus likes.

Las columnas obligatorias se declaran `NOT NULL`. Bronce conserva el origen; Plata guarda las fotografias historicas disponibles y los datos actuales. Las ofertas disponibles y no disponibles se guardan para que tambien se pueda analizar la disponibilidad. Los precios se copian del origen, que exige valores positivos; no se inventa un precio de `0` cuando falta.

La capacidad solo aplica a hospedajes. Para planes y transportes se deja `NULL` porque no es una medida aplicable; no se usa `0` como reemplazo. El total de likes puede ser `0` cuando la resena realmente no tiene likes.

## 5. Transformar los datos de Bronce a Plata

La transformacion esta separada en archivos cortos. Ejecutalos en este orden:

1. `sql/2_plata/2_transformar_1_empresas.sql`
2. `sql/2_plata/2_transformar_2_hospedajes.sql`
3. `sql/2_plata/2_transformar_3_planes.sql`
4. `sql/2_plata/2_transformar_4_transportes.sql`
5. `sql/2_plata/2_transformar_5_productos.sql`
6. `sql/2_plata/2_transformar_6_resenas.sql`

Cada archivo procesa solo su tema. Los archivos de hospedajes, planes, transportes y productos reconstruyen en Plata los registros historicos y agregan una fotografia del estado actual. Si un elemento tuvo varios cambios en un mismo dia, se conserva el ultimo para no duplicar la misma entidad y fecha.

La mayoria de los pasos siguen la misma idea: `INSERT INTO ... SELECT` lee datos de Bronce y los guarda en Plata. `TRIM` quita espacios al principio y al final. Para las filas historicas, `->>` lee un campo del JSON guardado en Bronce. `CAST` convierte el valor al tipo de columna que usa Plata.

Las ofertas de hospedaje, planes y transporte se guardan disponibles o no disponibles. `FECHA_SNAPSHOT` indica el dia al que corresponde cada fotografia.

En cada archivo, `BEGIN` y `COMMIT` hacen que sus cambios se confirmen juntos. Si una instruccion falla, no se confirma a medias ese archivo.

## Orden de ejecucion explicado en esta guia

1. `sql/0_admin/0_esquemas.sql`: crear los espacios del DWH.
2. `sql/1_bronce/1_tablas.sql`: preparar las copias vacias de las tablas originales.
3. `sql/1_bronce/2_extraer.sql`: copiar los registros originales a Bronce.
4. `sql/2_plata/1_tablas.sql`: crear las tablas preparadas de Plata.
5. Ejecutar en orden los seis archivos `sql/2_plata/2_transformar_*.sql`.
