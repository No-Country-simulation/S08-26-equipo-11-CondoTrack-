/**
 * @openapi
 * components:
 *   schemas:
 *     HealthStatus:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum:
 *             - ok
 *             - error
 *         services:
 *           type: object
 *           properties:
 *             database:
 *               type: string
 *               enum:
 *                 - connected
 *                 - disconnected
 *
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
 *         - success
 *         - message
 *
 *     RegisterRequest:
 *       type: object
 *       description: Validado con Zod (`register.dto.ts`).
 *       required:
 *         - firstName
 *         - lastName
 *         - documentType
 *         - documentNumber
 *         - phone
 *         - email
 *         - password
 *         - buildingId
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
 *
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
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: ana.gomez@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 1
 *           example: SuperSegura123
 *
 *     LoginResponse:
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
 *               description: JWT firmado con JWT_SECRET.
 *
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
 *
 *     UserStatus:
 *       type: string
 *       enum:
 *         - ACTIVE
 *         - INACTIVE
 *         - BLOCKED
 *       default: ACTIVE
 *
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
 *
 *     RoleName:
 *       type: string
 *       enum:
 *         - SUPER_ADMIN
 *         - ADMIN
 *         - RECEPTION
 *         - MAINTENANCE
 *         - RESIDENT
 *
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
 *
 *     CreateBuildingRequest:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - city
 *         - state
 *         - numberOfFloors
 *         - numberOfUnits
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
 *
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
 *
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
 *
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

export {};