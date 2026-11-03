# Decisiones y limitaciones

## Alcance

La primera versión de Plata y Oro cubre hospedajes, transportes, planes turísticos y productos artesanales. Bronce copia las tablas completas de `public`, mientras Plata y Oro solo exponen los datos necesarios para analizar esas cuatro clases de oferta.

El objetivo es analizar ofertas, precios, disponibilidad e historial. El DWH no calcula ventas ni reservas porque este flujo no cuenta con tablas fuente para esas transacciones.

## Proceso por capas

- **Bronce** copia las tablas de `public` sin limpiar ni cambiar valores.
- **Plata** prepara ciudades, departamentos, las personas artesanas, ofertas disponibles e historiales.
- **Oro** organiza dimensiones y hechos para Power BI. Oro se carga desde Plata, no directamente desde las tablas OLTP.

Los scripts usan `TRIM` para quitar espacios, `CAST` para convertir tipos y `->>` para leer campos de los snapshots JSON. Las fechas se toman de OLTP; no se agrega una fecha artificial de proceso.

## Historial tipo 2

Las dimensiones `dim_hospedaje`, `dim_transporte`, `dim_plan_turistico` y `dim_producto_artesanal` guardan versiones históricas con una clave sustituta, fechas de vigencia y un indicador de versión actual.

- En hospedajes, transportes y planes, solo se analizan las ofertas disponibles. El snapshot anterior se conserva si estaba disponible; si deja de estarlo, la última versión disponible se cierra.
- En productos artesanales no existe una columna de disponibilidad. Se cargan los productos que existen y los snapshots registrados en `historico_producto_artesanal`.
- La fecha inicial se obtiene de `fecha_modificacion` o `fecha_creacion` del snapshot. Si faltan, se usa la fecha del registro histórico. La fecha final es la fecha registrada por el historial de OLTP.
- La historia depende de que los triggers estén activos y hayan guardado los cambios. No se crean snapshots ni fechas que no existan en la fuente.

Las dimensiones de ciudad, departamento, empresa y artesano se actualizan como tipo 1: se conserva el dato más reciente, pues el flujo no crea historial para esos catálogos.

## Publicación artesanal

`productos_artesanales.id_persona_ecommerce` relaciona el producto con la persona que lo publica. Plata prepara esa persona desde `personas_ecommerce`; Oro la expone en `dim_artesano`. La tabla de productos permite que el identificador de persona sea nulo. El control de validación lo reporta para revisión.

Las dimensiones de Oro no copian correo, teléfono ni contraseña de la persona artesana. Bronce sí copia las columnas originales, por lo cual su acceso debe restringirse.

## Granularidad y cálculos

Cada hecho tiene una fila por versión de una oferta:

- hospedaje: precio por noche y capacidad;
- transporte: precio;
- plan turístico: precio;
- producto artesanal: precio en pesos colombianos.

El transporte guarda su fecha y hora de salida en la dimensión de transporte. No se crean agregados por día, mes o trimestre ni métricas estadísticas adicionales. Los rangos de capacidad `1-10`, `11-20` y `21+` mantienen los límites actuales del modelo y requieren confirmación del negocio.

## Relaciones de planes

Bronce incluye `plan_componentes`, pero esa relación no se transforma en Oro en esta versión. La tabla define componentes de tipo hospedaje o transporte, pero su modelo OLTP actual solo tiene una columna de referencia para hospedaje. Por eso, los análisis de Oro describen el plan y su precio, no la lista de transportes u hospedajes que lo componen.

## Power BI y permisos

Power BI debe consultar Oro; no reemplaza el proceso de extracción y transformación SQL. Antes de publicar el DWH, configura en PostgreSQL los permisos necesarios para que el usuario de reportes pueda leer Oro sin modificar las capas.
