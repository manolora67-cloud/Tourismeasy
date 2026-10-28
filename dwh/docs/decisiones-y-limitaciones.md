# Decisiones y limitaciones

## Proceso ETL con SQL de PostgreSQL

El proceso se presenta en las tres etapas ETL del curso y se ejecuta con consultas y DDL nativos de PostgreSQL dentro de la base `tourismeasy`. Las capas `bronce`, `plata` y `oro` son esquemas de esa misma base. No se usa PHP para extraer, PowerShell para orquestar, otra base de datos ni una herramienta ETL de terceros.

1. **Extraer:** `bronce` recibe una copia cruda de las tablas base de `public`, sin limpiar ni transformar sus filas. `1_bronce/1_tablas.sql` busca las tablas en `PG_TABLES` y crea automáticamente espejos vacíos con `CREATE TABLE ... AS SELECT * ... WITH NO DATA`; `1_bronce/2_extraer.sql` copia las filas con instrucciones explícitas `INSERT ... SELECT` para las 37 tablas actuales. Si se agrega una tabla a `public`, también hay que incorporarla al archivo de extracción y a sus conteos. Estos espejos no conservan claves, restricciones, valores predeterminados ni índices. Tampoco duplican funciones, triggers ni secuencias.
2. **Transformar:** `plata` selecciona y limpia los atributos analíticos, reconstruye las fotografías históricas disponibles y agrega el estado actual.
3. **Cargar:** `oro` construye y carga el modelo de dimensiones y hechos desde Plata. Durante esa carga también relaciona registros con dimensiones y claves sustitutas. Los hechos se reconstruyen desde las fotografías acumuladas: un servicio eliminado deja de aparecer en la fotografía actual, pero sus fotografías anteriores se conservan.

La creación de tablas de Bronce usa un bloque `DO`, un ciclo y el catálogo `PG_TABLES` para no escribir una instrucción por cada tabla; la copia de las filas sigue siendo explícita para las 37 tablas actuales. Ejecuta los scripts desde el cliente SQL de PostgreSQL ya disponible en el curso.

Como el espejo crudo incluye todas las tablas, también conserva datos de cuentas y seguridad —por ejemplo hashes, sesiones, tokens, auditoría y contactos—. No compartas la base con personas que no deban consultar esa información.

## Transporte y ciudades

La columna anterior `TRANSPORTE.ORIGEN`/`DESTINO` era texto libre y no permitía analizar rutas de manera fiable; por eso había aparecido una tabla de mapeo manual. El esquema nuevo usa `ID_CIUDAD_ORIGEN` y `ID_CIUDAD_DESTINO`, ambas con FK a `CIUDADES`. Los formularios de empresa y la búsqueda pública usan selectores de municipios. El proyecto no incluye migraciones para bases existentes: se debe crear una base nueva desde `db/DB_TOURISMEASY.sql` antes de instalar el DWH.

El trigger PostgreSQL guarda la clase de transporte anterior dentro del snapshot histórico antes de editar o eliminar la ruta. Así, la transformación conserva su subtipo real y no lo reemplaza por la clase vigente. Snapshots históricos generados antes de esa captura no contienen esa información y se clasifican como desconocidos.

## Límites analíticos

- Las reseñas no tienen una relación con ciudad, servicio o empresa; solo se analizan por fecha.
- El número de likes es el valor observado al cargar; la base no conserva su historial completo.
- No hay pedidos ni pagos: los hechos de productos miden catálogo, no ventas.
- La historia anterior a la primera carga depende de las filas reales de `HISTORICO_*`; no se inventan fechas.
- Si el nombre/tipo de una empresa cambió varias veces entre cargas y OLTP no conserva su historia, no se pueden reconstruir esas versiones intermedias.
- La dimensión de producto conserva versiones SCD tipo 2 según las fotografías disponibles en plata; modificaciones múltiples dentro del mismo día se consolidan a la granularidad diaria.
- Los snapshots diarios consolidan modificaciones intradía y guardan tanto ofertas disponibles como no disponibles.
- El catálogo de productos artesanales no registra transacciones. No se puede calcular ventas por día de semana ni ventas totales hasta que OLTP tenga tablas de pedidos o pagos con fecha y valor.

## Datos minimizados en plata y oro

Las transformaciones de plata y oro seleccionan únicamente atributos analíticos. No llevan credenciales, cuentas, datos de contacto, textos de reseñas, comentarios ni el identificador del visitante a los hechos analíticos. Los snapshots JSONB se proyectan a una lista permitida de claves en plata; bronce conserva el JSONB original como parte de la copia cruda completa.
