# Data Warehouse de TourismEasy

El DWH vive en la misma base PostgreSQL de TourismEasy, en esquemas separados: `bronce`, `plata` y `oro`. La carga se implementa con SQL nativo de PostgreSQL: no requiere PHP, PowerShell, un ETL externo ni una segunda base.

La explicación del modelo dimensional está en [`docs/modelo-dimensional.md`](./docs/modelo-dimensional.md).

## Modelo

- **Bronce:** espejo crudo de todas las tablas base del esquema `public`. Copia las columnas y filas sin filtrarlas ni transformarlas.
- **Plata:** unifica y normaliza oferta turística, productos artesanales y reseñas.
- **Oro:** dimensiones normalizadas y tres hechos: oferta, catálogo artesanal y reseñas.
- **Transporte:** origen y destino ahora son municipios seleccionados de `CIUDADES`, con claves foráneas. El DWH analiza ambos extremos como roles de la dimensión ciudad; ya no existe tabla de mapeo manual.

La aplicación no registra ventas ni reservas. El hecho de producto representa el catálogo y su precio, no transacciones comerciales. Las reseñas no tienen relación de origen con ciudad o servicio, así que se analizan por fecha.

## Requisitos

- La base PostgreSQL de TourismEasy, documentada como `tourismeasy`.
- Los esquemas y tablas del proyecto importados.
- Permiso para crear esquemas/tablas y leer las fuentes. No se guardan credenciales en el DWH.

No se conecta a una base separada ni instala extensiones. Ejecuta los archivos SQL en orden desde una sesión conectada a `tourismeasy`.

> **Datos sensibles:** al copiar todas las tablas de `public`, bronce también contiene datos de cuentas, hashes de contraseñas, sesiones, tokens, auditoría y contactos. Restringe el acceso al esquema `bronce` a administradores autorizados; no concedas permisos de lectura al usuario de la aplicación ni a usuarios de análisis que no deban consultar esos datos.

El espejo comprende las tablas y sus filas; no duplica funciones, triggers ni secuencias de PostgreSQL. Las transformaciones de plata seleccionan explícitamente solo los atributos analíticos requeridos.

Los archivos de bronce usan sentencias explícitas, una por tabla, para que se pueda ver qué tabla de `public` se copia a cuál tabla de `bronce`. En `01_tablas.sql`, `CREATE TABLE ... AS SELECT * ... WITH NO DATA` crea la tabla vacía con las mismas columnas y tipos; en `02_cargar.sql`, `INSERT INTO ... SELECT *` copia sus filas. Es una copia de las 37 tablas, sus columnas y sus datos, no un duplicado de todas las propiedades físicas: las copias de bronce no conservan claves, restricciones, valores predeterminados ni índices de OLTP. No se usan bloques `DO`, ciclos, funciones ni consultas al catálogo de PostgreSQL.

**Palabras clave:** `PUBLIC` es el esquema donde están las tablas originales; `BRONCE`, `PLATA` y `ORO` son esquemas dentro de la misma base PostgreSQL. `SELECT` lee datos, `CREATE TABLE` crea una tabla, `INSERT INTO ... SELECT` copia filas y `TRUNCATE` vacía una tabla para volverla a cargar.

En los scripts de oro también aparecen consultas comunes del curso: `JOIN` relaciona tablas; `WITH` da un nombre temporal a una consulta para leerla más fácil; `COALESCE` reemplaza un valor nulo por otro valor; `ON CONFLICT` evita duplicados y, según el caso, ignora la fila o actualiza sus datos; `LAG` y `LEAD` comparan una fotografía con la anterior o la siguiente para guardar cambios históricos; `GENERATE_SERIES` crea los días del calendario.

## Explicación sencilla de las capas

1. **Bronce copia:** hace una copia de las tablas originales, sin limpiar sus datos.
2. **Plata limpia y organiza:** toma solo las tablas y columnas que sirven para analizar turismo; completa valores vacíos, unifica ofertas y conserva fotografías por fecha.
3. **Oro prepara el análisis:** organiza los datos en dimensiones (por ejemplo, tiempo, ciudad y empresa) y hechos (ofertas, productos y reseñas) para poder agrupar y comparar.

En las diapositivas del curso se habla de **granularidad**: es qué representa una fila de un hecho. Aquí, una fila de oferta representa un servicio en una fecha; una fila de producto, un producto en una fecha; y una fila de reseña, una reseña publicada. **SCD tipo 2** significa guardar una nueva versión de una empresa o producto cuando cambia su información, en vez de borrar la versión anterior.

## Preparar transporte

Las columnas `TRANSPORTE.ID_CIUDAD_ORIGEN` y `ID_CIUDAD_DESTINO` y sus claves foráneas se crean desde el esquema nuevo de la aplicación. Usa una base vacía creada con [`../db/DB_TOURISMEASY.sql`](../db/DB_TOURISMEASY.sql); este paquete no proporciona migraciones para bases existentes. Las rutas se crean y editan escogiendo municipios existentes en la interfaz.

## Crear y ejecutar el DWH

Conéctate a la base `tourismeasy` y ejecuta estos archivos **en orden**. Cada script es SQL nativo y se puede abrir desde el cliente SQL que ya use el curso:

1. `sql/00_admin/01_esquemas.sql`
2. `sql/01_bronce/01_tablas.sql`
3. `sql/02_plata/01_tablas.sql`
4. `sql/03_oro/01_tablas.sql`
5. `sql/01_bronce/02_cargar.sql`
6. `sql/02_plata/02_transformar.sql`
7. `sql/03_oro/02_cargar.sql`
8. `sql/04_validacion/01_controles.sql`

Para una nueva carga, vuelve a ejecutar desde el paso 5. Bronce reemplaza transaccionalmente la copia cruda de todas las tablas públicas y muestra el conteo copiado por tabla; plata refresca la fotografía del día y conserva las fotografías diarias anteriores y el historial OLTP; los hechos de oro se reconstruyen desde esas fotografías acumuladas. Así se conservan las tendencias históricas y no quedan filas actuales obsoletas. Las dimensiones mantienen sus claves sustitutas y la historia SCD tipo 2 de empresas y productos.

`BEGIN` y `COMMIT` marcan el inicio y el fin de una transacción de carga: si un `INSERT` falla, PostgreSQL no deja a medias esa carga. El último archivo de validación solo muestra consultas; revisa que los conteos de plata y oro coincidan, que los resultados esperados sean cero y que la consulta de versiones vigentes no devuelva filas.

## Qué cambió y qué no se debe asumir

- No ejecutes la creación de la base ni `DB_TOURISMEASY.sql` sobre una base existente: ese archivo es para instalaciones nuevas.
- La carga del DWH usa los datos que están en la base; no inventa historia anterior a la primera fotografía o a los snapshots que conserva OLTP.
- Para revisar la granularidad, el mapeo fuente-destino y los límites, consulta [`docs/modelo-dimensional.md`](./docs/modelo-dimensional.md) y [`docs/decisiones-y-limitaciones.md`](./docs/decisiones-y-limitaciones.md).
- Valida primero en una copia de desarrollo y revisa los conteos que imprime el último script antes de presentar los resultados.
