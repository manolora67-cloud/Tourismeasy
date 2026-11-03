# Modelo dimensional de Oro

Oro analiza las cuatro clases de oferta de TourismEasy. Cada oferta conserva las versiones que se encuentran en su historial de OLTP y su versión actual, si está disponible.

## Dimensiones compartidas

| Tabla | Contenido |
| --- | --- |
| `oro.dim_departamento` | Código y nombre del departamento. |
| `oro.dim_ciudad` | Código y nombre de la ciudad y su departamento. |
| `oro.dim_empresa` | Identificador, nombre, tipo de servicio y ciudad de la empresa que publica hospedajes, transportes o planes. |
| `oro.dim_artesano` | Identificador y nombre de la persona artesana que publica productos. No incluye teléfono, correo ni credenciales. |

Las dimensiones de oferta guardan los identificadores de empresa, artesano y ciudad. En Power BI se pueden relacionar con estas dimensiones por sus identificadores.

## Dimensiones de oferta e historial

| Tabla | Datos de la oferta |
| --- | --- |
| `oro.dim_hospedaje` | Nombre, tipo, empresa, ciudad y vigencia de cada versión del hospedaje. |
| `oro.dim_transporte` | Empresa, origen, destino, ciudades, fecha y hora de salida, clase de servicio y vigencia. |
| `oro.dim_plan_turistico` | Nombre, duración, contenido incluido, tipo de plan, empresa, ciudad y vigencia. |
| `oro.dim_producto_artesanal` | Nombre, proveedor, categoría, ciudad, persona artesana y vigencia. |
| `oro.dim_rango_capacidad` | Rangos de capacidad `1-10`, `11-20` y `21+` para hospedajes. |

Cada dimensión de oferta usa una clave sustituta (`SK_...`), conserva el identificador de OLTP y guarda `VIGENTE_DESDE`, `VIGENTE_HASTA` y `ES_ACTUAL`. El historial de versiones es SCD tipo 2: una versión anterior se conserva y se cierra, en vez de reemplazarla.

## Hechos y grano

| Tabla | Una fila representa | Valores medibles |
| --- | --- | --- |
| `oro.hecho_capacidad_hospedaje` | Una versión de un hospedaje. | Capacidad máxima y precio por noche. |
| `oro.hecho_transporte` | Una versión de un transporte. | Precio del transporte. |
| `oro.hecho_plan_turistico` | Una versión de un plan turístico. | Precio del plan. |
| `oro.hecho_producto_artesanal` | Una versión de un producto artesanal. | Precio en pesos colombianos. |

Los hechos tienen una fila por versión de su dimensión y se relacionan usando la clave `SK_...`. La acción histórica y el usuario que registró el cambio se conservan cuando están disponibles en el historial. No son medidas de ventas.

La fecha y hora de salida del transporte se guardan como atributos de `dim_transporte`; no se generan hechos por día o por viaje. Tampoco se calculan agregados diarios, mensuales o trimestrales.

## Tratamiento por tipo de oferta

- **Hospedajes, transportes y planes:** Plata carga los registros actuales con `DISPONIBILIDAD = TRUE`. También procesa snapshots históricos que estaban disponibles. Cuando una oferta deja de estar disponible, la última versión disponible permanece como historia y se cierra.
- **Productos artesanales:** la tabla fuente no tiene una columna de disponibilidad. Plata carga los productos existentes y todos los snapshots del historial de productos, incluso si corresponden a una eliminación.
- **Publicación de productos:** el identificador de artesano sale de `ID_PERSONA_ECOMMERCE`. Plata toma el nombre de `PERSONAS_ECOMMERCE`, y Oro lo guarda en `dim_artesano`. La tabla de productos permite que ese identificador sea nulo; esas filas deben revisarse antes de interpretar el análisis por artesano.

## Límites interpretativos

- El DWH analiza catálogo, precios, disponibilidad e historial de ofertas; las fuentes actuales no contienen transacciones de reserva o compra en este flujo.
- La relación de componentes entre planes, hospedajes y transportes se conserva en Bronce. No se convierte en un hecho de Oro en esta versión.
- El historial depende de las filas registradas por los triggers de OLTP. Si no se capturó un cambio, el DWH no inventa una versión ni su fecha.
- Los rangos de capacidad conservan la clasificación que ya estaba en el modelo; se deben confirmar con los usuarios antes de tratarlos como una regla definitiva.
