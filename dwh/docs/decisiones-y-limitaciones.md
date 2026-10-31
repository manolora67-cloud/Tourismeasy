# Decisiones y limitaciones

## Alcance del DWH

El objetivo de Oro es responder preguntas analíticas que no son simples consultas operativas del OLTP. Las búsquedas de catálogo y la operación diaria permanecen en la aplicación transaccional. Power BI consulta hechos, dimensiones y vistas consolidadas; la limpieza y las reglas de transformación se ejecutan antes, en Bronce y Plata.

Bronce copia todas las tablas de `public` sin cambiar sus filas ni columnas. Plata limpia y selecciona atributos; Oro no consulta directamente las tablas de `public` o Bronce.
No se almacena `FECHA_PROCESO`: el ETL no crea una fecha de negocio. El análisis temporal de hospedajes usa las fechas reales de modificación y del historial de OLTP.

## Historial SCD tipo 2

- `oro.dim_hospedaje` utiliza los snapshots anteriores de `bronce.historico_hospedaje`, transformados en `plata.hist_cambios_hospedaje`, y el estado actual de `plata.hospedajes_disponibles`. Al cambiar o dejar de estar disponible un hospedaje, se cierra la versión disponible y se conserva el historial.
- `oro.dim_ciudad` y `oro.dim_departamento` son catálogos tipo 1. La base OLTP no conserva un historial de sus cambios.
- La historia disponible depende de que las tablas y triggers de OLTP hayan registrado los cambios. No se fabrican versiones ni fechas que la fuente no tenga.

## Granularidad y consolidación

El hecho de capacidad tiene una fila por versión histórica del hospedaje. El valor exacto de capacidad se conserva y se clasifica en rangos ya usados por el modelo: `1-10`, `11-20` y `21+`. Esos rangos son una propuesta técnica pendiente de validación con los usuarios.

El historial conserva cada versión del hospedaje con sus fechas reales SCD2. Por ahora no se crean reportes separados de capacidad al cierre diario, mensual o trimestral; se pueden agregar cuando los usuarios confirmen qué consolidación necesitan.

Por ahora, Oro conserva el estado y el historial SCD2 de hospedajes. Los análisis estadísticos y las consolidaciones se definirán más adelante con los usuarios.

## Privacidad y acceso

Bronce copia todas las columnas de las tablas de `public`, entre ellas algunos datos de contacto y snapshots históricos. Restringe el acceso a ese esquema. Plata y Oro no deben exponer credenciales, contactos ni datos que no hagan falta para las preguntas analíticas.

## Límites de negocio

- La extracción de Bronce es completa. Al agregar una tabla en `public`, ejecuta de nuevo la creación de tablas de Bronce y la extracción. Solo agrega una transformación en Plata si esa tabla se necesita para el análisis.
