# Vistas analiticas de Oro

La capa Oro de este diseño expone vistas de consulta en PostgreSQL, no tablas fisicas de dimensiones ni hechos. Las tablas de Plata contienen los datos preparados y las vistas de Oro los presentan para los usos analiticos del proyecto.

## Vistas

| Vista | Uso | Fuente |
| --- | --- | --- |
| `oro.buscador_ia_viajeros` | Catalogo disponible de hoy, unificado por tipo de servicio. | `plata.hist_hospedajes`, `plata.hist_planes`, `plata.hist_transportes` y nombres de municipio/departamento en `bronce.ciudades` y `bronce.departamentos`. |
| `oro.reporte_leads_whatsapp` | Total de clics por aliado comercial y fecha. | `plata.fact_eventos_whatsapp` y `plata.dim_empresas`. |
| `oro.reporte_artesanias_vigentes` | Productos artesanales de hoy con su municipio. | `plata.hist_artesanias` y `bronce.ciudades`/`bronce.departamentos`. |

`FECHA_PROCESO` indica la fecha de cada fotografia. Las vistas de catalogo vigente filtran por `CURRENT_DATE`; el reporte de leads conserva agrupaciones para todas las fechas disponibles en Plata.

## Limites de analisis

- Los clics en WhatsApp representan leads o intenciones de contacto, no ventas confirmadas.
- La base no registra pedidos ni pagos; no se puede calcular el total vendido ni el dia de mayores ventas sin esos eventos.
- Los nombres de municipios y departamentos se consultan desde las tablas maestras de Bronce y no se duplican como dimensiones fisicas en Oro.
- Las fotografias de Plata se cargan diariamente; los nombres de municipios consultados por las vistas reflejan los valores actuales de Bronce.
