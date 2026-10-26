# Modelo dimensional copo de nieve

El DWH conserva las jerarquías normalizadas en dimensiones separadas. Todas las capas están en la base PostgreSQL de TourismEasy, en los esquemas `bronce`, `plata` y `oro`.

## Hechos y granularidad

| Hecho | Granularidad | Medidas |
| --- | --- | --- |
| `oro.hecho_oferta_turistica` | Un servicio, tipo y fecha de fotografía. | Precio COP, disponibilidad y cantidad de servicios (=1). |
| `oro.hecho_producto_artesanal` | Un producto y fecha de fotografía. | Precio COP y cantidad de productos (=1). |
| `oro.hecho_resenas` | Una reseña publicada. | Puntuación 1–5, likes observados en la carga y cantidad de reseñas (=1). |

Las fotografías actuales se generan con la fecha de carga. Los snapshots de `HISTORICO_*` agregan cambios anteriores que realmente existen en OLTP. Varias modificaciones de una entidad el mismo día se consolidan según la granularidad diaria. El catálogo artesanal no representa ventas o pedidos.

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

- Las dimensiones usan claves sustitutas; `-1` representa el registro desconocido.
- El precio y la disponibilidad se miden en el hecho, no se suman atributos descriptivos.
- `dim_empresa` crea una versión cuando cambia su nombre o tipo; sus intervalos son semiabiertos (`FECHA_INICIO` incluida, `FECHA_FIN` excluida) y la versión vigente termina en `9999-12-31`.
- `dim_producto` crea una versión cuando cambia el nombre, proveedor o categoría; usa intervalos semiabiertos y cada hecho se relaciona con la versión vigente en la fecha de su fotografía.
- Plata refresca la fotografía del día actual y conserva las fotografías anteriores; también vuelve a cargar las filas históricas disponibles en OLTP. Los hechos de oro se reconstruyen desde esas fotografías acumuladas, lo que sincroniza eliminaciones actuales sin borrar la tendencia diaria.
- Los campos de origen/destino de servicios conservan etiquetas de texto y claves a ciudad cuando existen.
- Se omiten contraseñas, sesiones, tokens, correo, teléfono, comentarios y `VISITOR_ID`.
