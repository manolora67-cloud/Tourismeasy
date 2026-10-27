# Decisiones y limitaciones

## Ejecución sin ETL externo

La carga se realiza con consultas y DDL nativos de PostgreSQL dentro de la base `tourismeasy`. Las capas `bronce`, `plata` y `oro` son esquemas de esa misma base. No se usa PHP para extraer, PowerShell para orquestar, otra base de datos ni una herramienta ETL de terceros.

`bronce` refleja las 37 tablas base de `public` definidas en el esquema del proyecto y copia todas sus filas y columnas sin filtrar ni transformar, dentro de una transacción con sentencias `INSERT ... SELECT` explícitas. `CREATE TABLE ... AS SELECT * ... WITH NO DATA` crea cada espejo vacío a partir de las columnas y tipos de su tabla fuente; no copia claves, restricciones, valores predeterminados ni índices. Los archivos enumeran cada tabla para que el mapeo se pueda leer directamente; no requieren bloques `DO`, ciclos ni consultas al catálogo de PostgreSQL. Tampoco duplica funciones, triggers ni secuencias. Plata selecciona y limpia las columnas analíticas, reemplaza la fotografía correspondiente al día actual y conserva las anteriores; oro reconstruye los hechos desde el historial acumulado. De esta manera un servicio eliminado no aparece como oferta actual, pero sus fotografías previas no se pierden. Ejecuta los scripts desde el cliente SQL de PostgreSQL ya disponible en el curso.

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
- Los snapshots diarios consolidan modificaciones intradía.

## Datos minimizados en plata y oro

Las transformaciones de plata y oro seleccionan únicamente atributos analíticos. No llevan credenciales, cuentas, datos de contacto, textos de reseñas, comentarios ni el identificador del visitante a los hechos analíticos. Los snapshots JSONB se proyectan a una lista permitida de claves en plata; bronce conserva el JSONB original como parte de la copia cruda completa.
