# Modelo dimensional de Oro

El esquema `ORO` contiene dimensiones y tablas de hechos físicas, creadas y cargadas por `sql/3_oro/1_tablas_y_carga_oro.sql`.

## Dimensiones

| Tabla | Contenido |
| --- | --- |
| `oro.dim_departamento` | Departamentos asociados a ciudades. |
| `oro.dim_ciudad` | Ciudades y su departamento. |
| `oro.dim_empresas` | Empresas proveedoras de servicios turísticos. |

## Hechos

| Tabla | Contenido |
| --- | --- |
| `oro.hecho_oferta_turistica` | Fotos diarias de hospedajes, planes y transportes. |
| `oro.hecho_producto_artesanal` | Fotos diarias de productos artesanales. |
| `oro.hecho_eventos_whatsapp` | Clics en WhatsApp, con fecha, ciudad, categoría, producto de origen y dispositivo. |

En `HECHO_EVENTOS_WHATSAPP`, `SK_EMPRESA` puede ser nulo para artesanías, cuyo contacto corresponde al artesano y no a una empresa turística. Los demás tipos de clic se asocian a una empresa. `ID_CLICK_ORIGEN` identifica de forma única el evento original y `FECHA_PROCESO` conserva la fecha del clic. Los clics son leads o intenciones de contacto; no son ventas confirmadas.

La vista `oro.buscador_ia_viajeros` presenta las ofertas turísticas disponibles hoy. `oro.reporte_leads_whatsapp` agrupa los clics por fecha, categoría, empresa o contacto artesanal y ciudad. Las tablas de hechos se cargan a partir de las fotos de Plata; ejecuta el script de Oro después de la transformación diaria.

La base no registra pedidos ni pagos, por lo que este modelo no permite calcular ventas confirmadas.
