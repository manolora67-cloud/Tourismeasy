# TourismEasy

TourismEasy es una plataforma web de turismo inclusivo enfocada en Santander, Colombia. Conecta a viajeros con empresas y experiencias turísticas, con información de accesibilidad para ayudar a planear los viajes.

## Funcionalidades

- Exploración de destinos, planes turísticos, hospedajes y transporte.
- Mapa interactivo de destinos turísticos en la portada. Desde el panel de administración se eligen los municipios, sus coordenadas y hasta tres palabras clave; el mapa reutiliza la foto de Cloudinary guardada para cada municipio, sin crear tarjetas adicionales. Está implementado con Leaflet y OpenStreetMap; sus archivos propios están en [mapa_interactuable/](mapa_interactuable/). No requiere clave de API, pero sí conexión a internet.
- Acceso para administración y empresas, con solicitud de registro empresarial.
- Carrusel de los 87 municipios de Santander en la portada, con ocho tarjetas por página y navegación con flechas. Los nombres se consultan de la tabla `CIUDADES`; cada municipio tiene una tarjeta descrita en [componentes/destinos.js](componentes/destinos.js) y una ficha de destino propia en `ARTICULOS` de [componentes/articulos.js](componentes/articulos.js). Desde el panel se pueden actualizar las imágenes y los videos.
- Atención y contacto de viajeros por WhatsApp; no se crean cuentas de viajeros.
- Gestión de servicios y productos artesanales.
- Reseñas y reacciones de viajeros.
- Perfiles y preferencias de administración y empresas.
- Sesiones de administración, empresas y artesanos que se recuerdan hasta 30 días desde el último uso, salvo que se cierre sesión manualmente.
- Recuperación de contraseña por correo electrónico para administración, empresas y artesanos del e-commerce.
- Asistente virtual Sue para preguntas sobre turismo en Santander. Consulta en la base de datos transportes, hospedajes, planes, empresas, artesanos, productos artesanales, festividades y municipios; si Groq no está disponible, responde directamente con esos datos.
- Carga de imágenes mediante Cloudinary.

## Tecnologías

- Interfaz: HTML, CSS y JavaScript.
- Backend: PHP.
- Base de datos: PostgreSQL mediante PDO.
- Correo: PHPMailer, instalado con Composer.
- Servicios externos: Groq para el asistente, Cloudinary para imágenes, Leaflet desde un CDN y mapas de OpenStreetMap.

## Requisitos

- PHP 7.3 o posterior con `pdo_pgsql` y `mbstring`. Para carga de imágenes a Cloudinary también se requiere `curl`; para SMTP cifrado, `openssl`. `fileinfo` habilita la validación MIME de imágenes.
- Composer.
- PostgreSQL 9.5 o posterior (el esquema usa `ON CONFLICT`) y su cliente `psql` o una herramienta gráfica como pgAdmin.
- Una base de datos inicializada con el esquema del proyecto.

## Instalación y ejecución local

1. Clona el repositorio y entra en la carpeta del proyecto.
2. Instala las dependencias de PHP:

   ```sh
   composer install
   ```

3. Crea la base de datos e importa el esquema y los datos de referencia. Sigue la [guía de la base de datos](db/README.md).
4. Configura la conexión PostgreSQL de [con_db/db.php](con_db/db.php) para tu instancia local. La configuración está en un archivo versionado; no publiques cambios que incluyan credenciales.
5. Configura los servicios externos que necesites. Para Groq, copia `api/config.local.php.example` como `api/config.local.php` y reemplaza el texto de ejemplo por tu llave. Ese archivo está excluido de Git: en el servidor del SENA debes cargarlo por separado y mantenerlo privado. También se puede usar la variable de entorno `GROQ_API_KEY`, que tiene prioridad. Sin una llave válida, el asistente usa respuestas locales. Cloudinary y el correo aún tienen credenciales configuradas en el código; no los habilites en un entorno compartido hasta migrarlas a una configuración local y no versionada.
6. Desde la raíz del proyecto, inicia el servidor integrado de PHP:

   ```sh
   php -S localhost:8000
   ```

7. Abre [http://localhost:8000](http://localhost:8000).

El servidor integrado de PHP es para desarrollo local, no para producción. Para desplegar, utiliza un servidor web compatible con PHP y configura la base de datos, HTTPS, permisos y credenciales fuera del código versionado.

## Estructura principal

| Ruta | Contenido |
| --- | --- |
| [index.html](index.html) | Página principal. |
| [html/](html/) | Páginas de acceso, perfiles, paneles y catálogos. |
| [css/](css/) | Estilos de la interfaz. |
| [js/](js/), [componentes/](componentes/) | Lógica del navegador y componentes reutilizables. |
| [login/](login/), [recuperacion/](recuperacion/), [resenas/](resenas/) | Endpoints de cuentas, recuperación y reseñas. |
| [planes/](planes/), [hospedaje/](hospedaje/), [transporte/](transporte/) | Endpoints de servicios turísticos. |
| [e-commerce/](e-commerce/) | Endpoints de productos y cuentas de artesanos. |
| [admin/](admin/) | Endpoint de contenido administrable de portada. |
| [api/](api/) | Asistente y configuración de servicios externos. |
| [con_db/](con_db/) | Conexión PDO y utilidades de sesión. |
| [db/](db/) | Esquema, datos iniciales y migraciones de PostgreSQL. |
| [funciones/](funciones/) | Funciones SQL utilizadas por el backend. |
| [mapa_interactuable/](mapa_interactuable/) | JavaScript y estilos del mapa turístico de la portada. |
| [img/](img/), [audio-video/](audio-video/) | Recursos multimedia del sitio. Las imágenes subidas se alojan en Cloudinary. |

Leaflet 1.9.4 se carga desde el CDN de unpkg mediante etiquetas `<link>` y `<script>` en [index.html](index.html); no se instaló ni descargó con un comando o gestor de paquetes. Los mosaicos del mapa se solicitan a OpenStreetMap y muestran su atribución en pantalla.

## Configuración y seguridad

- No guardes claves API, contraseñas SMTP, credenciales de Cloudinary ni contraseñas de la base de datos en Git. **La configuración actual del proyecto todavía contiene credenciales en archivos versionados**: no las reutilices en un despliegue compartido. Rótalas si siguen activas y migra la configuración a variables de entorno o archivos locales ignorados por Git.
- La llave Groq puede configurarse en el archivo local ignorado `api/config.local.php` o como variable de entorno `GROQ_API_KEY`. No la escribas en archivos versionados ni la compartas. En esta versión, la conexión PostgreSQL, Cloudinary y SMTP siguen configurados directamente en [con_db/db.php](con_db/db.php), [api/cloudinary_config.php](api/cloudinary_config.php) y [recuperacion/servicio_correo.php](recuperacion/servicio_correo.php), respectivamente.
- La duración de la sesión persistente se configura en [con_db/sesion_persistente.php](con_db/sesion_persistente.php): cambia `$dias` para ajustar el número de días. Cerrar la ventana del navegador no cierra sesión; para terminarla, usa **Cerrar sesión**. La cookie de sesión es `HttpOnly` y la sesión requiere la cookie del servidor; el dato guardado en el almacenamiento del navegador solo sirve para restaurar la interfaz.
- Los registros insertados por el esquema son datos iniciales/de demostración; reemplázalos y revisa las cuentas antes de usar la plataforma en producción.

## Base de datos

El detalle del esquema, las instrucciones de importación y las funciones SQL está en [db/README.md](db/README.md). El [diccionario de datos en Excel](db/Diccionario_de_datos_TourismEasy.xlsx) documenta en una hoja las tablas, columnas y relaciones de la base de datos.
