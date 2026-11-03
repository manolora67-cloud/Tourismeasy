# DWH TourismEasy

El DWH se ejecuta en PostgreSQL, dentro de la base `tourismeasy`. Organiza el proceso en tres capas:

- **Bronce:** copia las tablas del sistema sin cambiar sus datos.
- **Plata:** limpia y organiza ciudades, hospedajes, transportes, planes turísticos y productos artesanales.
- **Oro:** guarda las dimensiones y los hechos que se consultan desde Power BI.

El alcance incluye las cuatro clases de oferta desde la primera entrega. Los productos artesanales se relacionan con las personas que los publican, usando `ID_PERSONA_ECOMMERCE`. El DWH no incluye ventas, reservas ni compras: esas operaciones no están representadas en las fuentes que se cargan aquí.

## Instalación y ejecución

Ejecuta los archivos con PostgreSQL, en este orden, después de crear las tablas OLTP desde `db/DB_TOURISMEASY.sql`:

1. `sql/0_admin/0_esquemas.sql`
2. `sql/1_bronce/1_tablas.sql`
3. `sql/1_bronce/2_extraer.sql`
4. `sql/2_plata/1_tablas.sql`
5. `sql/2_plata/2_transformar.sql`
6. `sql/3_oro/1_tablas_y_carga_oro.sql`
7. `sql/4_validacion/1_controles.sql`

Los pasos 2 y 4 crean las tablas de trabajo. Los pasos 3, 5 y 6 cargan los datos. Para actualizar el DWH, vuelve a ejecutar los pasos 3, 5 y 6 en ese orden. Los scripts de creación actuales no son una migración automática para un DWH instalado con una versión anterior.

## Qué hace cada capa

- **Bronce:** crea una copia vacía de cada tabla del esquema `public` y luego copia sus filas. Si se agrega una tabla nueva en `public`, vuelve a ejecutar `1_tablas.sql` y `2_extraer.sql`.
- **Plata:** limpia los nombres y prepara ofertas actuales e historiales. Los hospedajes, transportes y planes se filtran por disponibilidad. Los productos artesanales se cargan desde la tabla de productos, que no tiene una columna de disponibilidad.
- **Oro:** carga dimensiones de departamentos, ciudades, empresas y artesanos; una dimensión para cada tipo de oferta; y un hecho para cada tipo de oferta.

## Cómo leer el modelo

- Las tablas `DIM_...` describen las ofertas y conservan sus versiones.
- Las tablas `HECHO_...` guardan los valores que se pueden medir, como precio y capacidad.
- Cada hecho se une con su dimensión usando una clave `SK_...`.
- `ES_ACTUAL = TRUE` identifica la versión que está vigente. Una oferta que ya no esté disponible no se carga como oferta actual; sus versiones históricas permanecen en Oro.
- Las ofertas se guardan por versión, no como ventas o reservas. El detalle del grano se explica en [docs/modelo-dimensional.md](./docs/modelo-dimensional.md).

## Personas artesanas y privacidad

La fuente relaciona un producto con una persona por medio de `PRODUCTOS_ARTESANALES.ID_PERSONA_ECOMMERCE`. Plata carga su identificador y nombre desde `PERSONAS_ECOMMERCE`; Oro los publica en `DIM_ARTESANO`. Los datos de contacto y las credenciales no se copian a las dimensiones de Oro. La fuente permite que el identificador de artesano esté vacío, por lo que `1_controles.sql` lo señala para revisión.

Bronce copia todas las columnas originales, incluidos datos de contacto y snapshots históricos. Restringe el acceso a Bronce y no la expongas directamente en Power BI.

## Fechas e historial

Los historiales de Oro se basan en los snapshots guardados por OLTP. `VIGENTE_DESDE` toma la fecha de modificación o creación que aparece en el snapshot; si no está disponible, usa la fecha del registro histórico. `VIGENTE_HASTA` usa la fecha en que OLTP guardó ese historial. No se crea una fecha artificial de proceso.

La historia disponible depende de que los triggers de OLTP hayan registrado los cambios. Las ofertas sin historial registrado solo se pueden cargar con sus datos actuales.

## Validación

`sql/4_validacion/1_controles.sql` no cambia datos. Compara los totales de Bronce y Plata para ofertas e historiales, revisa los productos sin persona artesana, y busca ofertas sin una versión actual o versiones históricas que se crucen.

En los controles, `EN_SINCRO = TRUE` indica que coinciden los totales. `HAY_ALERTA = TRUE` indica que hay filas para revisar.
