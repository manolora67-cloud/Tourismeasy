# DWH TourismEasy

El DWH se ejecuta en PostgreSQL, dentro de la base `tourismeasy`, y separa el proceso en tres capas:

- **Bronce:** copias crudas de todas las tablas de `public`. No aplica limpieza ni reglas de negocio.
- **Plata:** prepara los hospedajes disponibles, las ciudades y su historial.
- **Oro:** publica el modelo analítico de hospedajes. Power BI consulta esta capa; la extracción y las transformaciones están en los scripts SQL, no en Power BI.

El DWH no almacena `FECHA_PROCESO`: los hospedajes usan las fechas reales de modificación y vigencia de OLTP. Los servicios que no son hospedajes se conservan en Bronce, pero por ahora no se transforman ni se cargan en Oro.

## Instalación y ejecución

Ejecuta los archivos con PostgreSQL, en este orden, después de crear las tablas OLTP desde `db/DB_TOURISMEASY.sql`:

1. `sql/0_admin/0_esquemas.sql`
2. `sql/1_bronce/1_tablas.sql`
3. `sql/1_bronce/2_extraer.sql`
4. `sql/2_plata/1_tablas.sql`
5. `sql/2_plata/2_transformar.sql`
6. `sql/3_oro/1_tablas_y_carga_oro.sql`
7. `sql/4_validacion/1_controles.sql`

Los pasos 2 y 4 preparan las estructuras; los pasos 3, 5 y 6 cargan las capas. Repite la extracción, transformación y carga de Oro con la periodicidad acordada con los usuarios. Los scripts de esquema actuales no son una migración automática para un DWH instalado con una versión anterior.

## Fuentes de Bronce

Bronce crea una copia para cada tabla del esquema `public` y extrae sus filas sin modificar. Si se agrega una tabla nueva en `public`, vuelve a ejecutar `1_tablas.sql` y `2_extraer.sql` para incluirla.

Las copias de Bronce conservan las columnas originales, incluidos datos de contacto y snapshots históricos. Restringe el acceso a Bronce y no la expongas directamente en Power BI.

## Expresiones usadas en la transformación

En `sql/2_plata/2_transformar.sql`:

- `TRIM(valor)` quita espacios al inicio y al final del texto.
- `CAST(valor AS tipo)` y `valor::tipo` convierten un valor a otro tipo, por ejemplo, texto a número.
- `->>'campo'` extrae del JSON el valor de un campo como texto.
- `NULLIF(valor, '')` devuelve `NULL` si el valor está vacío.
- `COALESCE(valor1, valor2, ...)` devuelve el primer valor que no sea `NULL`. Para las fechas históricas, usa la primera fecha disponible.

## Modelo analítico

- `oro.dim_hospedaje` aplica SCD tipo 2: cada versión analizada tiene una clave sustituta y un intervalo de vigencia. Las versiones anteriores se conservan; no se sobrescriben. Vigencia indica durante qué período aplicó esa versión, no si el hospedaje está disponible.
- Plata y Oro incluyen únicamente hospedajes disponibles. Si uno deja de estar disponible, la versión disponible anterior se conserva como historia y se cierra; no se carga el estado no disponible como oferta analítica.
- Las versiones previas de hospedajes provienen de `HISTORICO_HOSPEDAJE` en OLTP. Plata contiene el estado actual disponible, sin una fecha artificial de proceso.
- `oro.hecho_capacidad_hospedaje` guarda capacidad y precio por versión del hospedaje, además de la acción histórica y el usuario de base de datos registrado por el trigger. `oro.dim_rango_capacidad` organiza la capacidad en `1-10`, `11-20` y `21+`, conservando también el valor numérico exacto.

### Granularidad, consolidación y uso desde Power BI

- La granularidad del hecho es **una fila por versión del hospedaje** (`SK_HOSPEDAJE`), no una fila por día, mes o trimestre. Las versiones históricas conservan los valores capturados por el historial de OLTP; la fila actual representa el hospedaje disponible.
- Los rangos `1-10`, `11-20` y `21+` son una clasificación analítica de capacidad en `oro.dim_rango_capacidad`. **No son particiones físicas de tablas**.
- Oro no crea actualmente agregados diarios, mensuales ni trimestrales, ni medidas de moda, varianza o correlación. La periodicidad de consolidación y las métricas que necesitan los usuarios todavía deben definirse antes de añadirlas al modelo.
- Power BI debe conectarse a Oro para consultar y visualizar. No debe usarse para modificar las filas fuente ni para sustituir el proceso ETL; las cargas y cambios de Oro se realizan con los scripts SQL del DWH. Estos scripts no crean por sí solos un usuario PostgreSQL de solo lectura: configura los permisos de acceso en el servidor antes de publicar la conexión.

Por ahora, Oro conserva los datos y el historial de hospedajes; no implementa reportes estadísticos ni consolidaciones por período.

Los límites de los rangos de capacidad mantienen la clasificación que ya estaba en el modelo. Confírmalos con los usuarios antes de considerarlos una regla definitiva.

## Validación y límites

`sql/4_validacion/1_controles.sql` solo revisa los datos; no los modifica. Sus resultados se leen así:

- **Sincronización:** compara en Bronce y Plata los hospedajes disponibles y sus cambios históricos disponibles. `EN_SINCRO` debe ser `TRUE`; no compara todas las tablas de Bronce.
- **Calidad:** cuenta hospedajes disponibles con capacidad o precio no positivo. `HAY_ALERTA = TRUE` indica filas que revisar.
- **Historial y rangos:** comprueba que cada hospedaje disponible tenga una versión actual SCD2, que sus períodos históricos no se crucen y que cada capacidad pertenezca a un rango. En estos controles, `HAY_ALERTA = TRUE` indica un problema.

El DWH no analiza planes, transportes, artesanías ni clics por ahora; sus tablas fuente siguen completas en Bronce.
