# TourismEasy

TourismEasy es una plataforma web de turismo inclusivo enfocada en Santander, Colombia. Conecta a viajeros con empresas y experiencias turísticas, con información de accesibilidad para ayudar a planear los viajes.

## Funcionalidades

- Exploración de destinos, planes turísticos, hospedajes y transporte.
- Acceso para administración y empresas, con solicitud de registro empresarial.
- Atención y contacto de viajeros por WhatsApp; no se crean cuentas de viajeros.
- Gestión de servicios y productos artesanales.
- Reseñas y reacciones de viajeros.
- Perfiles y preferencias de administración y empresas.
- Recuperación de contraseña por correo electrónico para administración y empresas.
- Asistente virtual Sue para preguntas sobre turismo en Santander. Sin una clave de Groq configurada, dispone de respuestas locales limitadas.
- Carga de imágenes mediante Cloudinary.

## Tecnologías

- Interfaz: HTML, CSS y JavaScript.
- Backend: PHP.
- Base de datos: PostgreSQL mediante PDO.
- Correo: PHPMailer, instalado con Composer.
- Servicios externos: Groq para el asistente y Cloudinary para imágenes.

## Requisitos

- PHP con las extensiones `pdo_pgsql` y `mbstring`.
- Composer.
- PostgreSQL y su cliente `psql` (o una herramienta gráfica como pgAdmin).
- Una base de datos inicializada con el esquema del proyecto.

## Instalación y ejecución local

1. Clona el repositorio y entra en la carpeta del proyecto.
2. Instala las dependencias de PHP:

   ```sh
   composer install
   ```

3. Crea la base de datos e importa el esquema y los datos de referencia. Sigue la [guía de la base de datos](db/README.md).
4. Configura la conexión PostgreSQL de [con_db/db.php](con_db/db.php) para tu instancia local. La configuración está en un archivo versionado; no publiques cambios que incluyan credenciales.
5. Configura los servicios externos que necesites. El asistente lee `GROQ_API_KEY` desde el entorno; sin ella, usa respuestas locales. En la versión actual, Cloudinary y el correo no leen sus credenciales del entorno: antes de habilitarlos, migra esa configuración a un mecanismo local y no versionado.
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
| [api/](api/) | Asistente y configuración de servicios externos. |
| [con_db/](con_db/) | Conexión PDO y utilidades de sesión. |
| [db/](db/) | Esquema y datos iniciales de PostgreSQL. |
| [funciones/](funciones/) | Funciones SQL utilizadas por el backend. |
| [img/](img/), [audio-video/](audio-video/), [uploads/](uploads/) | Recursos multimedia. |

## Configuración y seguridad

- No guardes claves API, contraseñas SMTP, credenciales de Cloudinary ni contraseñas de la base de datos en Git.
- `GROQ_API_KEY` es la variable de entorno que utiliza el asistente. En la versión actual, las credenciales de la base de datos, Cloudinary y correo están definidas en [con_db/db.php](con_db/db.php), [api/cloudinary_config.php](api/cloudinary_config.php) y [recuperacion/servicio_correo.php](recuperacion/servicio_correo.php). Si estuvieron expuestas, revócalas y genera nuevas antes de compartir o desplegar el proyecto; migra la configuración a un mecanismo local y no versionado.
- Los registros insertados por el esquema son datos iniciales/de demostración; reemplázalos y revisa las cuentas antes de usar la plataforma en producción.

## Base de datos

El detalle del esquema, las instrucciones de importación y las funciones SQL está en [db/README.md](db/README.md).
