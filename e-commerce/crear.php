<?php
/**
 * e-commerce/crear.php
 * GET  ?ajax=1&id=X   -> devuelve UN producto (fn_obtener_producto), para precargar el formulario de edición
 * POST ajax=1          -> crea (fn_agregar_producto) o actualiza (fn_editar_producto) un producto
 *
 * El id del artesano dueño del producto YA NO se toma de lo que mande el
 * formulario (formData.id_persona) — eso lo puede editar cualquiera con las
 * devtools. Se toma de la sesión de servidor ($_SESSION), que solo se pudo
 * haber creado con un login válido en login_artesano.php.
 */

session_start();

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json');

// ── Carpeta donde se guardan las imágenes de los productos ──
// Ajusta esta ruta si tu carpeta "uploads" no está al mismo nivel que "con_db".
define('UPLOAD_DIR_FS', __DIR__ . '/../uploads/productos/');   // ruta física en el servidor
define('UPLOAD_DIR_URL', '../uploads/productos/');             // ruta relativa usada en el <img src="">

/**
 * Recibe el string que llega en img_base64 y decide qué hacer:
 * - Si es una imagen nueva (empieza con "data:image/...") la decodifica y la guarda como archivo .jpg
 * - Si no (es decir, ya es una URL existente, como pasa al editar sin cambiar la foto) la deja igual
 * Devuelve la ruta final que se debe guardar en la columna IMG_URL.
 * (Esto es manejo de archivos en disco, no de base de datos, por eso se queda en PHP.)
 */
function guardarImagenSiEsNueva(string $imgBase64, ?string $imgUrlActual): ?string {
    if ($imgBase64 === '') {
        return $imgUrlActual; // no mandaron nada nuevo, se conserva lo que había
    }

    if (strpos($imgBase64, 'data:image') !== 0) {
        // No es base64 nuevo, es la URL que ya traía el producto (caso de "editar sin cambiar foto")
        return $imgBase64;
    }

    // Separamos el encabezado ("data:image/jpeg;base64,") del contenido real
    if (!preg_match('/^data:image\/(\w+);base64,(.+)$/', $imgBase64, $match)) {
        return $imgUrlActual; // formato inesperado, no tocamos la imagen anterior
    }

    $datosImagen = base64_decode($match[2]);
    if ($datosImagen === false) {
        return $imgUrlActual;
    }

    if (!is_dir(UPLOAD_DIR_FS)) {
        mkdir(UPLOAD_DIR_FS, 0755, true);
    }

    $nombreArchivo = 'prod_' . uniqid() . '.jpg';
    file_put_contents(UPLOAD_DIR_FS . $nombreArchivo, $datosImagen);

    return UPLOAD_DIR_URL . $nombreArchivo;
}

// ── Validación de formato server-side (nunca confiar solo en el formulario del navegador) ──
// Las reglas de negocio (categoría válida, ciudad válida, longitudes) las revalida la función de BD.
function validarProducto(array $d): ?string {
    if (strlen($d['name']) < 3)               return 'El nombre debe tener al menos 3 caracteres.';
    if (strlen($d['provider']) < 3)            return 'El proveedor debe tener al menos 3 caracteres.';
    if (!in_array($d['category'], ['talleres', 'bisuteria', 'alfareria'], true)) return 'Categoría inválida.';
    if (!is_numeric($d['price']) || $d['price'] <= 0)  return 'El precio debe ser mayor a 0.';
    if (strlen($d['id_ciudad']) < 5)           return 'Selecciona una ciudad válida.';
    if (!preg_match('/^\+?[0-9 ]{7,20}$/', $d['contacto'])) return 'Teléfono de contacto inválido.';
    if (strlen($d['description']) < 10)        return 'La descripción debe tener al menos 10 caracteres.';
    return null; // sin errores
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // ── Traer un producto puntual (para precargar el formulario de edición) ──
        $id = $_GET['id'] ?? null;
        // Igual que abajo: el id del artesano sale de la sesión, no de la URL.
        $idPersona = $_SESSION['artesano_id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Falta el id del producto.']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM fn_obtener_producto(:id, :id_persona)");
        $stmt->execute(['id' => $id, 'id_persona' => $idPersona]);
        $producto = $stmt->fetch();

        if (!$producto) {
            http_response_code(404);
            echo json_encode(['ok' => false, 'error' => 'Producto no encontrado.']);
            exit;
        }

        echo json_encode($producto);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $id    = $_POST['id'] ?? null;
        // El id del artesano viene de la sesión de servidor, nunca del formulario.
        $idPersona = $_SESSION['artesano_id'] ?? null;
        $datos = [
            'name'        => trim($_POST['name'] ?? ''),
            'provider'    => trim($_POST['provider'] ?? ''),
            'category'    => trim($_POST['category'] ?? ''),
            'price'       => $_POST['price'] ?? '',
            'id_ciudad'   => trim($_POST['id_ciudad'] ?? ''),
            'contacto'    => trim($_POST['contacto'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
        ];
        $imgBase64 = $_POST['img_base64'] ?? '';

        if (!$idPersona) {
            http_response_code(401);
            echo json_encode(['ok' => false, 'error' => 'Sesión de artesano no encontrada. Inicia sesión de nuevo.']);
            exit;
        }

        $error = validarProducto($datos);
        if ($error) {
            http_response_code(422);
            echo json_encode(['ok' => false, 'error' => $error]);
            exit;
        }

        if ($id) {
            // ── ACTUALIZAR producto existente (solo si es del artesano logueado) ──
            $stmtActual = $pdo->prepare("SELECT img_url FROM fn_obtener_producto(:id)");
            $stmtActual->execute(['id' => $id]);
            $filaActual = $stmtActual->fetch();
            if (!$filaActual) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Producto no encontrado.']);
                exit;
            }

            $imgUrl = guardarImagenSiEsNueva($imgBase64, $filaActual['img_url']);

            $stmt = $pdo->prepare("
                SELECT fn_editar_producto(:id, :name, :provider, :category, :price, :id_ciudad, :contacto, :description, :img_url, :id_persona)
            ");
            $stmt->execute([
                'id'          => $id,
                'name'        => $datos['name'],
                'provider'    => $datos['provider'],
                'category'    => $datos['category'],
                'price'       => $datos['price'],
                'id_ciudad'   => $datos['id_ciudad'],
                'contacto'    => $datos['contacto'],
                'description' => $datos['description'],
                'img_url'     => $imgUrl,
                'id_persona'  => $idPersona,
            ]);

            if (!$stmt->fetchColumn()) {
                http_response_code(403);
                echo json_encode(['ok' => false, 'error' => 'No se pudo actualizar el producto. Verifica que sea tuyo y que los datos sean correctos.']);
                exit;
            }

            echo json_encode(['ok' => true, 'id_producto' => $id]);
            exit;
        }

        // ── CREAR producto nuevo, asociado al artesano logueado ──
        $imgUrl = guardarImagenSiEsNueva($imgBase64, null);

        $stmt = $pdo->prepare("
            SELECT fn_agregar_producto(:name, :provider, :category, :price, :id_ciudad, :contacto, :description, :img_url, :id_persona)
        ");
        $stmt->execute([
            'name'        => $datos['name'],
            'provider'    => $datos['provider'],
            'category'    => $datos['category'],
            'price'       => $datos['price'],
            'id_ciudad'   => $datos['id_ciudad'],
            'contacto'    => $datos['contacto'],
            'description' => $datos['description'],
            'img_url'     => $imgUrl,
            'id_persona'  => $idPersona,
        ]);
        $nuevoId = $stmt->fetchColumn();

        if (!$nuevoId) {
            http_response_code(422);
            echo json_encode(['ok' => false, 'error' => 'No se pudo crear el producto. Verifica los datos.']);
            exit;
        }

        echo json_encode(['ok' => true, 'id_producto' => (int) $nuevoId]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);

} catch (PDOException $e) {
    error_log('[TourismEasy] e-commerce/crear.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error al guardar el producto en la base de datos.']);
}