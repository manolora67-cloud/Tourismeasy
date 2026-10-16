# Base de datos de TourismEasy

La aplicación usa PostgreSQL y accede a la base de datos mediante PDO. El esquema y los datos iniciales están en [`DB_TOURISMEASY.sql`](DB_TOURISMEASY.sql); las funciones SQL que invocan los endpoints PHP están en [`../funciones/`](../funciones/).

## Requisitos

- PostgreSQL 9.5 o posterior (el esquema utiliza `ON CONFLICT`). No se ha declarado ni verificado aquí una versión máxima.
- `psql` en el PATH, o pgAdmin/otra herramienta que pueda ejecutar archivos SQL.
- PHP con la extensión `pdo_pgsql` para que el backend se conecte a PostgreSQL.

## Crear e importar la base de datos

Desde PowerShell, en la raíz del repositorio, crea la base de datos:

```powershell
createdb -U postgres tourismeasy
```

Importa el esquema y los datos iniciales:

```powershell
psql -U postgres -d tourismeasy -f .\db\DB_TOURISMEASY.sql
```

El usuario `postgres` del ejemplo es el usuario local de PostgreSQL; reemplázalo por el que corresponda a tu instalación. También puedes crear `tourismeasy` desde pgAdmin y ejecutar allí el archivo SQL.

El esquema nuevo crea 35 tablas y carga datos iniciales, incluyendo el departamento de Santander, sus municipios y registros de ejemplo. `USUARIOS` guarda directamente el perfil y las credenciales de administración; no existe una tabla genérica `PERSONAS` ni cuentas para viajeros. Las reseñas son públicas y se guardan con el nombre proporcionado por quien las publica; los likes se identifican por visitante. `TIPOS_DOCUMENTOS` se conserva porque las cuentas de artesanos/e-commerce todavía la utilizan. `CONTENIDO_PORTADA` y `ESTADO_INICIAL_PORTADA` almacenan las tarjetas administrables y el estado de carga inicial.

Este archivo representa una instalación nueva. Importa el esquema en una base vacía; no lo ejecutes sobre una base anterior para intentar actualizarla. Si tienes datos que conservar, haz un respaldo y conserva esa base por separado.

### Contenido administrable de la portada

El esquema base ya incluye las tablas necesarias para administrar tarjetas y artículos. Al abrir por primera vez el panel de administración sobre una base nueva, se copian automáticamente a PostgreSQL los ocho destinos y artículos iniciales del sitio. No ejecutes este archivo sobre una base existente para actualizarla: está pensado para instalar el proyecto en una base vacía.

### Instalar las funciones SQL

Los endpoints PHP invocan las funciones definidas en `funciones/`; hay que instalarlas todas para disponer del proyecto completo. Ejecuta el bloque siguiente en PowerShell **desde la raíz del repositorio**, después de importar el esquema. Instala primero auditoría, luego los scripts restantes y, al final, los wrappers que dependen de otras funciones y el inicializador de portada. `ON_ERROR_STOP` hace que el proceso se detenga si un archivo falla.

```powershell
$db = 'tourismeasy'
$user = 'postgres' # Sustituye por tu usuario local de PostgreSQL
$dir = '.\funciones'
$finales = @(
	'fn_eliminar_transporte_empresa.sql',
	'fn_guardar_hospedaje.sql',
	'fn_guardar_producto.sql',
	'fn_inicializar_contenido_portada.sql'
)

& psql -v ON_ERROR_STOP=1 -U $user -d $db -f (Join-Path $dir 'fn_registrar_auditoria.sql')
if ($LASTEXITCODE -ne 0) { throw 'Falló fn_registrar_auditoria.sql' }

Get-ChildItem $dir -Filter '*.sql' |
	Where-Object { $_.Name -ne 'fn_registrar_auditoria.sql' -and $_.Name -notin $finales } |
	Sort-Object Name |
	ForEach-Object {
		& psql -v ON_ERROR_STOP=1 -U $user -d $db -f $_.FullName
		if ($LASTEXITCODE -ne 0) { throw "Falló $($_.Name)" }
	}

foreach ($archivo in $finales) {
	& psql -v ON_ERROR_STOP=1 -U $user -d $db -f (Join-Path $dir $archivo)
	if ($LASTEXITCODE -ne 0) { throw "Falló $archivo" }
}
```

El procedimiento incluye los 68 scripts SQL del directorio, incluida `fn_toggle_disponibilidad_transporte.sql`, que se conserva aunque los endpoints actuales no la invocan. Las dependencias ordenadas al final son: eliminación de transporte empresa, guardado unificado de hospedaje y productos, e inicialización del contenido de portada. Los scripts actualizados de listado para hospedaje y transporte también se instalan con este procedimiento.

El bloque inicia `psql` una vez por archivo; para evitar que solicite la contraseña repetidamente, configura el archivo `pgpass.conf` de PostgreSQL para tu usuario local o ejecuta cada script desde pgAdmin.

Este procedimiento está destinado a una base vacía recién creada. Algunos scripts reemplazan funciones existentes con `DROP FUNCTION`; no lo uses como migración sobre una base con datos o funciones en uso. Para actualizar una instalación existente, respalda primero la base y prepara una migración compatible con sus dependencias.


## Configurar el backend

La conexión PDO se encuentra en [`../con_db/db.php`](../con_db/db.php). Actualmente host, puerto, nombre de base de datos, usuario y contraseña están escritos en ese archivo versionado. No publiques credenciales; rótalas si siguen activas y migra la configuración a variables de entorno o un archivo local excluido de Git antes de compartir o desplegar el proyecto.

El nombre de base de datos usado actualmente por la configuración es `tourismeasy`, con el puerto PostgreSQL habitual `5432`. La disponibilidad de las funciones del sistema depende de haber importado también los scripts SQL necesarios de `funciones/`.

## Organización del modelo

El esquema reúne entidades para:

- **Ubicación y catálogos:** departamentos, ciudades, tipos de documento, tipos de plan, servicios de hospedaje y clases de transporte.
- **Cuentas y empresas:** el perfil admin está integrado en `USUARIOS`, junto con empresas, usuarios de empresa y cuentas de artesanos/e-commerce. Los viajeros no se registran ni inician sesión.
- **Servicios turísticos:** planes, hospedajes y transporte, con relaciones entre planes y componentes, hospedajes y servicios, y transporte y clases.
- **Comercio artesanal:** productos, categorías y datos de sus vendedores.
- **Comunidad:** reseñas públicas sin cuenta y likes identificados por navegador visitante.
- **Administración y soporte:** configuración por rol, festividades, auditoría, estadísticas y control de limpieza de reseñas.
- **Seguridad e historial:** historial de contraseñas y cambios, intentos de inicio de sesión y tokens de recuperación.

Las claves foráneas, restricciones `CHECK` e índices únicos del archivo SQL validan relaciones y valores como estados, puntuaciones, formatos de correo y disponibilidad. Las reseñas públicas se publican con nombre y sin cuenta; los likes se identifican por un token local del navegador. `datos_referencia.php` solo entrega ciudades y tipos de plan, que son las listas usadas por los formularios vigentes.

## Datos iniciales y producción

El script incluye datos de demostración, entre ellos una cuenta de administración y cuentas de empresa. No uses esas cuentas ni sus contraseñas derivadas en producción: cambia o elimina los registros de ejemplo, crea credenciales nuevas y revisa el método de almacenamiento de contraseñas antes de poner la base de datos en servicio real.

No apliques este esquema sobre una base existente: aunque las tablas se crean con `IF NOT EXISTS` y muchos datos usan `ON CONFLICT DO NOTHING`, el archivo está destinado a una instalación nueva y no actualiza estructuras previas.

## Copia de seguridad y restauración

Ejemplo de respaldo en formato SQL:

```powershell
pg_dump -U postgres -d tourismeasy -f .\tourismeasy-backup.sql
```

Para restaurar el archivo en una base previamente creada:

```powershell
psql -U postgres -d tourismeasy -f .\tourismeasy-backup.sql
```

Guarda los respaldos fuera del repositorio y restringe el acceso: pueden contener datos personales.
