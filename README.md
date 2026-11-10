# TourismEasy

TourismEasy es una plataforma web de turismo inclusivo enfocada en Santander, Colombia. Conecta a viajeros con empresas y experiencias turísticas, con información de accesibilidad para ayudar a planear los viajes.

## Funcionalidades

- Exploración de destinos, planes turísticos, hospedajes y transporte.
- Mapa interactivo de destinos turísticos en la portada. Desde el panel de administración se eligen los municipios, sus coordenadas y hasta tres palabras clave; el mapa reutiliza la foto de Cloudinary guardada para cada municipio, sin crear tarjetas adicionales. Está implementado con Leaflet y OpenStreetMap; sus archivos propios están en [mapa_interactuable/](mapa_interactuable/). No requiere clave de API, pero sí conexión a internet.
- Acceso para administración y empresas, con solicitud de registro empresarial.
- Carrusel de los 87 municipios de Santander en la portada, con paginación responsive y navegación con flechas. Los nombres se consultan de la tabla `CIUDADES`; cada municipio tiene una tarjeta descrita en [componentes/destinos.js](componentes/destinos.js) y una ficha de destino propia en `ARTICULOS` de [componentes/articulos.js](componentes/articulos.js). Desde el panel se pueden actualizar las imágenes y los videos.
- Atención y contacto de viajeros por WhatsApp; no se crean cuentas de viajeros.
- Registro de clics de WhatsApp para empresas y artesanos. Los paneles muestran estadísticas y paginan los registros recientes de diez en diez; el backend determina la cuenta desde la sesión.
- Gestión de servicios y productos artesanales.
- Reseñas y reacciones de viajeros.
- Perfiles y preferencias de administración y empresas.
- Menú de accesibilidad compartido: cambio de idioma, ajuste y restablecimiento del tamaño del texto, alto contraste y lectura en voz alta cuando el navegador lo admite. El pie de página incluye una declaración de accesibilidad emergente con herramientas disponibles, referencias normativas y datos de contacto; es informativa y no representa una certificación de conformidad.
- CAPTCHA verificado en el servidor para los inicios de sesión, y recuperación de contraseña con enlace por correo.
- Confirmaciones, notificaciones y avisos de cambios sin guardar reutilizados en los paneles que los integran.
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
- Glosario local de español a inglés para la interfaz, aplicado también al contenido dinámico reconocido.

## Requisitos

- PHP 7.3 o posterior con `pdo_pgsql`, `mbstring` y `curl`. Para SMTP cifrado se requiere `openssl`. `fileinfo` habilita la validación MIME de imágenes.
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
5. Configura los servicios externos que necesites. Copia `api/config.local.php.example` como `api/config.local.php` y agrega tus credenciales locales. El asistente puede usar `GROQ_API_KEY` o `groq_key` en ese archivo. `api/config.local.php` está excluido de Git: en el servidor debes cargarlo por separado y mantenerlo privado. Cloudinary y el correo aún tienen credenciales configuradas en el código; no los habilites en un entorno compartido hasta migrarlas a una configuración local y no versionada.
6. Desde la raíz del proyecto, inicia el servidor integrado de PHP:

   ```sh
   php -S localhost:8000
   ```

7. Abre [http://localhost:8000](http://localhost:8000).

El servidor integrado de PHP es para desarrollo local, no para producción. Para desplegar, utiliza un servidor web compatible con PHP y configura la base de datos, HTTPS, permisos y credenciales fuera del código versionado.

### Página 404

La página personalizada está en [404.html](404.html). En Apache, `.htaccess` configura su uso y conserva el estado HTTP 404. La ruta configurada corresponde al despliegue actual bajo `/Tourismeasy/`; si cambia el nombre o la ubicación de esa carpeta, actualiza el prefijo de `ErrorDocument` y conserva las rutas relativas de recursos de la página. Apache debe permitir el uso de `.htaccess` para que la regla tenga efecto. Otros servidores web deben configurarse para servir `404.html` con estado HTTP 404. El servidor integrado de PHP documentado arriba no procesa `.htaccess`, así que en desarrollo local hay que abrir `/404.html` directamente para verla.

### Traducción al inglés

El idioma inglés se aplica inmediatamente con un glosario local de palabras y frases conocidas; no hace solicitudes a MyMemory ni consume una cuota externa. También se procesa contenido dinámico cuando coincide con una frase del glosario. Los textos arbitrarios de backend (por ejemplo, nombres o descripciones ingresados por usuarios) requieren una traducción explícita en el glosario; no se traducen automáticamente.

## Estructura principal

| Ruta | Contenido |
| --- | --- |
| [index.html](index.html) | Página principal. |
| [html/](html/) | Páginas de acceso, perfiles, paneles y catálogos. |
| [css/](css/) | Estilos de la interfaz. |
| [js/](js/) | Lógica de las páginas y controladores del navegador. |
| [componentes/](componentes/) | Componentes compartidos de interfaz y contenido. |
| [login/](login/), [recuperacion/](recuperacion/), [resenas/](resenas/) | Endpoints de cuentas, recuperación y reseñas. |
| [planes/](planes/), [hospedaje/](hospedaje/), [transporte/](transporte/) | Endpoints de servicios turísticos. |
| [e-commerce/](e-commerce/) | Endpoints de productos y cuentas de artesanos. |
| [admin/](admin/) | Endpoint de contenido administrable de portada. |
| [api/](api/) | Asistente y configuración de servicios externos. |
| [con_db/](con_db/) | Conexión PDO y utilidades de sesión. |
| [db/](db/) | Esquema inicial y datos de referencia de PostgreSQL; no contiene migraciones de actualización. |
| [functions/](functions/) | Funciones PostgreSQL invocadas por los endpoints y procesos del backend. |
| [triggers/](triggers/) | Triggers de historial y actualización de fechas. |
| [dwh/](dwh/) | Scripts y documentación del almacén analítico por capas Bronce, Plata y Oro. |
| [mapa_interactuable/](mapa_interactuable/) | JavaScript y estilos del mapa turístico de la portada. |
| [img/](img/), [audio-video/](audio-video/) | Recursos multimedia del sitio. Las imágenes subidas se alojan en Cloudinary. |

Leaflet 1.9.4 se carga desde el CDN de unpkg mediante etiquetas `<link>` y `<script>` en [index.html](index.html); no se instaló ni descargó con un comando o gestor de paquetes. Los mosaicos del mapa se solicitan a OpenStreetMap y muestran su atribución en pantalla.

## Componentes compartidos

Los componentes se cargan desde las páginas que los usan; no requieren un proceso de compilación independiente.

| Archivo | Responsabilidad |
| --- | --- |
| [componentes/ui-feedback.js](componentes/ui-feedback.js) | Diálogos de confirmación, notificaciones, comprobación de formularios modificados y cierre de sesión para las páginas integradas. |
| [componentes/panel-modals.js](componentes/panel-modals.js) | Apertura, cierre y confirmación de salida de los modales de edición de hospedaje, planes y transporte. |
| [componentes/modal.js](componentes/modal.js) | Modal reutilizable con apertura/cierre y control de atributos ARIA para cualquier vista. |
| [componentes/toast.js](componentes/toast.js) | Sistema de notificaciones flotantes tipo toast para mensajes de éxito, error o información. |
| [componentes/boton-accion.js](componentes/boton-accion.js) | Botones de acción reutilizables con eventos personalizados para acciones de CTA. |
| [componentes/lista-tarjetas.js](componentes/lista-tarjetas.js) | Renderer genérico para listas de tarjetas y contenido dinámico en páginas de catálogo. |
| [componentes/panel-filtros.js](componentes/panel-filtros.js) | Panel de filtros reutilizable que captura el formulario y dispara eventos de búsqueda/filtro. |
| [componentes/panel_empresa_servicios.css](componentes/panel_empresa_servicios.css) | Estilos compartidos de los paneles de servicios de empresas. |
| [componentes/click-metrics-dashboard.js](componentes/click-metrics-dashboard.js) | Plantilla del tablero de clics de WhatsApp reutilizada por los paneles compatibles. |
| [componentes/destinos.js](componentes/destinos.js) y [componentes/articulos.js](componentes/articulos.js) | Contenido descriptivo de destinos y fichas de municipios. |
| [componentes/footer.js](componentes/footer.js) | Pie de página compartido y ventanas emergentes informativas, incluida la declaración de accesibilidad. |
| [menu_accesibilidad/menu.js](menu_accesibilidad/menu.js) y [menu_accesibilidad/menu.css](menu_accesibilidad/menu.css) | Menú flotante de accesibilidad, preferencias de presentación y carga del traductor local. |

### Convención de organización

- La capa de base de datos sigue en [functions/](functions/) como funciones PostgreSQL y SQL reutilizables.
- Los elementos repetidos de interfaz quedan en [componentes/](componentes/), sin crear capas extra de servicios o repositorios innecesarias.
- Las páginas de negocio viven en sus carpetas específicas, como [e-commerce/](e-commerce/), [hospedaje/](hospedaje/), [planes/](planes/), [transporte/](transporte/) y [admin/](admin/).
- La lógica de navegador y UI compartida no se duplica; se reutiliza desde un mismo componente base para mantener el proyecto claro y mantenible.

El panel artesanal reutiliza el tablero de clics, con datos limitados por la sesión de artesano. Para una base nueva, el esquema y las funciones relacionados se describen en [db/README.md](db/README.md); las funciones SQL no se ejecutan automáticamente al cargar PHP.

### Uso práctico de los componentes

Los componentes compartidos se cargan directamente en la vista que los usa con etiquetas `<script>` normales, sin pipeline ni compilación. La idea es mantenerlos reutilizables y simples.

```html
<script src="../componentes/modal.js"></script>
<script src="../componentes/toast.js"></script>
<script src="../componentes/boton-accion.js"></script>
<script src="../componentes/filtro-chips.js"></script>
```

#### Modal reutilizable

- Usa botones con `data-open-modal="idDelModal"`.
- El modal debe tener `id="idDelModal"` y el cierre con `[data-close-modal]`.
- El componente se inicializa solo con su selector por defecto, por lo que no hace falta más configuración.

```html
<button type="button" data-open-modal="miModal">Abrir</button>
<div id="miModal" class="modal" aria-hidden="true">
  <button type="button" data-close-modal>Cerrar</button>
</div>
```

#### Toast

```js
window.TourismEasyToast.show('Guardado correctamente.', { type: 'success', duration: 2500 });
```

#### Botón de acción

```html
<button type="button" data-cta="guardar">Guardar</button>
```

```js
document.addEventListener('cta:click', (event) => {
  console.log('Acción:', event.detail.action);
});
```

#### Filtros tipo chips

```html
<div data-filter-chip-group>
  <button type="button" data-filter-chip="todos" class="active">Todos</button>
  <button type="button" data-filter-chip="activos">Activos</button>
  <button type="button" data-filter-chip="inactivos">Inactivos</button>
</div>
```

```js
document.addEventListener('filter:change', (event) => {
  console.log(event.detail.value);
});
```

#### Tabla reutilizable

```html
<table data-table-data>
  <thead>
    <tr>
      <th>Nombre</th>
      <th>Estado</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>
```

```js
window.TourismEasyTableData.render({
  selector: '[data-table-data]',
  rows: [{ nombre: 'Empresa A', estado: 'ACTIVO' }],
  columns: [
    { key: 'nombre' },
    { key: 'estado', value: (row) => '<span class="status-badge status-badge--active">' + row.estado + '</span>' }
  ],
  emptyText: 'Sin resultados'
});
```

### Reglas de uso

- No crear nuevas capas de servicios ni repositorios si la lógica es simple y se reutiliza en la misma página.
- Si un patrón se repite dos o más veces, conviene moverlo a [componentes/](componentes/).
- Mantener los nombres de archivo descriptivos y en español cuando se trata de UI reutilizable.
- Usar eventos personalizados (`CustomEvent`) para comunicar acciones entre componentes y páginas, sin acoplar demasiado el JavaScript.

## Configuración y seguridad

- No guardes claves API, contraseñas SMTP, credenciales de Cloudinary ni contraseñas de la base de datos en Git. **La configuración actual del proyecto todavía contiene credenciales en archivos versionados**: no las reutilices en un despliegue compartido. Rótalas si siguen activas y migra la configuración a variables de entorno o archivos locales ignorados por Git.
- La llave Groq puede configurarse en el archivo local ignorado `api/config.local.php` o como variable de entorno `GROQ_API_KEY`. No la escribas en archivos versionados ni la compartas. En esta versión, la conexión PostgreSQL, Cloudinary y SMTP siguen configurados directamente en [con_db/db.php](con_db/db.php), [api/cloudinary_config.php](api/cloudinary_config.php) y [recuperacion/servicio_correo.php](recuperacion/servicio_correo.php), respectivamente.
- La duración de la sesión persistente se configura en [con_db/sesion_persistente.php](con_db/sesion_persistente.php): cambia `$dias` para ajustar el número de días. Cerrar la ventana del navegador no cierra sesión; para terminarla, usa **Cerrar sesión**. La cookie de sesión es `HttpOnly` y la sesión requiere la cookie del servidor; el dato guardado en el almacenamiento del navegador solo sirve para restaurar la interfaz.
- Los registros insertados por el esquema son datos iniciales/de demostración; reemplázalos y revisa las cuentas antes de usar la plataforma en producción.

## Base de datos

El detalle del esquema, las instrucciones de instalación desde cero y la carga de funciones SQL están en [db/README.md](db/README.md). El diseño, los pasos de carga y las limitaciones actuales del DWH se documentan en [dwh/README.md](dwh/README.md).
