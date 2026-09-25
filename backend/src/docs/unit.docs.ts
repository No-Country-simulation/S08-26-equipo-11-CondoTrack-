/**
 * @openapi
 * paths:
 *   /api/buildings/{buildingId}/units:
 *     post:
 *       tags:
 *         - Units
 *       summary: Crear una unidad en un edificio
 *       description: >
 *         Crea una unidad asociada a un edificio activo. Requiere autenticación
 *         y rol SUPER_ADMIN o ADMIN asignado al edificio indicado.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: buildingId
 *           required: true
 *           description: Identificador UUID del edificio.
 *           schema:
 *             type: string
 *             format: uuid
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateUnitRequest'
 *             example:
 *               code: 4B
 *               floor: 4
 *               unitType: DEPARTMENT
 *               description: Departamento de dos ambientes
 *       responses:
 *         '201':
 *           description: Unidad creada correctamente.
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
 *                     $ref: '#/components/schemas/Unit'
 *         '400':
 *           description: Datos inválidos, edificio inactivo o identificador incorrecto.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '401':
 *           description: Token ausente, inválido o expirado.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '403':
 *           description: El usuario no tiene permisos sobre el edificio.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '404':
 *           description: Edificio no encontrado.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '409':
 *           description: >
 *             Ya existe una unidad con el mismo código o el edificio alcanzó
 *             la cantidad máxima de unidades.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *
 *     get:
 *       tags:
 *         - Units
 *       summary: Listar las unidades de un edificio
 *       description: >
 *         Devuelve las unidades pertenecientes a un edificio. Por defecto incluye
 *         únicamente unidades activas. Requiere rol SUPER_ADMIN o ADMIN asignado
 *         al edificio indicado.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: buildingId
 *           required: true
 *           description: Identificador UUID del edificio.
 *           schema:
 *             type: string
 *             format: uuid
 *         - in: query
 *           name: page
 *           required: false
 *           description: Número de página.
 *           schema:
 *             type: integer
 *             minimum: 1
 *             default: 1
 *         - in: query
 *           name: limit
 *           required: false
 *           description: Cantidad de resultados por página.
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 20
 *         - in: query
 *           name: code
 *           required: false
 *           description: Búsqueda parcial por código de unidad.
 *           schema:
 *             type: string
 *           example: 4B
 *         - in: query
 *           name: floor
 *           required: false
 *           description: Filtro por piso.
 *           schema:
 *             type: integer
 *             minimum: 0
 *         - in: query
 *           name: unitType
 *           required: false
 *           description: Filtro por tipo de unidad.
 *           schema:
 *             type: string
 *           example: DEPARTMENT
 *         - in: query
 *           name: isActive
 *           required: false
 *           description: Filtro por estado de la unidad.
 *           schema:
 *             type: boolean
 *         - in: query
 *           name: includeInactive
 *           required: false
 *           description: >
 *             Incluye unidades activas e inactivas cuando es `true`. Solo puede
 *             utilizarse por usuarios con rol `SUPER_ADMIN` o `ADMIN` asignado
 *             al edificio indicado.
 *           schema:
 *             type: boolean
 *             default: false
 *       responses:
 *         '200':
 *           description: Unidades obtenidas correctamente.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 required:
 *                   - success
 *                   - data
 *                   - pagination
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Unit'
 *                   pagination:
 *                     type: object
 *                     properties:
 *                       page:
 *                         type: integer
 *                         example: 1
 *                       limit:
 *                         type: integer
 *                         example: 20
 *                       total:
 *                         type: integer
 *                         example: 8
 *                       totalPages:
 *                         type: integer
 *                         example: 1
 *         '400':
 *           description: Parámetros o filtros inválidos.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '401':
 *           description: Token ausente, inválido o expirado.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '403':
 *           description: >
 *             El usuario no tiene rol SUPER_ADMIN ni rol ADMIN asignado al edificio.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '404':
 *           description: Edificio no encontrado.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @openapi
 * paths:
 *   /api/units/{unitId}/residents:
 *     post:
 *       tags:
 *         - Residents
 *       summary: Vincular un usuario registrado como residente de una unidad
 *       description: >
 *         Busca una cuenta por email y crea un vínculo residencial activo con
 *         la unidad. Asegura el rol RESIDENT en el edificio de la unidad y
 *         registra la operación en audit_logs. Solo puede hacerlo un
 *         SUPER_ADMIN o un ADMIN asignado a ese edificio.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: unitId
 *           required: true
 *           description: Identificador UUID de la unidad.
 *           schema:
 *             type: string
 *             format: uuid
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *             example:
 *               email: residente@ejemplo.com
 *       responses:
 *         '201':
 *           description: Residente vinculado correctamente.
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
 *                       - unitId
 *                       - userId
 *                       - personId
 *                       - relationshipType
 *                       - startDate
 *                       - endDate
 *                     properties:
 *                       unitId:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       personId:
 *                         type: string
 *                         format: uuid
 *                       relationshipType:
 *                         type: string
 *                         example: RESIDENT
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *         '400':
 *           description: Email o identificador de unidad inválido.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '401':
 *           description: Token ausente, inválido o expirado.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '403':
 *           description: El usuario no administra el edificio de la unidad.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '404':
 *           description: Unidad o usuario registrado no encontrado.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '409':
 *           description: >
 *             El usuario ya está vinculado a la unidad o su cuenta no tiene
 *             una persona asociada.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *
 *     get:
 *       tags:
 *         - Residents
 *       summary: Listar residentes activos de una unidad
 *       description: >
 *         Devuelve los vínculos de tipo RESIDENT de la unidad cuya fecha de
 *         finalización es nula. Requiere SUPER_ADMIN o ADMIN asignado al
 *         edificio de la unidad.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: unitId
 *           required: true
 *           description: Identificador UUID de la unidad.
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         '200':
 *           description: Residentes activos obtenidos correctamente.
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
 *                     type: array
 *                     items:
 *                       type: object
 *                       required:
 *                         - unitId
 *                         - personId
 *                         - userId
 *                         - email
 *                         - firstName
 *                         - lastName
 *                         - relationshipType
 *                         - startDate
 *                         - endDate
 *                       properties:
 *                         unitId:
 *                           type: string
 *                           format: uuid
 *                         personId:
 *                           type: string
 *                           format: uuid
 *                         userId:
 *                           type: string
 *                           format: uuid
 *                           nullable: true
 *                         email:
 *                           type: string
 *                           format: email
 *                           nullable: true
 *                         firstName:
 *                           type: string
 *                           nullable: true
 *                         lastName:
 *                           type: string
 *                           nullable: true
 *                         relationshipType:
 *                           type: string
 *                           example: RESIDENT
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *         '400':
 *           description: Identificador de unidad inválido.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '401':
 *           description: Token ausente, inválido o expirado.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '403':
 *           description: El usuario no administra el edificio de la unidad.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '404':
 *           description: Unidad no encontrada.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 */

export {};
