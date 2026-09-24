/**
 * @openapi
 * paths:
 *   /api/auth/register:
 *     post:
 *       tags:
 *       - Auth
 *       summary: Registrar un nuevo usuario (autenticación local)
 *       description: Crea un usuario nuevo con email y contraseña, lo asocia al edificio indicado (`buildingId`) con el rol `RESIDENT` por defecto, y devuelve un JWT. Toda la operación corre dentro de una transacción de base de datos.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterRequest'
 *             example:
 *               firstName: Ana
 *               lastName: Gómez
 *               documentType: DNI
 *               documentNumber: '30111222'
 *               phone: +54 9 11 5555-5555
 *               email: ana.gomez@example.com
 *               password: SuperSegura123
 *               buildingId: 3f7c9a2e-1b4d-4a3f-9c2e-8a1b2c3d4e5f
 *       responses:
 *         '201':
 *           description: Usuario creado correctamente
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/RegisterResponse'
 *         '400':
 *           description: Error de validación (campos faltantes, email inválido, buildingId no es UUID, password menor a 8 caracteres, etc.)
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: email no tiene un formato válido; password debe tener al menos 8 caracteres
 *         '409':
 *           description: 'Conflicto: el email o el número de documento ya están registrados'
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: El email ya está registrado
 *         '500':
 *           description: Error interno (por ejemplo, el rol RESIDENT no está configurado en la base de datos)
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * paths:
 *   /api/auth/login:
 *     post:
 *       tags:
 *       - Auth
 *       summary: Iniciar sesión con email y contraseña
 *       description: Valida las credenciales del usuario y devuelve un JWT con su id y roles. La contraseña nunca se devuelve.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginRequest'
 *             example:
 *               email: ana.gomez@example.com
 *               password: SuperSegura123
 *       responses:
 *         '200':
 *           description: Inicio de sesión exitoso.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/LoginResponse'
 *         '400':
 *           description: Email inválido o contraseña vacía.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '401':
 *           description: Email no registrado o contraseña incorrecta.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Email o contraseña incorrectos
 */

/**
 * @openapi
 * paths:
 *   /api/auth/google:
 *     get:
 *       tags:
 *       - Auth
 *       summary: Iniciar login con Google
 *       description: Redirige al usuario a la pantalla de consentimiento de Google OAuth 2.0 solicitando los scopes `profile` y `email`. No se consume directamente desde clientes API/Swagger; el navegador debe seguir la redirección 302.
 *       responses:
 *         '302':
 *           description: Redirección al consent screen de Google
 */

/**
 * @openapi
 * paths:
 *   /api/auth/google/callback:
 *     get:
 *       tags:
 *       - Auth
 *       summary: Callback de Google OAuth
 *       description: 'Google redirige aquí tras la autenticación. Passport valida el perfil (`session: false`); si el usuario no existe se crea automáticamente (sin password local), si ya existe se actualiza su `googleId` y `lastLoginAt`. Devuelve un JWT propio de la API.'
 *       responses:
 *         '200':
 *           description: Autenticación con Google exitosa
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: Autenticación con Google exitosa
 *                   token:
 *                     type: string
 *                     description: JWT firmado con el id del usuario (`sub`)
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *         '401':
 *           description: Passport no pudo autenticar al usuario con Google (email ausente en el perfil, etc.)
 */
/**
 * @openapi
 * paths:
 *   /api/auth/me:
 *     get:
 *       tags:
 *         - Auth
 *       summary: Obtener el usuario autenticado
 *       description: Devuelve los datos del usuario identificado por el JWT, sus roles, edificios y unidades asignadas actualmente.
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         '200':
 *           description: Datos del usuario autenticado
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - success
 *                   - data
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: object
 *                     required:
 *                       - id
 *                       - email
 *                       - status
 *                       - roles
 *                       - buildings
 *                       - units
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       email:
 *                         type: string
 *                         format: email
 *                       status:
 *                         $ref: '#/components/schemas/UserStatus'
 *                       roles:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             roleId:
 *                               type: string
 *                               format: uuid
 *                             buildingId:
 *                               type: string
 *                               format: uuid
 *                             roleName:
 *                               type: string
 *                       buildings:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             name:
 *                               type: string
 *                       units:
 *                         type: array
 *                         description: Unidades vinculadas actualmente a la persona asociada al usuario. Puede estar vacío.
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             buildingId:
 *                               type: string
 *                               format: uuid
 *                             code:
 *                               type: string
 *                               example: 4B
 *                             floor:
 *                               type: integer
 *                               example: 4
 *                             unitType:
 *                               type: string
 *                               example: DEPARTMENT
 *                             relationshipType:
 *                               type: string
 *                               description: Tipo de vínculo de la persona con la unidad
 *         '401':
 *           description: JWT ausente, inválido o expirado, o usuario inexistente
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 */

export {};
