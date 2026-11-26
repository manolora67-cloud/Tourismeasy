# Panoramas 360 de municipios

El metaverso busca primero panoramas reales cercanos en Mapillary. Si no encuentra cobertura o el servidor todavía no tiene configurado el token, también puede cargar una foto local equirectangular de esta carpeta.

Para activar Mapillary, configura `MAPILLARY_ACCESS_TOKEN` como variable de entorno del servidor. En desarrollo local con PowerShell:

1. Ejecuta `Copy-Item api\config.local.example.php api\config.local.php`.
2. En `api/config.local.php`, establece `mapillary_access_token` con un token nuevo.

Ese archivo está excluido de Git y protegido por el servidor web. No pongas el token en JavaScript, HTML ni URLs, y no lo compartas en el chat. Revoca el token que se publicó anteriormente y utiliza uno nuevo.

Mapillary puede no tener imágenes 360 en todos los municipios. Si no hay cobertura, el visor lo indicará; no se sustituye con una imagen inventada. Las panorámicas de Mapillary muestran el nombre del autor, la licencia CC BY-SA 4.0 y un enlace a la imagen original.

## Panoramas locales

Agrega aquí una foto panorámica equirectangular JPG por municipio. Debe tener una relación de aspecto 2:1 y cubrir 360° horizontales por 180° verticales; una foto normal no sirve como panorama.

El nombre se genera con el identificador de la provincia, un guion y el municipio en minúsculas, sin tildes y con guiones entre palabras. Ejemplos:

- `metropolitana-bucaramanga.jpg`
- `metropolitana-floridablanca.jpg`
- `metropolitana-giron.jpg`
- `metropolitana-piedecuesta.jpg`
- `guanenta-san-gil.jpg`
- `garcia-rovira-malaga.jpg`

Las fotos de las tarjetas son referencias turísticas genéricas y no identifican el municipio.
