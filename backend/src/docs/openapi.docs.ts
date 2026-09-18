/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Los endpoints de auth emiten este token (firmado con `JWT_SECRET`, expira según `JWT_EXPIRES_IN`), pero en la rama `backend` todavía no existe un middleware que proteja rutas con él; queda documentado para cuando se agregue el guard de autenticación.
 *   schemas:
 *     HealthStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum:
 *           - ok
 *           - error
 *         services:
 *           type: object
 *           properties:
 *             database:
 *               type: string
 *               enum:
 *               - connected
 *               - disconnected
 *     ErrorResponse:
 *       type: object
 *       description: Formato de error devuelto por errorHandler. En `NODE_ENV=development` incluye además `error` y `stack`.
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *       required:
 *       - success
 *       - message
 *     RegisterRequest:
 *       type: object
 *       description: Validado con Zod (`register.dto.ts`).
 *       required:
 *       - firstName
 *       - lastName
 *       - documentType
 *       - documentNumber
 *       - phone
 *       - email
 *       - password
 *       - buildingId
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 1
 *         lastName:
 *           type: string
 *           minLength: 1
 *         documentType:
 *           type: string
 *           minLength: 1
 *           example: DNI
 *         documentNumber:
 *           type: string
 *           minLength: 1
 *         phone:
 *           type: string
 *           minLength: 1
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *         buildingId:
 *           type: string
 *           format: uuid
 *           description: Debe existir un Building con este id.
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       roleId:
 *                         type: string
 *                         format: uuid
 *                       buildingId:
 *                         type: string
 *                         format: uuid
 *                       roleName:
 *                         type: string
 *                         example: RESIDENT
 *             token:
 *               type: string
 *               description: JWT firmado
 *     User:
 *       type: object
 *       description: Tabla `users`. Corresponde 1 a 1 a `user.model.ts`.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *           maxLength: 100
 *         lastName:
 *           type: string
 *           maxLength: 100
 *         documentType:
 *           type: string
 *           nullable: true
 *           maxLength: 30
 *         documentNumber:
 *           type: string
 *           nullable: true
 *           maxLength: 50
 *           description: Único
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 150
 *           description: Único
 *         phone:
 *           type: string
 *           nullable: true
 *           maxLength: 30
 *         passwordHash:
 *           type: string
 *           nullable: true
 *           description: Hash bcrypt; null para usuarios creados solo vía Google
 *         googleId:
 *           type: string
 *           nullable: true
 *           description: Único
 *         status:
 *           $ref: '#/components/schemas/UserStatus'
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserStatus:
 *       type: string
 *       enum:
 *       - ACTIVE
 *       - INACTIVE
 *       - BLOCKED
 *       default: ACTIVE
 *     Role:
 *       type: object
 *       description: Tabla `roles`. Roles del sistema definidos en `role.types.ts`.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           $ref: '#/components/schemas/RoleName'
 *         description:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     RoleName:
 *       type: string
 *       enum:
 *       - SUPER_ADMIN
 *       - ADMIN
 *       - RECEPTION
 *       - MAINTENANCE
 *       - RESIDENT
 *     Building:
 *       type: object
 *       description: Tabla `buildings`.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           maxLength: 100
 *         address:
 *           type: string
 *           maxLength: 255
 *         city:
 *           type: string
 *           maxLength: 100
 *         state:
 *           type: string
 *           maxLength: 100
 *         numberOfFloors:
 *           type: integer
 *           minimum: 0
 *           example: 12
 *         numberOfUnits:
 *           type: integer
 *           minimum: 0
 *           example: 48
 *         zipCode:
 *           type: string
 *           nullable: true
 *           maxLength: 20
 *         description:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Baja lógica del edificio
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateBuildingRequest:
 *       type: object
 *       required:
 *       - name
 *       - address
 *       - city
 *       - state
 *       - numberOfFloors
 *       - numberOfUnits
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           example: Torres del Parque
 *         address:
 *           type: string
 *           minLength: 1
 *           example: Av. Siempre Viva 123
 *         city:
 *           type: string
 *           example: Buenos Aires
 *         state:
 *           type: string
 *           example: Buenos Aires
 *         numberOfFloors:
 *           type: integer
 *           minimum: 1
 *           example: 12
 *         numberOfUnits:
 *           type: integer
 *           minimum: 1
 *           example: 48
 *         zipCode:
 *           type: string
 *           example: C1425
 *         description:
 *           type: string
 *           example: Edificio residencial.
 *     Unit:
 *       type: object
 *       description: Tabla `units`. Combinación única de (buildingId, unitNumber).
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         buildingId:
 *           type: string
 *           format: uuid
 *         unitNumber:
 *           type: string
 *           maxLength: 20
 *           example: TORRE-A-302
 *         floor:
 *           type: integer
 *           nullable: true
 *         type:
 *           type: string
 *           nullable: true
 *           maxLength: 50
 *         areaM2:
 *           type: number
 *           format: double
 *           nullable: true
 *         description:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserBuildingRole:
 *       type: object
 *       description: 'Tabla pivote `users_buildings_roles`: asigna a un usuario un rol dentro de un edificio específico (N:M entre User, Role y Building).'
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         roleId:
 *           type: string
 *           format: uuid
 *         buildingId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AuditLog:
 *       type: object
 *       description: 'Tabla `audit_logs`: bitácora unificada de acciones sobre el sistema.'
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         buildingId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         unitId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         performedBy:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Usuario que ejecutó la acción
 *         action:
 *           type: string
 *           maxLength: 50
 *           example: CREATE
 *         tableName:
 *           type: string
 *           maxLength: 50
 *           example: units
 *         recordId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         oldValues:
 *           type: object
 *           nullable: true
 *           additionalProperties: true
 *         newValues:
 *           type: object
 *           nullable: true
 *           additionalProperties: true
 *         ipAddress:
 *           type: string
 *           nullable: true
 *           format: ipv4
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * tags:
 * - name: Sistema
 *   description: Endpoints generales de estado del servidor
 * - name: Auth
 *   description: Registro y autenticación (local y Google OAuth 2.0)
 * - name: Buildings
 *   description: Gestión de edificios
 * - name: Modelos de datos
 *   description: Entidades ya modeladas en Sequelize 
 */

/**
 * @openapi
 * paths:
 *   /:
 *     get:
 *       tags:
 *       - Sistema
 *       summary: Mensaje de bienvenida
 *       description: Endpoint raíz que confirma que la API está corriendo.
 *       responses:
 *         '200':
 *           description: La API está funcionando
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: CondoTrack API funcionando
 */

/**
 * @openapi
 * paths:
 *   /health:
 *     get:
 *       tags:
 *       - Sistema
 *       summary: Health check
 *       description: Verifica el estado del servidor y la conectividad con la base de datos PostgreSQL.
 *       responses:
 *         '200':
 *           description: El servidor y la base de datos están operativos
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/HealthStatus'
 *               example:
 *                 status: ok
 *                 services:
 *                   database: connected
 *         '503':
 *           description: El servidor está arriba pero la base de datos no responde
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/HealthStatus'
 *               example:
 *                 status: error
 *                 services:
 *                   database: disconnected
 */

/**
 * @openapi
 * paths:
 *   /api/auth/test:
 *     get:
 *       tags:
 *       - Auth
 *       summary: Ping de prueba del router de auth
 *       description: Endpoint simple para confirmar que el router `/api/auth` está montado correctamente.
 *       responses:
 *         '200':
 *           description: OK
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: Auth routes funcionando
 */

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
 *   /api-docs:
 *     get:
 *       tags:
 *       - Sistema
 *       summary: UI de Swagger
 *       description: Sirve la documentación interactiva de la API mediante Swagger UI.
 *       responses:
 *         '200':
 *           description: HTML de Swagger UI
 */

export {};