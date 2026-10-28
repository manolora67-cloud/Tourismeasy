# Modelo dimensional copo de nieve

El DWH conserva las jerarquías normalizadas en dimensiones separadas. Todas las capas están en la base PostgreSQL de TourismEasy, en los esquemas `bronce`, `plata` y `oro`.

En palabras sencillas, oro prepara tablas para analizar: las **dimensiones** dicen quién, qué, dónde y cuándo; los **hechos** guardan qué ocurrió y sus medidas. `SK` significa clave interna (surrogate key) creada para relacionar las tablas del DWH.

## Relación con las etapas ETL

- **Extraer a Bronce:** copiar las tablas crudas de `public` sin transformarlas.
- **Transformar en Plata:** seleccionar y limpiar los datos que se van a analizar.
- **Cargar en Oro:** guardar el resultado en dimensiones y hechos. La carga también asigna las claves internas y relaciona los registros.

## Hechos y granularidad

| Hecho | Granularidad | Medidas |
| --- | --- | --- |
| `oro.hecho_oferta_turistica` | Un servicio, tipo y fecha de fotografía. | Precio COP, disponibilidad y cantidad de servicios (=1). |
| `oro.hecho_producto_artesanal` | Un producto y fecha de fotografía. | Precio COP y cantidad de productos (=1). |
| `oro.hecho_resenas` | Una reseña publicada. | Puntuación 1–5, likes observados en la carga y cantidad de reseñas (=1). |

Las fotografías actuales se generan con la fecha de carga. Los snapshots de `HISTORICO_*` agregan cambios anteriores que realmente existen en OLTP. Se conservan ofertas disponibles y no disponibles para analizar ambas situaciones. Varias modificaciones de una entidad el mismo día se consolidan según la granularidad diaria. `CAPACIDAD_MAX` queda vacía para planes y transportes, donde la capacidad no aplica; no se registra como cero. El catálogo artesanal no representa ventas o pedidos.

Para leer la tabla: por ejemplo, la granularidad de `hecho_oferta_turistica` dice qué representa exactamente cada fila. Su clave evita guardar dos veces el mismo servicio en la misma fecha.

## Dimensiones y jerarquías

| Dimensión | Jerarquía / propósito |
| --- | --- |
| `oro.dim_tiempo` | Día → mes → trimestre → año. |
| `oro.dim_mes` | Mes, trimestre y año. |
| `oro.dim_ciudad` | Municipio → departamento. |
| `oro.dim_departamento` | Departamento. |
| `oro.dim_empresa` | Empresa y tipo de servicio; SCD tipo 2 para nombre y tipo. |
| `oro.dim_tipo_servicio` | Hospedaje, Plan, Transporte y Desconocido. |
| `oro.dim_subtipo_servicio` | Tipo de servicio → subtipo. |
| `oro.dim_servicio` | Servicio, atributos descriptivos y municipios de origen/destino cuando es transporte. |
| `oro.dim_categoria_producto` | Categoría de producto. |
| `oro.dim_producto` | Producto → categoría; SCD tipo 2 para nombre, proveedor y categoría. |

En el copo de nieve, algunas dimensiones se separan en niveles relacionados; por ejemplo, `dim_ciudad` apunta a `dim_departamento`. Eso evita repetir el nombre del departamento en cada ciudad, aunque requiere más relaciones al consultar.

Los extremos de una ruta son dos referencias de rol a `dim_ciudad`: `dim_servicio.sk_ciudad_origen` y `sk_ciudad_destino`. Para hospedaje/planes, ambos usan la fila desconocida. El `sk_ciudad` del hecho de oferta sigue representando la ubicación comercial; para transporte corresponde al municipio de destino.

## Mapeo desde OLTP

| Origen | Destino |
| --- | --- |
| `DEPARTAMENTOS`, `CIUDADES` | Dimensiones de ubicación. |
| `EMPRESAS` | `dim_empresa`, SCD tipo 2. Se omiten correo y teléfono. |
| `HOSPEDAJE`, `PLANES_TURISTICOS`, `TRANSPORTE` y sus tablas de clasificación | Snapshots de oferta y `dim_servicio`. |
| `ID_CIUDAD_ORIGEN`, `ID_CIUDAD_DESTINO` | Referencias de origen/destino para `dim_servicio`; ya no se infiere el municipio desde texto libre. |
| `HISTORICO_HOSPEDAJE`, `HISTORICO_PLAN_TURISTICO`, `HISTORICO_TRANSPORTE` | Snapshots de oferta disponibles. |
| `PRODUCTOS_ARTESANALES`, `HISTORICO_PRODUCTO_ARTESANAL` | Snapshots de catálogo y `dim_producto`. |
| `RESENAS_PLATAFORMA`, `LIKES_RESENAS` | Hecho de reseñas; solo se copia el conteo agregado de likes. |

## Reglas

- Bronce conserva todas las tablas públicas originales, incluidos los datos sensibles. Las transformaciones de plata filtran los atributos que pasan a las capas analíticas.

- Las dimensiones usan claves sustitutas; `-1` representa el registro desconocido.
- El precio y la disponibilidad se guardan en el hecho; se cargan ofertas disponibles y no disponibles.
- `dim_empresa` crea una versión cuando cambia su nombre o tipo; sus intervalos son semiabiertos (`FECHA_INICIO` incluida, `FECHA_FIN` excluida) y la versión vigente termina en `9999-12-31`.
- `dim_producto` crea una versión cuando cambia el nombre, proveedor o categoría; usa intervalos semiabiertos y cada hecho se relaciona con la versión vigente en la fecha de su fotografía.
- Plata reconstruye las fotografías diarias desde los históricos de OLTP y agrega el estado actual. Si existen varios cambios del mismo elemento en un día, conserva el último; los hechos de oro se reconstruyen desde esas fotografías sin duplicar la entidad y fecha.
- Los campos de origen/destino de servicios conservan etiquetas de texto y claves a ciudad cuando existen.
- Contraseñas, sesiones, tokens, correos, teléfonos, comentarios y `VISITOR_ID` no se copian a las tablas analíticas de plata y oro.
