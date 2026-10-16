# Diccionario de datos de TourismEasy

## Alcance

Este documento describe las 35 tablas definidas en [`DB_TOURISMEASY.sql`](DB_TOURISMEASY.sql). El motor es PostgreSQL. Los tipos, valores por defecto, claves y restricciones aquí descritos corresponden al DDL de ese archivo; no sustituyen una inspección de una instalación que haya recibido cambios posteriores.

En las tablas siguientes, **NN** indica `NOT NULL`, **PK** clave primaria, **FK** clave foránea y **UQ** unicidad. Si no se indica NN, la columna admite `NULL` en el DDL. Las claves primarias son obligatorias aunque la columna no repita expresamente `NOT NULL`. `SERIAL` representa un entero con secuencia/autoincremento.

## Modelo relacional

- `DEPARTAMENTOS` contiene `CIUDADES`; cada ciudad pertenece a un departamento.
- `EMPRESAS` se asocia a una ciudad y puede tener una cuenta en `USUARIOS_EMPRESA`. La misma empresa ofrece planes, hospedajes y/o transportes.
- `PERSONAS_ECOMMERCE` contiene los datos de identidad del vendedor; `USUARIOS_ECOMMERCE` mantiene sus credenciales, y `PRODUCTOS_ARTESANALES` puede asociarse a esa persona.
- `PLANES_TURISTICOS` se asocia con una empresa, una ciudad y un tipo de plan. `PLAN_COMPONENTES` relaciona cada plan con componentes; `HOSPEDAJE_SERVICIOS` relaciona hospedajes con servicios.
- `TRANSPORTE_CLASE` asocia transporte con clases de servicio. `RESENAS_PLATAFORMA` recibe reacciones en `LIKES_RESENAS`.
- Las tablas de configuración se asocian a usuario o empresa. Las tablas de historial, auditoría y seguridad almacenan actividad y datos auxiliares.

## Diccionario por tabla

### `DEPARTAMENTOS` — catálogo de departamentos

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_DPTO` | `VARCHAR(2)`, NN, PK; exactamente dos dígitos | Código del departamento. |
| `NOM_DPTO` | `VARCHAR(18)`, NN; mínimo 3 caracteres | Nombre del departamento. |

### `CIUDADES` — municipios/ciudades

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_CIUDAD` | `VARCHAR(6)`, NN, PK; al menos 5 caracteres alfanuméricos | Código de la ciudad. |
| `NOM_CIUDAD` | `VARCHAR(27)`, NN; mínimo 3 caracteres | Nombre de la ciudad. |
| `ID_DPTO` | `VARCHAR(2)`, NN, FK → `DEPARTAMENTOS.ID_DPTO`; longitud 2 | Departamento al que pertenece. |

### `EMPRESAS` — información institucional de proveedores

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_EMPRESA` | `VARCHAR(10)`, NN, PK; longitud 10 | Identificador tributario de la empresa. |
| `NOM_EMPRESA` | `VARCHAR(50)`, NN; mínimo 2 caracteres | Razón o nombre de la empresa. |
| `EMAIL_INSTITU_EMPRESA` | `VARCHAR`, NN; formato de correo | Correo institucional de contacto. |
| `NUM_CONTACTO_EMPRESA` | `VARCHAR(20)`, NN; entre 7 y 15 dígitos, con `+` inicial opcional | Teléfono de contacto. |
| `ID_CIUDAD` | `VARCHAR(6)`, NN, FK → `CIUDADES.ID_CIUDAD`; al menos 5 caracteres | Ciudad de la empresa. |
| `TIPO_SERVICIO` | `VARCHAR(20)`, NN; por defecto `PLANES`; valores `HOSPEDAJE`, `PLANES` o `TRANSPORTE` | Servicio principal declarado por la empresa. |

### `TIPOS_DOCUMENTOS` — catálogo de tipos de documento

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_TIPO_DOC` | `SMALLINT`, NN, PK; mayor que 0 | Identificador del tipo de documento. |
| `NOM_TIPO_DOC` | `VARCHAR(21)`, NN; mínimo 2 caracteres | Nombre del tipo de documento. |

### `USUARIOS` — cuentas de administración

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_PERSONA` | `VARCHAR(10)`, NN, PK; 6 o más dígitos | Identificación de la persona administradora. |
| `NOM_PERSONA` | `VARCHAR(50)`, NN; mínimo 2 caracteres | Nombre. |
| `APE_PERSONA` | `VARCHAR(50)`, NN; mínimo 2 caracteres | Apellido. |
| `NUM_CEL_PERSONA` | `VARCHAR(20)`, NN; entre 7 y 15 dígitos, con `+` inicial opcional | Teléfono celular. |
| `EMAIL_LOGIN` | `VARCHAR`, NN, UQ; formato de correo | Correo de inicio de sesión. |
| `CONTRASENA` | `VARCHAR(64)`, NN; 64 caracteres hexadecimales minúsculos | Hash de contraseña almacenado por la aplicación. |
| `ESTADO` | `VARCHAR(10)`, NN; por defecto `ACTIVO`; `ACTIVO` o `INACTIVO` | Estado de la cuenta. |
| `FECHA_REGISTRO` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha y hora de registro. |

### `CONTENIDO_PORTADA` — tarjetas y artículos administrables de portada

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `CLAVE` | `VARCHAR(50)`, PK; patrón de 2 a 50 letras minúsculas, dígitos o guiones | Identificador legible del contenido. |
| `IMAGEN` | `TEXT`, NN | URL o referencia de la imagen. |
| `TEXTO_ALT` | `VARCHAR(200)`, NN | Texto alternativo de la imagen. |
| `INSIGNIA` | `VARCHAR(80)` | Insignia o etiqueta opcional. |
| `TITULO` | `VARCHAR(150)`, NN | Título del contenido. |
| `DESCRIPCION` | `TEXT`, NN | Descripción del contenido. |
| `ARTICULO` | `JSONB`, NN; por defecto `{}`; debe ser objeto JSON | Contenido estructurado del artículo. |
| `ORDEN` | `INTEGER`, NN; por defecto `0` | Orden de presentación. |
| `PUBLICADO` | `BOOLEAN`, NN; por defecto `TRUE` | Indica si el contenido está publicado. |
| `MODIFICADO_POR` | `VARCHAR(10)`, FK → `USUARIOS.ID_PERSONA` | Usuario que modificó el contenido. |
| `FECHA_CREACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha de creación. |
| `FECHA_ACTUALIZACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha de última actualización. |

### `ESTADO_INICIAL_PORTADA` — control de carga inicial de portada

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID` | `SMALLINT`, PK; solo admite `1` | Identificador fijo del registro de control. |
| `DEFAULTS_CARGADOS` | `BOOLEAN`, NN; por defecto `FALSE` | Indica si se cargó el contenido inicial. |

### `PERSONAS_ECOMMERCE` — datos de identidad de vendedores

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_PERSONA_ECOMMERCE` | `VARCHAR(10)`, NN, PK; 6 o más dígitos | Identificación de la persona vendedora. |
| `ID_TIPO_DOC` | `SMALLINT`, NN, FK → `TIPOS_DOCUMENTOS.ID_TIPO_DOC`; mayor que 0 | Tipo de documento. |
| `NOM_PERSONA_ECOMMERCE` | `VARCHAR(50)`, NN; mínimo 2 caracteres | Nombre. |
| `APE_PERSONA_ECOMMERCE` | `VARCHAR(50)`, NN; mínimo 2 caracteres | Apellido. |
| `NUM_CEL_PERSONA_ECOMMERCE` | `VARCHAR(20)`, NN; entre 7 y 15 dígitos, con `+` inicial opcional | Teléfono celular. |
| `EMAIL_PERSONA_ECOMMERCE` | `VARCHAR`, NN; formato de correo | Correo de contacto. |
| `FECHA_REGISTRO` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha y hora de registro. |

### `USUARIOS_ECOMMERCE` — credenciales de vendedores

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_PERSONA_ECOMMERCE` | `VARCHAR(10)`, NN, PK y FK → `PERSONAS_ECOMMERCE.ID_PERSONA_ECOMMERCE`; al menos 6 caracteres | Persona propietaria de la cuenta. |
| `EMAIL_LOGIN` | `VARCHAR`, NN, UQ; formato de correo | Correo de inicio de sesión. |
| `CONTRASENA` | `VARCHAR(64)`, NN; 64 caracteres hexadecimales minúsculos | Hash de contraseña. |
| `ESTADO` | `VARCHAR(10)`, NN; por defecto `ACTIVO`; `ACTIVO`, `INACTIVO` o `PENDIENTE` | Estado de la cuenta. |

### `HISTORIAL_CONTRASENAS_USUARIO` — historial de contraseñas administrativas

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_HISTORIAL` | `SERIAL`, PK | Identificador del registro histórico. |
| `ID_USUARIO` | `VARCHAR(10)`, NN, FK → `USUARIOS.ID_PERSONA`; 6 o más dígitos | Usuario al que corresponde el cambio. |
| `CONTRASENA_HASH` | `VARCHAR(64)`, NN; 64 caracteres hexadecimales minúsculos | Hash histórico de la contraseña. |
| `FECHA_CAMBIO` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha y hora del cambio. |

### `USUARIOS_EMPRESA` — credenciales de empresas

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_EMPRESA` | `VARCHAR(10)`, NN, PK y FK → `EMPRESAS.ID_EMPRESA`; 10 dígitos | Empresa titular de la cuenta. |
| `EMAIL_LOGIN` | `VARCHAR`, NN, UQ; formato de correo | Correo de inicio de sesión. |
| `CONTRASENA` | `VARCHAR(64)`, NN; 64 caracteres hexadecimales minúsculos | Hash de contraseña. |
| `ESTADO` | `VARCHAR(10)`, NN; por defecto `ACTIVO`; `ACTIVO`, `INACTIVO` o `PENDIENTE` | Estado de la cuenta empresarial. |
| `FECHA_REGISTRO` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha y hora de registro. |

### `HISTORIAL_CONTRASENAS_EMPRESA` — historial de contraseñas empresariales

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_HISTORIAL` | `SERIAL`, PK | Identificador del registro histórico. |
| `ID_EMPRESA` | `VARCHAR(10)`, NN, FK → `USUARIOS_EMPRESA.ID_EMPRESA`; 10 dígitos | Cuenta empresarial a la que corresponde el cambio. |
| `CONTRASENA_HASH` | `VARCHAR(64)`, NN; 64 caracteres hexadecimales minúsculos | Hash histórico de la contraseña. |
| `FECHA_CAMBIO` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha y hora del cambio. |

### `TIPOS_DE_PLAN_TURISTICO` — catálogo de tipos de plan

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_TIPO_PLAN` | `SMALLINT`, NN, PK; mayor que 0 | Identificador del tipo de plan. |
| `NOM_TIPO_PLAN` | `VARCHAR(28)`, NN; mínimo 3 caracteres | Nombre del tipo, por ejemplo ecoturismo o turismo cultural. |

### `TRANSPORTE` — servicios de transporte publicados

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_TRANSPORTE` | `SERIAL`, NN, PK | Identificador del servicio. |
| `ID_EMPRESA` | `VARCHAR(10)`, NN, FK → `EMPRESAS.ID_EMPRESA`; longitud 10 | Empresa prestadora. |
| `ORIGEN` | `VARCHAR(100)`, NN; mínimo 3 caracteres | Lugar de origen. |
| `DESTINO` | `VARCHAR(100)`, NN; mínimo 3 caracteres | Lugar de destino. |
| `FECHA_SALIDA` | `DATE`, NN; igual o posterior a `CURRENT_DATE` | Fecha de salida. |
| `HORA_SALIDA` | `TIME`, NN | Hora de salida. |
| `PRECIO` | `DECIMAL(12,0)`, NN; mayor que 0 | Precio del servicio, en pesos colombianos según el uso de la aplicación. |
| `DISPONIBILIDAD` | `BOOLEAN`, NN; por defecto `TRUE` | Disponibilidad del servicio. |
| `DESCRIPCION` | `TEXT`; nula o mínimo 5 caracteres | Descripción opcional. |
| `IMG_URL` | `VARCHAR(255)`; nula o mínimo 5 caracteres | URL de imagen opcional. |
| `FECHA_CREACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha de creación del registro. |

### `CLASE_SERVICIO_TRANSPORTE` — catálogo de clases de transporte

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_CLASE` | `SERIAL`, NN, PK | Identificador de la clase. |
| `NOMBRE_CLASE` | `VARCHAR(100)`, NN, UQ; mínimo 2 caracteres | Nombre de la clase de servicio. |
| `ACTIVO` | `BOOLEAN`, NN; por defecto `TRUE` | Indica si la clase está habilitada. |
| `FECHA_CREACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha de creación. |

### `TRANSPORTE_CLASE` — relación de transporte y clase

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_TRANSPORTE` | `INT`, NN, PK y FK → `TRANSPORTE.ID_TRANSPORTE`; borrado en cascada | Transporte relacionado. Es la única columna de la clave primaria. |
| `ID_CLASE` | `INT`, NN, FK → `CLASE_SERVICIO_TRANSPORTE.ID_CLASE`; borrado en cascada | Clase asociada al transporte. |

### `SERVICIOS_HOSPEDAJE` — catálogo de servicios de hospedaje

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_SERVICIO` | `SERIAL`, NN, PK | Identificador del servicio. |
| `NOMBRE_SERVICIO` | `VARCHAR(100)`, NN, UQ; mínimo 3 caracteres | Nombre del servicio o amenidad. |
| `ACTIVO` | `BOOLEAN`, NN; por defecto `TRUE` | Indica si se ofrece el servicio en el catálogo. |
| `FECHA_CREACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha de creación. |

### `HOSPEDAJE` — establecimientos de alojamiento

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_HOSPEDAJE` | `SERIAL`, NN, PK | Identificador del hospedaje. |
| `ID_EMPRESA` | `VARCHAR(10)`, NN, FK → `EMPRESAS.ID_EMPRESA`; longitud 10 | Empresa responsable. |
| `NOM_HOSPEDAJE` | `VARCHAR(100)`, NN; mínimo 3 caracteres | Nombre comercial. |
| `TIPO_HOSPEDAJE` | `VARCHAR(30)`, NN; `Hotel`, `Hotel Boutique`, `Finca`, `Cabaña`, `Hostal`, `Apartamento` o `Glamping` | Categoría del establecimiento. |
| `ID_CIUDAD` | `VARCHAR(6)`, NN, FK → `CIUDADES.ID_CIUDAD`; al menos 5 caracteres | Ciudad donde se ubica. |
| `DESCRIPCION` | `TEXT`; nula o mínimo 5 caracteres | Descripción opcional. |
| `PRECIO_NOCHE` | `DECIMAL(12,0)`, NN; mayor que 0 | Precio por noche, en pesos colombianos según el uso de la aplicación. |
| `ACCESIBILIDAD` | `VARCHAR(200)`, NN; mínimo 3 caracteres | Información de accesibilidad. |
| `CAPACIDAD_MAX` | `DECIMAL(3,0)`, NN; mayor que 0 | Capacidad máxima de huéspedes. |
| `IMG_URL` | `VARCHAR(255)`; nula o mínimo 5 caracteres | URL de imagen opcional. |
| `DISPONIBILIDAD` | `BOOLEAN`, NN; por defecto `TRUE` | Disponibilidad del hospedaje. |
| `FECHA_CREACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha de creación. |

### `PLANES_TURISTICOS` — planes o experiencias

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_PLAN_TURISTICO` | `SERIAL`, NN, PK | Identificador del plan. |
| `NOM_PLAN_TURISTICO` | `VARCHAR(100)`, NN; mínimo 3 caracteres | Nombre del plan. |
| `DURACION` | `VARCHAR(50)`, NN; mínimo 2 caracteres | Duración declarada del plan. |
| `DESCRIPCION` | `TEXT`; nula o mínimo 5 caracteres | Descripción opcional. |
| `INCLUYE` | `TEXT`, NN; mínimo 3 caracteres | Elementos incluidos en el plan. |
| `ID_TIPO_PLAN` | `SMALLINT`, NN, FK → `TIPOS_DE_PLAN_TURISTICO.ID_TIPO_PLAN`; mayor que 0 | Tipo o categoría del plan. |
| `PRECIO_PLAN` | `DECIMAL(12,0)`, NN; mayor que 0 | Precio, en pesos colombianos según el uso de la aplicación. |
| `ACCESIBILIDAD` | `VARCHAR(200)`, NN; mínimo 3 caracteres | Información sobre accesibilidad. |
| `DISPONIBILIDAD` | `BOOLEAN`, NN; por defecto `TRUE` | Disponibilidad del plan. |
| `ID_EMPRESA` | `VARCHAR(10)`, NN, FK → `EMPRESAS.ID_EMPRESA`; longitud 10 | Empresa oferente. |
| `ID_CIUDAD` | `VARCHAR(6)`, NN, FK → `CIUDADES.ID_CIUDAD`; al menos 5 caracteres | Ciudad asociada al plan. |
| `IMG_URL` | `VARCHAR(255)`; nula o mínimo 5 caracteres | URL de imagen opcional. |
| `FECHA_CREACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha de creación. |

### `HOSPEDAJE_SERVICIOS` — relación de hospedajes y servicios

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_HOSPEDAJE` | `INT`, NN, parte de PK compuesta; FK → `HOSPEDAJE.ID_HOSPEDAJE`; borrado en cascada | Hospedaje que ofrece el servicio. |
| `ID_SERVICIO` | `INT`, NN, parte de PK compuesta; FK → `SERVICIOS_HOSPEDAJE.ID_SERVICIO`; borrado en cascada | Servicio o amenidad ofrecido. |

### `PLAN_COMPONENTES` — componentes asociados a planes

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_PLAN_COMP` | `SERIAL`, NN, PK | Identificador del componente asociado. |
| `ID_PLAN_TURISTICO` | `INT`, NN, FK → `PLANES_TURISTICOS.ID_PLAN_TURISTICO`; mayor que 0 | Plan al que pertenece el componente. |
| `TIPO_COMPONENTE` | `VARCHAR(20)`, NN; `HOSPEDAJE` o `TRANSPORTE` | Tipo declarado de componente. |
| `ID_HOSPEDAJE` | `INT`; nulo o mayor que 0; FK → `HOSPEDAJE.ID_HOSPEDAJE` | Hospedaje asociado, si corresponde. |
| `NOTAS` | `VARCHAR(200)`; nula o mínimo 3 caracteres | Observación opcional del componente. |

### `RESENAS_PLATAFORMA` — reseñas públicas

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_RESENA` | `SERIAL`, PK | Identificador de la reseña. |
| `NOMBRE_ANONIMO` | `VARCHAR(60)`, NN; de 2 a 60 caracteres después de quitar espacios en extremos | Nombre mostrado, sin cuenta asociada por esta tabla. |
| `PUNTUACION` | `SMALLINT`, NN; entre 1 y 5 | Calificación. |
| `COMENTARIO` | `TEXT`, NN; mínimo 10 caracteres | Texto de la reseña. |
| `FECHA_CREACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha y hora de publicación. |

### `CONTROL_LIMPIEZA_RESENAS` — fecha de limpieza de reseñas

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_CONTROL` | `SERIAL`, PK | Identificador del registro de control. |
| `ULTIMA_LIMPIEZA` | `DATE`, NN; por defecto `CURRENT_DATE` | Fecha de la última limpieza registrada. |

### `AUDITORIA` — registro de operaciones

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_AUDITORIA` | `SERIAL`, NN, PK | Identificador del evento. |
| `FECHA_HORA` | `TIMESTAMP WITHOUT TIME ZONE`, NN | Fecha y hora del evento. |
| `ID_USUARIO` | `VARCHAR(10)`, FK → `USUARIOS.ID_PERSONA`; nulo o 6 o más dígitos | Usuario asociado, si aplica. |
| `ID_EMPRESA` | `VARCHAR(10)`, FK → `EMPRESAS.ID_EMPRESA` | Empresa asociada, si aplica. |
| `ID_PERSONA_ECOMMERCE` | `VARCHAR(10)`, FK → `PERSONAS_ECOMMERCE.ID_PERSONA_ECOMMERCE` | Persona vendedora asociada, si aplica. |
| `NOM_OPERACION` | `VARCHAR(50)`, NN | Nombre de la operación. |
| `DETALLE` | `TEXT` | Detalle textual opcional. |
| `NIVEL` | `VARCHAR(20)`, NN; por defecto `info`; `info`, `advertencia` o `error` | Nivel del evento. |
| `REG_ANTERIOR` | `JSONB` | Estado anterior, si se registra. |
| `REG_NUEVO` | `JSONB` | Estado nuevo, si se registra. |
| `TABLA_AFECTADA` | `VARCHAR(30)`; nula o mínimo 3 caracteres | Tabla modificada, si aplica. |

### `PRODUCTOS_ARTESANALES` — catálogo de productos artesanales

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_PRODUCTO` | `SERIAL`, NN, PK | Identificador del producto. |
| `NOM_PRODUCTO` | `VARCHAR(100)`, NN; mínimo 3 caracteres | Nombre comercial. |
| `PROVEEDOR` | `VARCHAR(80)`, NN; mínimo 3 caracteres | Nombre del proveedor o vendedor. |
| `CATEGORIA` | `VARCHAR(20)`, NN; `talleres`, `bisuteria` o `alfareria` | Categoría del producto. |
| `PRECIO_COP` | `DECIMAL(10,0)`, NN; mayor que 0 | Precio en pesos colombianos. |
| `ID_CIUDAD` | `VARCHAR(6)`, NN, FK → `CIUDADES.ID_CIUDAD`; al menos 5 caracteres | Ciudad de origen o ubicación. |
| `NUM_CONTACTO` | `VARCHAR(20)`, NN; entre 7 y 20 dígitos o espacios, con `+` inicial opcional | Teléfono de contacto. |
| `DESCRIPCION` | `TEXT`, NN; mínimo 10 caracteres | Descripción del producto. |
| `IMG_URL` | `VARCHAR(255)`; nula o mínimo 5 caracteres | URL de imagen opcional. |
| `ID_PERSONA_ECOMMERCE` | `VARCHAR(10)`, FK → `PERSONAS_ECOMMERCE.ID_PERSONA_ECOMMERCE` | Cuenta de vendedor asociada, si aplica. |
| `FECHA_REGISTRO` | `TIMESTAMP`, NN; por defecto `CURRENT_TIMESTAMP` | Fecha de registro. |

### `FESTIVIDADES_SANTANDER` — catálogo de festividades

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_FESTIVIDAD` | `VARCHAR(40)`, NN, PK; mínimo 3 caracteres | Clave identificadora de la festividad. |
| `FECHA_CLAVE` | `CHAR(5)`, NN; patrón `MM-DD` | Fecha clave anual. |
| `SUBTITULO` | `VARCHAR(80)`, NN; mínimo 3 caracteres | Subtítulo o ubicación descriptiva. |
| `TITULO` | `VARCHAR(120)`, NN; mínimo 3 caracteres | Nombre de la festividad. |
| `FRASE` | `VARCHAR(200)`, NN; mínimo 5 caracteres | Texto promocional. |
| `EMOJI` | `VARCHAR(10)`, NN; mínimo 1 carácter | Emoji asociado. |
| `COLOR_1` | `CHAR(7)`, NN; color hexadecimal `#RRGGBB` | Primer color de presentación. |
| `COLOR_2` | `CHAR(7)`, NN; color hexadecimal `#RRGGBB` | Segundo color de presentación. |
| `COLOR_3` | `CHAR(7)`, NN; color hexadecimal `#RRGGBB` | Tercer color de presentación. |
| `BG_CARD` | `CHAR(7)`, NN; color hexadecimal `#RRGGBB` | Color de fondo de la tarjeta. |
| `TIPO` | `VARCHAR(10)`, NN; por defecto `REGIONAL`; `REGIONAL` o `NACIONAL` | Alcance de la festividad. |
| `ID_CIUDAD` | `VARCHAR(6)`, FK → `CIUDADES.ID_CIUDAD`; nulo o al menos 5 caracteres | Ciudad relacionada, si aplica. |

### `CONFIG_EMPRESA` — preferencias de empresas

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_CONFIG` | `SERIAL`, NN, PK | Identificador de configuración. |
| `ID_EMPRESA` | `VARCHAR(10)`, NN, UQ, FK → `EMPRESAS.ID_EMPRESA`; longitud 10 | Empresa titular; permite como máximo una configuración por empresa. |
| `NOTIF_CANCELACIONES` | `BOOLEAN`, NN; por defecto `TRUE` | Preferencia de notificación de cancelaciones. |
| `NOTIF_BOLETIN` | `BOOLEAN`, NN; por defecto `FALSE` | Preferencia de boletín. |
| `TEMA_OSCURO` | `BOOLEAN`, NN; por defecto `FALSE` | Preferencia de tema oscuro. |
| `FECHA_ACTUALIZACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha de última actualización. |

### `CONFIG_ADMIN` — preferencias administrativas

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_CONFIG` | `SERIAL`, NN, PK | Identificador de configuración. |
| `ID_USUARIO` | `VARCHAR(10)`, NN, UQ, FK → `USUARIOS.ID_PERSONA`; al menos 6 caracteres | Usuario titular; permite como máximo una configuración por usuario. |
| `NOTIF_NUEVAS_RESERVAS` | `BOOLEAN`, NN; por defecto `TRUE` | Preferencia de notificación de nuevas reservas. |
| `NOTIF_CANCELACIONES` | `BOOLEAN`, NN; por defecto `TRUE` | Preferencia de notificación de cancelaciones. |
| `NOTIF_NUEVAS_RESENAS` | `BOOLEAN`, NN; por defecto `TRUE` | Preferencia de notificación de nuevas reseñas. |
| `NOTIF_BOLETIN_MENSUAL` | `BOOLEAN`, NN; por defecto `FALSE` | Preferencia de boletín mensual. |
| `TEMA_OSCURO` | `BOOLEAN`, NN; por defecto `FALSE` | Preferencia de tema oscuro. |
| `FECHA_ACTUALIZACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha de última actualización. |

### `HISTORICO_USUARIO` — instantáneas históricas de usuarios

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_HIST_USUARIO` | `SERIAL`, PK | Identificador del evento histórico. |
| `ID_USUARIO_ORIGINAL` | `VARCHAR(10)`, NN | Identificador del usuario original; no declara FK. |
| `DATOS_SNAPSHOT` | `JSONB` | Instantánea de los datos del usuario. |
| `ACCION` | `VARCHAR(10)` | Acción registrada. |
| `FECHA_MODIFICACION` | `TIMESTAMP`; por defecto `CURRENT_TIMESTAMP` | Fecha y hora de modificación. |
| `USUARIO_RESPONSABLE` | `VARCHAR(100)`; por defecto `CURRENT_USER` | Usuario de base de datos responsable. |

### `HISTORICO_EMPRESA` — instantáneas históricas de empresas

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_HIST_EMPRESA` | `SERIAL`, PK | Identificador del evento histórico. |
| `ID_EMPRESA_ORIGINAL` | `VARCHAR(10)`, NN | Identificador de la empresa original; no declara FK. |
| `DATOS_SNAPSHOT` | `JSONB` | Instantánea de los datos de la empresa. |
| `ACCION` | `VARCHAR(10)` | Acción registrada. |
| `FECHA_MODIFICACION` | `TIMESTAMP`; por defecto `CURRENT_TIMESTAMP` | Fecha y hora de modificación. |
| `USUARIO_RESPONSABLE` | `VARCHAR(100)`; por defecto `CURRENT_USER` | Usuario de base de datos responsable. |

### `HISTORICO_USUARIOS_EMPRESA` — instantáneas históricas de cuentas empresariales

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_HIST_USU_EMP` | `SERIAL`, PK | Identificador del evento histórico. |
| `ID_EMPRESA_ORIGINAL` | `VARCHAR(10)`, NN | Empresa de la cuenta original; no declara FK. |
| `DATOS_SNAPSHOT` | `JSONB` | Instantánea de los datos de la cuenta empresarial. |
| `ACCION` | `VARCHAR(10)` | Acción registrada. |
| `FECHA_MODIFICACION` | `TIMESTAMP`; por defecto `CURRENT_TIMESTAMP` | Fecha y hora de modificación. |
| `USUARIO_RESPONSABLE` | `VARCHAR(100)`; por defecto `CURRENT_USER` | Usuario de base de datos responsable. |

### `HISTORICO_PLAN_TURISTICO` — instantáneas históricas de planes

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_HIST_PLAN` | `SERIAL`, PK | Identificador del evento histórico. |
| `ID_PLAN_ORIGINAL` | `INT`, NN | Identificador del plan original; no declara FK. |
| `DATOS_SNAPSHOT` | `JSONB` | Instantánea de los datos del plan. |
| `ACCION` | `VARCHAR(10)` | Acción registrada. |
| `FECHA_MODIFICACION` | `TIMESTAMP`; por defecto `CURRENT_TIMESTAMP` | Fecha y hora de modificación. |
| `USUARIO_RESPONSABLE` | `VARCHAR(100)`; por defecto `CURRENT_USER` | Usuario de base de datos responsable. |

### `INTENTOS_LOGIN` — registro de intentos de inicio de sesión

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_INTENTO` | `SERIAL`, NN, PK | Identificador del intento. |
| `EMAIL` | `VARCHAR`, NN; formato de correo | Correo usado en el intento. |
| `IP_ORIGEN` | `VARCHAR(45)`, NN; patrón IPv4 o hexadecimal/colon para IPv6 | Dirección IP de origen. |
| `EXITOSO` | `BOOLEAN`, NN; por defecto `FALSE` | Indica si el intento fue exitoso. |
| `FECHA_INTENTO` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha y hora del intento. |

### `TOKENS_RECUPERACION` — tokens para recuperar acceso

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_TOKEN` | `SERIAL`, NN, PK | Identificador del token de recuperación. |
| `EMAIL` | `VARCHAR`, NN; formato de correo | Correo asociado a la recuperación. |
| `ID_USUARIO` | `VARCHAR(10)`, FK → `USUARIOS.ID_PERSONA`; nulo o al menos 6 caracteres | Usuario administrativo al que aplica, si corresponde. |
| `ID_EMPRESA` | `VARCHAR(10)`, FK → `USUARIOS_EMPRESA.ID_EMPRESA`; nulo o longitud 10 | Cuenta empresarial a la que aplica, si corresponde. |
| `TOKEN` | `VARCHAR(64)`, NN, UQ; 64 caracteres hexadecimales minúsculos | Valor del token. |
| `FECHA_CREACION` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha y hora de creación. |
| `FECHA_EXPIRA` | `TIMESTAMP`, NN; posterior a `FECHA_CREACION` | Fecha y hora de expiración. |
| `USADO` | `BOOLEAN`, NN; por defecto `FALSE` | Indica si el token ya fue utilizado. |

### `LIKES_RESENAS` — reacciones a reseñas

| Campo | Tipo y reglas | Descripción |
|---|---|---|
| `ID_LIKE` | `SERIAL`, PK | Identificador de la reacción. |
| `ID_RESENA` | `INT`, NN, FK → `RESENAS_PLATAFORMA.ID_RESENA`; mayor que 0; borrado en cascada | Reseña reaccionada. |
| `VISITOR_ID` | `VARCHAR(64)`, NN; entre 10 y 64 caracteres | Identificador del visitante anónimo. |
| `FECHA_LIKE` | `TIMESTAMP`, NN; por defecto `NOW()` | Fecha y hora de la reacción. |

La restricción única `ux_likes_visitor` sobre (`ID_RESENA`, `VISITOR_ID`) limita a una reacción por visitante y reseña. El índice `idx_likes_resena` apoya la consulta de reacciones por reseña.

## Restricciones e índices adicionales

- `CONTENIDO_PORTADA` tiene el índice `IDX_CONTENIDO_PORTADA_PUBLICADO_ORDEN` sobre (`PUBLICADO`, `ORDEN`, `TITULO`).
- `LIKES_RESENAS` tiene el índice único `ux_likes_visitor` y el índice `idx_likes_resena`.
- En las tablas de unión `HOSPEDAJE_SERVICIOS` la PK es compuesta (`ID_HOSPEDAJE`, `ID_SERVICIO`). En `TRANSPORTE_CLASE`, de acuerdo con el DDL, la PK es únicamente `ID_TRANSPORTE`.
- `PLAN_COMPONENTES.TIPO_COMPONENTE` admite `TRANSPORTE`, pero el DDL no define una columna `ID_TRANSPORTE`; solo `ID_HOSPEDAJE` referencia una entidad componente. El diccionario refleja la estructura existente, no implica que se garantice la asociación a un transporte.
- `TOKENS_RECUPERACION` permite que `ID_USUARIO` e `ID_EMPRESA` sean nulos y no declara una regla `CHECK` que obligue a proporcionar exactamente uno.

