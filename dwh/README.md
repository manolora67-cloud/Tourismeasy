# Data Warehouse de TourismEasy

El DWH vive en la misma base PostgreSQL de TourismEasy, en esquemas separados: `bronce`, `plata` y `oro`. La carga se implementa con SQL nativo de PostgreSQL: no requiere PHP, PowerShell, un ETL externo ni una segunda base.

El modelo de referencia está en [Modelo_Dimensional_TourismEasy (2).pdf](./Modelo_Dimensional_TourismEasy%20(2).pdf).

## Modelo

- **Bronce:** fotografías completas de las fuentes operativas seleccionadas. Solo copia las columnas necesarias para análisis.
- **Plata:** unifica y normaliza oferta turística, productos artesanales y reseñas.
- **Oro:** dimensiones normalizadas y tres hechos: oferta, catálogo artesanal y reseñas.
- **Transporte:** origen y destino ahora son municipios seleccionados de `CIUDADES`, con claves foráneas. El DWH analiza ambos extremos como roles de la dimensión ciudad; ya no existe tabla de mapeo manual.

La aplicación no registra ventas ni reservas. El hecho de producto representa el catálogo y su precio, no transacciones comerciales. Las reseñas no tienen relación de origen con ciudad o servicio, así que se analizan por fecha.

## Requisitos

- La base PostgreSQL de TourismEasy, documentada como `tourismeasy`.
- Los esquemas y tablas del proyecto importados.
- Permiso para crear esquemas/tablas y leer las fuentes. No se guardan credenciales en el DWH.

No se conecta a una base separada ni instala extensiones. Ejecuta los archivos SQL en orden desde una sesión conectada a `tourismeasy`.

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

Para una nueva carga, vuelve a ejecutar desde el paso 5. Bronce se reemplaza transaccionalmente; plata refresca la fotografía del día y conserva las fotografías diarias anteriores y el historial OLTP; los hechos de oro se reconstruyen desde esas fotografías acumuladas. Así se conservan las tendencias históricas y no quedan filas actuales obsoletas. Las dimensiones mantienen sus claves sustitutas y la historia SCD tipo 2 de empresas y productos.

## Qué cambió y qué no se debe asumir

- No ejecutes la creación de la base ni `DB_TOURISMEASY.sql` sobre una base existente: ese archivo es para instalaciones nuevas.
- La carga del DWH usa los datos que están en la base; no inventa historia anterior a la primera fotografía o a los snapshots que conserva OLTP.
- Para revisar la granularidad, el mapeo fuente-destino y los límites, consulta [`docs/modelo-dimensional.md`](./docs/modelo-dimensional.md) y [`docs/decisiones-y-limitaciones.md`](./docs/decisiones-y-limitaciones.md).
- Valida primero en una copia de desarrollo y revisa los conteos que imprime el último script antes de presentar los resultados.
