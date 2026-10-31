# Modelo dimensional de Oro

El DWH conserva todas las tablas originales en Bronce. Por ahora, Plata y Oro preparan y analizan únicamente hospedajes disponibles.

## Dimensiones

| Tabla | Contenido e historial |
| --- | --- |
| `oro.dim_departamento` | Catálogo de departamentos. |
| `oro.dim_ciudad` | Ciudades relacionadas con su departamento. Se actualiza como dimensión tipo 1 porque OLTP no conserva cambios históricos de ciudades. |
| `oro.dim_hospedaje` | Versiones SCD tipo 2 de los hospedajes disponibles en cada versión, con inicio, fin y estado actual. Las versiones anteriores se obtienen del historial capturado por OLTP. La vigencia indica el período de validez de una versión; no es el indicador de disponibilidad. |
| `oro.dim_rango_capacidad` | Segmentos de capacidad: `1-10`, `11-20` y `21+`. |

## Hechos y grano

| Tabla | Grano | Medidas |
| --- | --- | --- |
| `oro.hecho_capacidad_hospedaje` | Una fila por versión histórica disponible de un hospedaje. | Capacidad máxima, precio por noche, acción histórica y usuario registrado por el trigger. |

La capacidad exacta se guarda como medida numérica y el rango como dimensión analítica; no se pierde el valor original al clasificarlo. El historial conserva cada versión según sus fechas reales de vigencia SCD2; por ahora no se crean reportes separados al cierre diario, mensual o trimestral.

El modelo analítico solo carga hospedajes disponibles. Si un hospedaje deja de estar disponible, la última versión disponible permanece como historia y se cierra; no se agrega una versión no disponible al catálogo analítico.

El usuario de `HECHO_CAPACIDAD_HOSPEDAJE` es el valor guardado por el trigger de OLTP y corresponde al usuario de base de datos que registró el evento; no necesariamente identifica a la persona final que usó la aplicación. No se almacena una fecha de proceso; las fechas de los cambios proceden del historial y de la vigencia SCD2.

## Límites interpretativos

- Los rangos de capacidad preservan los límites ya usados por el modelo; los usuarios deben confirmar si son categorías útiles para el negocio.
- La historia de hospedajes depende de las filas existentes en `HISTORICO_HOSPEDAJE` y de que el trigger haya estado activo cuando ocurrió el cambio.
