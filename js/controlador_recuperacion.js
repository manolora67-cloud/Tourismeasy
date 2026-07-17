const crypto = require('crypto');
const { Pool } = require('pg'); // Conector nativo PostgreSQL
const pool = new Pool({ /* ... tu configuración de conexión ... */ });

// ENDPOINT 1: Procesar la Solicitud de Recuperación
async function solicitarRecuperacion(req, res) {
    const { email } = req.body;

    try {
        // 1. Verificar de forma exhaustiva si existe el correo en Viajeros/Admin o Empresas
        const checkUsuario = await pool.query('SELECT ID_PERSONA FROM USUARIOS WHERE EMAIL_LOGIN = $1', [email]);
        const checkEmpresa = await pool.query('SELECT ID_EMPRESA FROM USUARIOS_EMPRESA WHERE EMAIL_LOGIN = $1', [email]);

        if (checkUsuario.rows.length === 0 && checkEmpresa.rows.length === 0) {
            return res.status(404).json({ success: false, message: "El correo electrónico no se encuentra registrado." });
        }

        const idUsuario = checkUsuario.rows.length > 0 ? checkUsuario.rows[0].id_persona : null;
        const idEmpresa = checkEmpresa.rows.length > 0 ? checkEmpresa.rows[0].id_empresa : null;

        // 2. Generar un Token alfanumérico seguro único de 64 caracteres para cumplir la restricción del CHECK de la BD
        const token = crypto.randomBytes(32).toString('hex'); 
        const fechaCreacion = new Date();
        const fechaExpira = new Date(fechaCreacion.getTime() + 60 * 60 * 1000); // 1 Hora de expiración

        // 3. Insertar el registro respetando la estructura de la tabla TOKENS_RECUPERACION de tu base de datos
        await pool.query(
            `INSERT INTO TOKENS_RECUPERACION (EMAIL, ID_USUARIO, ID_EMPRESA, TOKEN, FECHA_CREACION, FECHA_EXPIRA, USADO) 
             VALUES ($1, $2, $3, $4, $5, $6, FALSE)`,
            [email, idUsuario, idEmpresa, token, fechaCreacion, fechaExpira]
        );

        // 4. Enviar el enlace dinámico al servicio de correos
        const enlace = `https://turismeasy.com/auth/restablecer_contrasena.html?token=${token}`;
        await enviarCorreoTransaccional(email, enlace); 

        return res.json({ success: true, message: "Se ha enviado un enlace de recuperación a tu bandeja de entrada." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Excepción interna del servidor." });
    }
}

// ENDPOINT 2: Validar Token y Cambiar Contraseña en la Base de Datos
async function restablecerContrasena(req, res) {
    const { token, password } = req.body;

    try {
        // 1. Consultar el estado del Token en la tabla TOKENS_RECUPERACION
        const queryToken = await pool.query(
            `SELECT * FROM TOKENS_RECUPERACION WHERE TOKEN = $1 AND USADO = FALSE AND FECHA_EXPIRA > NOW()`,
            [token]
        );

        if (queryToken.rows.length === 0) {
            return res.status(400).json({ success: false, message: "El enlace ha expirado o ya ha sido utilizado." });
        }

        const tokenRegistro = queryToken.rows[0];

        // 2. Hashear la nueva contraseña con SHA-256 obligatorio para no violar el CHECK restrictivo del motor SQL
        const passHash64 = crypto.createHash('sha256').update(password).digest('hex');

        // 3. Identificar si es cuenta de Persona natural o de Empresa y actualizar la tabla adecuada
        if (tokenRegistro.id_usuario) {
            await pool.query('UPDATE USUARIOS SET CONTRASENA = $1 WHERE ID_PERSONA = $2', [passHash64, tokenRegistro.id_usuario]);
        } else if (tokenRegistro.id_empresa) {
            await pool.query('UPDATE USUARIOS_EMPRESA SET CONTRASENA = $1 WHERE ID_EMPRESA = $2', [passHash64, tokenRegistro.id_empresa]);
        }

        // 4. Marcar el token de seguridad como USADO para evitar ataques de repetición
        await pool.query('UPDATE TOKENS_RECUPERACION SET USADO = TRUE WHERE TOKEN = $1', [token]);

        return res.json({ success: true, message: "Tu contraseña ha sido actualizada con éxito." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Error al actualizar las credenciales." });
    }
}

module.exports = { solicitarRecuperacion, restablecerContrasena };