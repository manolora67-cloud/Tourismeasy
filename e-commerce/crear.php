<?php
/**
 * e-commerce/crear.php
 * GET  ?ajax=1&id=X   -> devuelve UN producto (fn_obtener_producto), para precargar el formulario de edición
 * POST ajax=1          -> guarda mediante fn_guardar_producto()
 *
 * El id del artesano dueño del producto YA NO se toma de lo que mande el
 * formulario (formData.id_persona) — eso lo puede editar cualquiera con las
 * devtools. Se toma de la sesión de servidor ($_SESSION), que solo se pudo
 * haber creado con un login válido en login_artesano.php.
 */

require_once __DIR__ . '/../con_db/sesion_persistente.php';
iniciarSesionPersistente();

require_once __DIR__ . '/../con_db/db.php';
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json');

require_once __DIR__ . '/servicio_imagen_producto.php';

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
        $id = !empty($_POST['id']) ? (int)$_POST['id'] : null;
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

        if ($id) {
            $stmtActual = $pdo->prepare('SELECT 1 FROM fn_obtener_producto(:id, :id_persona)');
            $stmtActual->execute(['id' => $id, 'id_persona' => $idPersona]);
            if (!$stmtActual->fetchColumn()) {
                http_response_code(404);
                echo json_encode(['ok' => false, 'error' => 'Producto no encontrado.']);
                exit;
            }

        }

        $imgUrl = subirImagenCloudinary($imgBase64);
        if (!$id && !$imgUrl) {
            http_response_code(422);
            echo json_encode(['ok' => false, 'error' => 'No se pudo subir la imagen del producto. Inténtalo de nuevo.']);
            exit;
        }

        $stmt = $pdo->prepare('SELECT * FROM fn_guardar_producto(:id, :name, :provider, :category, :price, :id_ciudad, :contacto, :description, :img_url, :id_persona)');
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
        $resultado = $stmt->fetch();
        if (!$resultado || !in_array($resultado['ok'], [true, 't', 'true', '1', 1], true)) {
            http_response_code(422);
            echo json_encode(['ok' => false, 'error' => 'No se pudo guardar el producto. Verifica los datos y que la cuenta esté activa.']);
            exit;
        }

        echo json_encode(['ok' => true, 'id_producto' => (int)$resultado['id_producto']]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);

} catch (PDOException $e) {
    error_log('[TourismEasy] e-commerce/crear.php - ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Error al guardar el producto en la base de datos.']);
}