# Base de datos de TourismEasy

La aplicación usa PostgreSQL y accede a la base de datos mediante PDO. El esquema y los datos iniciales están en [`DB_TOURISMEASY.sql`](DB_TOURISMEASY.sql); las funciones SQL que invocan los endpoints PHP están agrupadas por entidad en [`../functions/`](../functions/), y los triggers están en [`../triggers/`](../triggers/).

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

El esquema crea las tablas de la aplicación y carga datos iniciales, incluyendo el departamento de Santander, sus municipios y registros de ejemplo. `USUARIOS` guarda directamente el perfil y las credenciales de administración; no existe una tabla genérica `PERSONAS` ni cuentas para viajeros. Las reseñas son públicas y se guardan con el nombre proporcionado por quien las publica; los likes se identifican por visitante. `TIPOS_DOCUMENTOS` se conserva porque las cuentas de artesanos/e-commerce todavía la utilizan. `CONTENIDO_PORTADA` y `ESTADO_INICIAL_PORTADA` almacenan las tarjetas administrables y el estado de carga inicial.

`FESTIVIDADES_SANTANDER` guarda también la categoría temática y `IMG_URL` para cada festividad. La columna de imagen sigue la misma longitud mínima que las demás columnas `IMG_URL`; las cargas desde el apartado **Festividades** del panel se alojan en Cloudinary. Las 48 festividades iniciales tienen una categoría asignada y, si no se ha cargado una imagen, el sitio muestra una imagen ilustrativa.

Las funciones se cargan por separado después del esquema. Si únicamente necesitas reemplazar una función en una base que ya tiene la estructura compatible, ejecuta el archivo correspondiente de `functions/`; `CREATE OR REPLACE FUNCTION` reemplaza la definición cuando la firma de retorno es compatible. `fn_listar_festividades()` ahora devuelve también categoría e imagen, por lo que PostgreSQL no permite ampliar directamente los parámetros `OUT` de la versión anterior. En una base que ya tiene esa versión, elimina manualmente la función anterior antes de ejecutar el archivo actualizado; el archivo SQL no contiene `DROP`. Esto no convierte `DB_TOURISMEASY.sql` en una actualización: nunca lo ejecutes sobre una base con datos.

### Validadores SQL compartidos

Las funciones SQL reutilizables para correo, celular, nombre, documento, código de ciudad, fecha de salida y color hexadecimal están en [`../functions/validaciones/`](../functions/validaciones/). Las funciones de registro y edición de cuentas, empresas, planes, hospedajes, productos artesanales y transporte, así como la configuración del tema y las festividades, las invocan para mantener las reglas de formato en el servidor. Los rangos reflejan el esquema y los flujos actuales: nombres de 2 a 50 caracteres, celulares de 7 a 15 dígitos con `+` inicial opcional, documentos de 6 a 10 dígitos, NIT de empresa de exactamente 10 dígitos, códigos de ciudad numéricos de 5 o 6 dígitos, fechas de salida de transporte desde hoy en adelante y colores RGB hexadecimales de siete caracteres (`#RRGGBB`). Los correos admiten hasta 254 caracteres y usan el patrón que ya tenían las restricciones SQL.

Al instalar o actualizar estas funciones en una base existente, carga primero los validadores y después las funciones que los usan. No es necesario alterar las tablas ni quitar sus restricciones `CHECK`:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\validaciones\fn_validar_correo.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\validaciones\fn_validar_celular.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\validaciones\fn_validar_nombre.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\validaciones\fn_validar_documento.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\validaciones\fn_validar_color_hex.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\validaciones\fn_validar_codigo_ciudad.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\validaciones\fn_validar_fecha_salida.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_empresas\fn_registrar_empresa.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_empresas\fn_actualizar_perfil_empresa.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_artesanos\fn_registrar_artesano.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_artesanos\fn_actualizar_contacto_artesano.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_actualizar_perfil_admin.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_actualizar_tema_global.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_festividades\fn_listar_festividades.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_festividades\fn_guardar_festividad.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_festividades\fn_eliminar_festividad.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_planes\fn_agregar_plan.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_planes\fn_editar_plan.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_hospedaje\fn_agregar_hospedaje.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_hospedaje\fn_editar_hospedaje.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_productos\fn_agregar_producto.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_productos\fn_editar_producto.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_transporte\fn_agregar_transporte.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_transporte\fn_editar_transporte.sql
```

En una base existente, carga primero los validadores y después cada función SQL actualizada que los utilice. `fn_validar_color_hex.sql` debe preceder a [`fn_actualizar_tema_global.sql`](../functions/crud_administracion/fn_actualizar_tema_global.sql) y [`fn_guardar_festividad.sql`](../functions/crud_festividades/fn_guardar_festividad.sql); `fn_validar_codigo_ciudad.sql` debe preceder a las funciones actualizadas de empresas, planes, hospedajes, productos, transporte y festividades; `fn_validar_fecha_salida.sql` debe preceder a las funciones de agregar y editar transporte. Reemplazar las funciones SQL no actualiza el código PHP del servidor: despliega también los endpoints PHP correspondientes desde el repositorio.

El esquema de Festividades de este archivo es para una instalación nueva: la tabla contiene directamente los campos de categoría e imagen, y sus funciones SQL los consultan y guardan. No incluye una migración ni instrucciones `ALTER` para bases existentes; no ejecutes el esquema completo sobre una base con datos. Las imágenes se suben desde el apartado **Festividades** del panel de administración a Cloudinary y quedan asociadas al guardar el registro.

`SESIONES_ACTIVAS` mantiene una reserva por cuenta para admin, empresa y artesano. La sesión caduca después de 10 minutos sin actividad; las solicitudes válidas renuevan ese tiempo y la cookie HTTP. Cerrar la ventana no cierra inmediatamente la sesión: se puede volver a entrar mientras no hayan pasado 10 minutos. Si se intenta acceder desde otro dispositivo mientras la sesión sigue activa, se envía al correo una solicitud de confirmación. Solo al aprobarla se envía un código de seis dígitos; el dispositivo anterior se desconecta cuando el código se valida correctamente. Las solicitudes vencen en 10 minutos y el código en 5 minutos; sus límites de intentos se administran desde la configuración de seguridad. La tabla `SOLICITUDES_INICIO_SESION` forma parte del esquema nuevo. Las reservas vencidas se liberan al intentar iniciar sesión. La duración de sesión se configura en [`../con_db/sesion_persistente.php`](../con_db/sesion_persistente.php). El token de dispositivo se conserva en una cookie `HttpOnly` por hasta 400 días, pero no mantiene activa una sesión vencida.

### Controles de seguridad configurables

El panel **Configuración de Administrador → Límites de seguridad** administra los controles del servidor. Los valores iniciales conservan el login en 3 fallos durante 5 minutos y bloqueo de 5 minutos, y el cambio de contraseña en 3 fallos durante 5 minutos y bloqueo de 5 minutos. El límite de cambios correctos es 3 por mes calendario; los restablecimientos mediante correo no se cuentan. También se aplican valores iniciales de 3 solicitudes de recuperación por correo cada 15 minutos, 5 validaciones de enlace inválidas por IP cada 15 minutos, 3 solicitudes de dispositivo por cuenta cada 15 minutos y 5 códigos de dispositivo incorrectos por solicitud en 5 minutos. Cada control permite cambiar cantidad, ventana y duración del bloqueo; el límite mensual solo aplica al cambio correcto de contraseña. Los intentos se configuran entre 1 y 10 (los códigos de dispositivo hasta 5 por la restricción existente), las ventanas entre 1 y 1.440 minutos y los bloqueos entre 1 y 10.080 minutos. El servidor valida rangos positivos y acotados, y registra el administrador, fecha y valores anteriores/nuevos en `AUDITORIA`.

Los intentos de login y de comprobación de contraseña actual usan contadores independientes. Las solicitudes de recuperación se cuentan incluso si el correo no corresponde a una cuenta, sin revelar si existe; los enlaces inválidos se limitan por IP. No se agrega límite a la comprobación de tokens aleatorios válidos: estos tienen 256 bits y solo se pueden usar una vez. Los restablecimientos de contraseña por correo siguen sin aumentar `CAMBIOS_CONTRASENA_CUENTA`.

En una instalación nueva, `DB_TOURISMEASY.sql` crea `CONFIGURACION_SEGURIDAD`, `INTENTOS_SEGURIDAD` y `BLOQUEOS_SEGURIDAD` con valores iniciales. Para una base existente, **no ejecutes el esquema completo**: después de respaldar la base, un responsable debe crear únicamente esas tres tablas y cargar las filas iniciales correspondientes a ese bloque del esquema. No se requiere `ALTER` ni `DROP`; los intentos previos de `INTENTOS_LOGIN` se conservan como historial, pero no se convierten en bloqueos activos al instalar el nuevo contador.

Después de crear las tablas, instala las funciones en este orden y despliega los PHP actualizados. Login y el resto de acciones sensibles usan directamente el mismo registrador configurable, distinguiéndose por el valor `CONTROL`. La tabla `INTENTOS_LOGIN` y sus filas históricas se conservan, pero el flujo nuevo no escribe en ella. Si una base ya tiene instalados los antiguos envoltorios `fn_registrar_intento_login` o `fn_verificar_bloqueo_login`, pueden permanecer sin uso; no es necesario ejecutar `DROP`:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_obtener_control_seguridad.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_verificar_bloqueo_seguridad.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_registrar_intento_seguridad.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_procesar_login.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_actualizar_contrasena_cuenta.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_operaciones_solicitud_dispositivo.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_listar_configuracion_seguridad.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_actualizar_configuracion_seguridad.sql
```

La aplicación requiere también el endpoint nuevo [`../admin/seguridad.php`](../admin/seguridad.php), los PHP actualizados de login, cambio de contraseña, recuperación y confirmación de dispositivo, y los componentes de configuración y menú compartido. No se ofrece una migración automática para bases existentes.

Este archivo representa una instalación nueva. Importa el esquema en una base vacía; no lo ejecutes sobre una base anterior para intentar actualizarla. Si tienes datos que conservar, haz un respaldo y conserva esa base por separado.

### Claves de municipio en rutas de transporte

Las instalaciones nuevas guardan `ID_CIUDAD_ORIGEN` y `ID_CIUDAD_DESTINO` en `TRANSPORTE`, con claves foráneas a `CIUDADES`. Para usar este modelo, crea una base vacía e importa `DB_TOURISMEASY.sql`; no se ofrecen migraciones ni scripts `ALTER` para actualizar bases existentes.

### Calendario administrable de festividades

La instalación nueva carga las 48 fechas iniciales en `FESTIVIDADES_SANTANDER`. El administrador puede gestionarlas desde el apartado **Festividades** del panel. Las funciones SQL para listar, guardar y eliminar festividades están en `functions/` y se instalan junto con el resto de funciones.

### Catálogos administrables

El panel **Catálogos** permite crear, renombrar y activar/desactivar tipos de plan, tipos de hospedaje, categorías artesanales, servicios de hospedaje y clases de transporte. La estructura nueva añade `TIPOS_HOSPEDAJE` y `CATEGORIAS_ARTESANIA`, agrega el estado a los tipos de plan y relaciona los catálogos con las publicaciones. Las opciones desactivadas dejan de aparecer para nuevas publicaciones; las publicaciones existentes conservan sus referencias y se siguen mostrando.

El código de una categoría artesanal se genera en `fn_guardar_catalogo` a partir de su nombre; al renombrarla, se conserva su código para no afectar productos ya relacionados.

Este cambio requiere una instalación nueva: respalda los datos que quieras conservar, crea una base vacía e importa `DB_TOURISMEASY.sql`. No basta con borrar solo las nuevas tablas porque las tablas existentes `TIPOS_DE_PLAN_TURISTICO`, `HOSPEDAJE` y `PRODUCTOS_ARTESANALES` también tienen cambios de esquema, y `CREATE TABLE IF NOT EXISTS` no actualiza estructuras existentes. No ejecutes el esquema sobre una base con datos ni se incluyen instrucciones `ALTER` o una migración.

El fragmento [`catalogos_tablas_inserts.sql`](./catalogos_tablas_inserts.sql) separa las definiciones de las tablas de sus datos iniciales. Es una referencia para instalación en una base vacía con las tablas base ya creadas; no es una actualización para una base existente.

Después de importar el esquema, instala las funciones nuevas y actualizadas junto con el resto de funciones de la aplicación:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_listar_catalogos.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_registrar_auditoria.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_guardar_catalogo.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_referencias\fn_datos_referencia.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_planes\fn_agregar_plan.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_planes\fn_editar_plan.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_hospedaje\fn_agregar_hospedaje.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_hospedaje\fn_editar_hospedaje.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_transporte\fn_editar_transporte.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_productos\fn_agregar_producto.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_productos\fn_editar_producto.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_productos\fn_obtener_producto.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_productos\fn_listar_productos.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_productos\fn_buscar_productos_publicos.sql
```

Sustituye el usuario y el nombre de la base de datos por los de tu instalación.

### Contenido administrable de la portada

El esquema base incluye las tablas necesarias para guardar contenido de portada y la lista de municipios de Santander. Los 87 nombres se consultan desde `CIUDADES`; las descripciones de las tarjetas están en `componentes/destinos.js` y cada ficha de municipio tiene una entrada propia en `ARTICULOS` de `componentes/articulos.js`. Las imágenes y videos que se actualizan desde el panel se guardan como contenido de portada. El carrusel muestra ocho municipios por página. El panel permite actualizar el contenido y los medios de las tarjetas.

En cada tarjeta del panel, el botón **Agregar al mapa** abre un cuadro exclusivo de configuración del mapa; para un destino ya seleccionado, aparece **Editar mapa**. Allí se puede buscar un municipio o lugar mediante Nominatim/OpenStreetMap, elegir el resultado y ajustar el marcador en el mapa para completar las coordenadas automáticamente. También se pueden agregar hasta tres palabras clave y quitar el destino del mapa. Esto se guarda dentro del artículo JSONB de `CONTENIDO_PORTADA`, pero es independiente de `PUBLICADO`: se puede mostrar un municipio en el mapa sin mostrar su tarjeta en el carrusel. La foto del popup reutiliza la URL de imagen del contenido de portada. La función `functions/crud_portada/fn_listar_destinos_mapa.sql` entrega al mapa solamente los municipios elegidos y los campos necesarios. El video de la ficha no se usa en la configuración ni en los marcadores del mapa.

En una base existente, instala la función actualizada de guardado y la nueva función de consulta del mapa:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_portada\fn_guardar_contenido_portada.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_portada\fn_listar_destinos_mapa.sql
```

Reemplaza `postgres` y `tourismeasy` por los valores de tu instalación. No se incluye migración ni se insertan municipios destacados automáticamente: después de instalar las funciones, abre **Destinos de la portada** en el panel, edita cada municipio que quieras mostrar, activa **Destacar en el mapa turístico**, completa sus coordenadas y palabras clave, y guarda. En instalaciones nuevas, abre primero el panel para que se inicialice `CONTENIDO_PORTADA`. No ejecutes `DB_TOURISMEASY.sql` sobre una base existente.

### Auditoría del panel administrador

La auditoría del panel muestra 20 eventos por página y permite filtrar por módulo; consulta los 100 eventos más recientes. Se registran los intentos fallidos de todas las cuentas y los inicios exitosos de administradores. Las solicitudes y actualizaciones de perfil de empresa quedan asociadas a la empresa. La única función de registro, `fn_registrar_auditoria`, admite el detalle usual o un paquete JSON interno para almacenar también los valores anteriores y nuevos en las columnas `REG_ANTERIOR` y `REG_NUEVO`, que ya existen en `AUDITORIA`. Los guardados de portada sin cambios no generan eventos.

Para actualizar una base existente, ejecuta primero la función de registro actualizada y la nueva función de consulta detallada; después ejecuta los archivos actualizados de las funciones existentes que registran esos cambios. Las funciones existentes conservan sus nombres y firmas. Se usa `CREATE OR REPLACE FUNCTION`; no se usa `ALTER`/`DROP`, no se crea una migración y no se modifica la estructura de las tablas:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_registrar_auditoria.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_listar_auditoria_detallada.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_empresas\fn_registrar_empresa.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_empresas\fn_actualizar_perfil_empresa.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_procesar_login.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_portada\fn_guardar_contenido_portada.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_portada\fn_eliminar_contenido_portada.sql
```

Reemplaza `postgres` y `tourismeasy` por los valores de tu instalación. `fn_listar_auditoria_detallada()` es de consulta; todos los registros se escriben por `fn_registrar_auditoria()`.

### Instalar las funciones SQL

Los endpoints PHP invocan las funciones definidas en `functions/`; están organizadas en carpetas `crud_planes`, `crud_hospedaje`, `crud_transporte`, `crud_productos`, `crud_empresas`, `crud_artesanos`, `crud_resenas`, `crud_portada`, `crud_festividades`, `crud_administracion`, `crud_metricas`, `crud_referencias`, `seguridad` y `funciones_comunes`. Hay que instalarlas todas para disponer del proyecto completo. Ejecuta el bloque siguiente en PowerShell **desde la raíz del repositorio**, después de importar el esquema en una base vacía. Instala primero auditoría, luego los scripts restantes y, al final, los wrappers que dependen de otras funciones y el inicializador de portada. Los triggers se instalan después de todas las funciones. `ON_ERROR_STOP` hace que el proceso se detenga si un archivo falla. Este procedimiento no es una migración y no debe usarse sobre una base existente.

Las búsquedas de Sue están separadas por categoría en archivos `fn_sue_buscar_*.sql` dentro de `functions/crud_referencias/`; `fn_sue_consultar_catalogo.sql` coordina las llamadas:

- Si recibe un municipio, primero busca su ID en `CIUDADES`. Si el nombre no existe, devuelve una lista vacía. Las categorías que admiten ese filtro reciben el ID y hacen su búsqueda específica.
- La categoría `municipios` es distinta del filtro anterior: llama a `fn_sue_buscar_municipios` para listar municipios, opcionalmente filtrados por el ID resuelto.
- `transportes` usa `fn_sue_buscar_transportes_ruta` con origen y destino vacíos; la búsqueda por ruta se hace directamente con esa función, no con el filtro de municipio de la coordinadora.
- Las festividades admiten filtros por municipio, mes y texto del nombre o descripción, para que una pregunta por las celebraciones del mes o por una festividad concreta no use la lista general.
- Una categoría no reconocida devuelve una lista vacía.

Si ya tienes una base instalada, carga las funciones nuevas desde la raíz del repositorio y después de sus dependencias existentes:

```powershell
$db = 'tourismeasy'
$user = 'postgres'
$archivos = @(
	'.\functions\crud_empresas\fn_obtener_meta_edicion_perfil_empresa.sql',
	'.\functions\seguridad\fn_obtener_nombre_recuperacion.sql',
	'.\functions\crud_referencias\fn_sue_buscar_transportes_ruta.sql',
	'.\functions\seguridad\fn_operaciones_sesion_activa.sql',
	'.\functions\seguridad\fn_operaciones_solicitud_dispositivo.sql',
	'.\functions\crud_referencias\fn_sue_buscar_planes.sql',
	'.\functions\crud_referencias\fn_sue_buscar_hospedajes.sql',
	'.\functions\crud_referencias\fn_sue_buscar_productos.sql',
	'.\functions\crud_referencias\fn_sue_buscar_artesanos.sql',
	'.\functions\crud_referencias\fn_sue_buscar_empresas.sql',
	'.\functions\crud_referencias\fn_sue_buscar_festividades.sql',
	'.\functions\crud_referencias\fn_sue_buscar_municipios.sql',
	'.\functions\crud_referencias\fn_sue_consultar_catalogo.sql'
)

foreach ($archivo in $archivos) {
	& psql -v ON_ERROR_STOP=1 -U $user -d $db -f $archivo
	if ($LASTEXITCODE -ne 0) { throw "Falló $archivo" }
}
```

No ejecutes `DB_TOURISMEASY.sql` sobre una base existente.

Las empresas pueden actualizar razón social, correo institucional, correo de acceso, teléfono y municipio una vez por mes calendario. El correo de acceso se guarda en `USUARIOS_EMPRESA.EMAIL_LOGIN` y se usa para iniciar sesión. El NIT y el sector no se pueden cambiar desde el perfil.

```powershell
$db = 'tourismeasy'
$user = 'postgres' # Sustituye por tu usuario local de PostgreSQL
$dir = '.\functions'
$archivosFuncion = @(Get-ChildItem $dir -Recurse -File -Filter '*.sql')
$finales = @(
	'fn_eliminar_transporte_empresa.sql',
	'fn_guardar_hospedaje.sql',
	'fn_guardar_producto.sql',
	'fn_inicializar_contenido_portada.sql',
	'fn_procesar_login.sql',
	'fn_sue_consultar_catalogo.sql'
)

$auditoria = $archivosFuncion | Where-Object { $_.Name -eq 'fn_registrar_auditoria.sql' } | Select-Object -First 1
& psql -v ON_ERROR_STOP=1 -U $user -d $db -f $auditoria.FullName
if ($LASTEXITCODE -ne 0) { throw 'Falló fn_registrar_auditoria.sql' }

$archivosFuncion |
	Where-Object { $_.Name -ne 'fn_registrar_auditoria.sql' -and $_.Name -notin $finales } |
	Sort-Object Name |
	ForEach-Object {
		& psql -v ON_ERROR_STOP=1 -U $user -d $db -f $_.FullName
		if ($LASTEXITCODE -ne 0) { throw "Falló $($_.Name)" }
	}

foreach ($archivo in $finales) {
	$rutaArchivo = $archivosFuncion | Where-Object { $_.Name -eq $archivo } | Select-Object -First 1
	if (-not $rutaArchivo) { throw "No se encontró $archivo dentro de $dir" }
	& psql -v ON_ERROR_STOP=1 -U $user -d $db -f $rutaArchivo.FullName
	if ($LASTEXITCODE -ne 0) { throw "Falló $archivo" }
}

$dirTriggers = '.\triggers'
Get-ChildItem $dirTriggers -Filter '*.sql' |
	Sort-Object Name |
	ForEach-Object {
		& psql -v ON_ERROR_STOP=1 -U $user -d $db -f $_.FullName
		if ($LASTEXITCODE -ne 0) { throw "Falló $($_.Name)" }
	}
```

El procedimiento incluye recursivamente los scripts SQL de `functions/` y luego instala los archivos de `triggers/`. `crud_hospedaje/fn_buscar_hospedaje_publico.sql` instala la búsqueda pública de hospedajes por municipio, accesibilidad y capacidad; `crud_planes/fn_buscar_planes_publicos.sql`, la búsqueda de planes por municipio, tipo y accesibilidad; y `crud_productos/fn_buscar_productos_publicos.sql`, la búsqueda de productos artesanales por texto, categoría y municipio. Entre las dependencias ordenadas al final están eliminación de transporte empresa, guardado unificado de hospedaje y productos, inicialización de portada y coordinación del login. Los triggers actualizan `FECHA_MODIFICACION` y guardan snapshots históricos automáticamente. En las actualizaciones solo registran una nueva fecha o snapshot si cambian datos; para la comparación se ignora `FECHA_MODIFICACION` y, en el historial de cuentas de e-commerce, también la contraseña, que no forma parte del snapshot.

Para aplicar únicamente esta optimización en una base que ya tiene instalados los triggers, ejecuta las seis funciones actualizadas desde la raíz del repositorio. Usa `CREATE OR REPLACE FUNCTION`; no es necesario volver a crear los triggers ni ejecutar scripts de migración:

```powershell
$db = 'tourismeasy'
$user = 'postgres'
$funciones = @(
	'.\functions\funciones_comunes\fn_actualizar_fecha_modificacion.sql',
	'.\functions\crud_planes\fn_historico_plan_turistico.sql',
	'.\functions\crud_hospedaje\fn_historico_hospedaje.sql',
	'.\functions\crud_productos\fn_historico_producto_artesanal.sql',
	'.\functions\crud_transporte\fn_historico_transporte.sql',
	'.\functions\crud_artesanos\fn_historico_usuario_ecommerce.sql'
)

foreach ($funcion in $funciones) {
	& psql -v ON_ERROR_STOP=1 -U $user -d $db -f $funcion
	if ($LASTEXITCODE -ne 0) { throw "Falló $funcion" }
}
```

El cambio de contraseña de administrador, empresa y artesano usa el componente compartido `componentes/cambio-contrasena.js` y la función `functions/seguridad/fn_actualizar_contrasena_cuenta.sql`. El formulario permite hasta tres cambios exitosos por cuenta en cada mes calendario; el conteo comienza al desplegar esta función y no incluye restablecimientos desde el enlace de recuperación. La tabla de conteo y su índice están definidos en `DB_TOURISMEASY.sql`.

Instala las funciones SQL:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\seguridad\fn_actualizar_contrasena_cuenta.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_actualizar_contrasena_admin.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_empresas\fn_actualizar_contrasena_empresa.sql
```

La configuración del artesano carga y actualiza sus datos de contacto mediante `e-commerce/perfil_artesano.php` y las funciones `functions/crud_artesanos/fn_obtener_perfil_artesano.sql` y `functions/crud_artesanos/fn_actualizar_contacto_artesano.sql`. Al cambiar el correo, se actualizan tanto el correo de acceso como el de contacto. Instala estas funciones en una base existente:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_artesanos\fn_obtener_perfil_artesano.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_artesanos\fn_actualizar_contacto_artesano.sql
```

Después despliega los PHP de `login/actualizar_contrasena_cuenta.php`, `login/actualizar_contrasena_admin.php`, `login/actualizar_contrasena_empresa.php`, `e-commerce/actualizar_contrasena_artesano.php` y `e-commerce/perfil_artesano.php`, además de los componentes compartidos. Reemplaza el usuario y la base de datos por los de tu instalación.

El informe mensual del administrador consulta únicamente tablas OLTP mediante `functions/crud_administracion/fn_informe_mensual_admin.sql`.

### Registro y estadísticas de clics de WhatsApp

`LOGS_CLICS_WEB_EXTERNOS` guarda fecha, categoría, producto, dispositivo (user agent), empresa cuando corresponde y `ID_PERSONA_ECOMMERCE` para identificar al artesano asociado al clic. En una instalación nueva, esta última columna tiene una llave foránea a `PERSONAS_ECOMMERCE`; no se reutiliza `ID_EMPRESA` para representar artesanos.

`functions/crud_metricas/fn_registrar_click_whatsapp.sql` valida el producto y registra el evento con su dueño. `functions/crud_metricas/fn_estadisticas_clicks.sql` devuelve el resumen y los 20 eventos recientes de la página solicitada; permite estadísticas globales para administración y filtrado por la cuenta de empresa o artesano autenticada. El endpoint PHP toma la identidad de la sesión, no de un identificador enviado por el navegador. Los paneles de empresas y artesanos reutilizan el tablero de clics.

El perfil del administrador muestra también los clics globales de WhatsApp de los últimos 30 días. `functions/crud_metricas/fn_clics_whatsapp_ultimos_30_dias_admin.sql` calcula ese total, que entrega `login/get_estadisticas_admin.php` junto con las otras estadísticas globales.

Para una base nueva, importa primero `DB_TOURISMEASY.sql` y luego instala las funciones mediante el procedimiento de arriba. Si la tabla existente no incluye `ID_PERSONA_ECOMMERCE`, estas funciones no son compatibles con ella. No se incluye migración automática ni se ejecutó SQL contra una base productiva.

Si necesitas cargar las funciones de clics por separado después de importar el esquema (por ejemplo, si ya ejecutaste el instalador general), usa desde la raíz del repositorio:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_metricas\fn_registrar_click_whatsapp.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_metricas\fn_estadisticas_clicks.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_metricas\fn_clics_whatsapp_ultimos_30_dias_admin.sql
```

No es necesario ejecutarlas otra vez si el instalador general ya terminó correctamente.

El bloque inicia `psql` una vez por archivo; para evitar que solicite la contraseña repetidamente, configura el archivo `pgpass.conf` de PostgreSQL para tu usuario local o ejecuta cada script desde pgAdmin.

Este procedimiento está destinado a una base vacía recién creada; no lo uses sobre una base con datos o funciones en uso. El límite mensual del perfil forma parte del esquema inicial de `USUARIOS_EMPRESA` en `DB_TOURISMEASY.sql`, y la lógica de edición se instala desde `functions/crud_empresas/fn_actualizar_perfil_empresa.sql`. Solo las cuentas con estado `ACTIVO` pueden editar su perfil; las solicitudes pendientes no pueden hacerlo.


## Configurar el backend

La conexión PDO se encuentra en [`../con_db/db.php`](../con_db/db.php). Actualmente host, puerto, nombre de base de datos, usuario y contraseña están escritos en ese archivo versionado. No publiques credenciales; rótalas si siguen activas y migra la configuración a variables de entorno o un archivo local excluido de Git antes de compartir o desplegar el proyecto.

El nombre de base de datos usado actualmente por la configuración es `tourismeasy`, con el puerto PostgreSQL habitual `5432`. La disponibilidad de las funciones del sistema depende de haber importado también los scripts SQL necesarios de `functions/`.

## Accesibilidad y base de datos

El menú de accesibilidad y la declaración emergente del pie de página son funciones de la interfaz y no requieren tablas, funciones SQL ni migraciones de PostgreSQL. Las preferencias de tamaño de texto, contraste, lectura y selección de idioma se guardan en el almacenamiento local del navegador; no se guardan en esta base de datos. Para revisar qué herramientas ofrece el menú y el alcance informativo de la declaración, consulta la sección de accesibilidad del [README principal](../README.md).

## Organización del modelo

El esquema reúne entidades para:

- **Ubicación y catálogos:** departamentos, ciudades, tipos de documento, tipos de plan, servicios de hospedaje y clases de transporte.
- **Cuentas y empresas:** el perfil admin está integrado en `USUARIOS`, junto con empresas, usuarios de empresa y cuentas de artesanos/e-commerce. Los viajeros no se registran ni inician sesión.
- **Servicios turísticos:** planes, hospedajes y transporte, con relaciones entre planes y componentes, hospedajes y servicios, y transporte y clases.
- **Comercio artesanal:** productos, categorías y datos de sus vendedores.
- **Comunidad:** reseñas públicas sin cuenta y likes identificados por navegador visitante.
- **Administración y soporte:** configuración por rol, festividades, auditoría, estadísticas y control de limpieza de reseñas.
- **Seguridad e historial:** historial de contraseñas y cambios, intentos de inicio de sesión y tokens de recuperación. La recuperación por correo funciona para admin, empresa y artesano: `TOKENS_RECUPERACION` relaciona el token con `USUARIOS`, `USUARIOS_EMPRESA` o `USUARIOS_ECOMMERCE`, y las funciones `fn_solicitar_recuperacion` y `fn_restablecer_contrasena` guardan el token y actualizan la contraseña correspondiente.

Las claves foráneas, restricciones `CHECK` e índices únicos del archivo SQL validan relaciones y valores como estados, puntuaciones, formatos de correo y disponibilidad. Las reseñas públicas se publican con nombre y sin cuenta; los likes se identifican por un token local del navegador. `datos_referencia.php` entrega ciudades y las opciones activas de tipos de plan, hospedaje y categorías artesanales para los formularios.

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

## Tema global del sitio

La tabla `CONFIGURACION_TEMA_GLOBAL` y la paleta inicial se crean al importar `DB_TOURISMEASY.sql`. La paleta global se administra desde **Configuración** en el panel de administradores. Después de crear la base de datos, instala las funciones SQL de lectura y actualización:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_obtener_tema_global.sql
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_administracion\fn_actualizar_tema_global.sql
```

Reemplaza el usuario y la base de datos por los de tu instalación. También puedes ejecutar ambos archivos en pgAdmin. No vuelvas a ejecutar `DB_TOURISMEASY.sql` sobre una base con datos.

### Estadísticas del perfil de empresa

El perfil de empresa y el panel de empresa comparten `fn_estadisticas_empresa`: devuelve los servicios activos, el total registrado, los clics de WhatsApp de los últimos 30 días y los datos de accesibilidad existentes. En una base existente, instala la definición actualizada:

```powershell
psql -v ON_ERROR_STOP=1 -U postgres -d tourismeasy -f .\functions\crud_empresas\fn_estadisticas_empresa.sql
```

El archivo elimina y recrea esa función porque PostgreSQL no permite cambiar con `CREATE OR REPLACE` las columnas de su tipo de retorno. Los dos endpoints PHP ya consumen la misma función. Reemplaza el usuario y la base de datos por los de tu instalación. No se requieren cambios de esquema ni ejecutar `DB_TOURISMEASY.sql`.
