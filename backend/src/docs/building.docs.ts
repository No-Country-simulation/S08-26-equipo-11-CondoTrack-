/**
 * @openapi
 * paths:
 *   /api/buildings:
 *     post:
 *       tags:
 *         - Buildings
 *       summary: Crear un edificio
 *       description: Crea un nuevo edificio. Requiere autenticación mediante JWT y rol `SUPER_ADMIN`.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateBuildingRequest'
 *             example:
 *               name: Torres del Parque
 *               address: Av. Siempre Viva 123
 *               city: Buenos Aires
 *               state: Buenos Aires
 *               numberOfFloors: 12
 *               numberOfUnits: 48
 *               zipCode: C1425
 *               description: Edificio residencial.
 *       responses:
 *         '201':
 *           description: Edificio creado correctamente
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
 *                     $ref: '#/components/schemas/Building'
 *         '400':
 *           description: Error de validación en los datos enviados
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: numberOfFloors debe ser mayor a 0
 *         '401':
 *           description: JWT ausente, inválido o expirado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '403':
 *           description: El usuario autenticado no tiene rol SUPER_ADMIN
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *
 *     get:
 *       tags:
 *         - Buildings
 *       summary: Listar edificios
 *       description: >
 *         Devuelve los edificios ordenados alfabéticamente por nombre. Por defecto
 *         incluye únicamente edificios activos. Requiere autenticación mediante JWT
 *         y rol `SUPER_ADMIN` o `ADMIN`.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: includeInactive
 *           required: false
 *           description: >
 *             Incluye edificios activos e inactivos cuando es `true`. Solo puede
 *             utilizarse por usuarios con rol `SUPER_ADMIN`.
 *           schema:
 *             type: boolean
 *             default: false
 *       responses:
 *         '200':
 *           description: Lista de edificios obtenida correctamente
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
 *                       $ref: '#/components/schemas/Building'
 *         '400':
 *           description: El valor de includeInactive no es boolean
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '401':
 *           description: JWT ausente, inválido o expirado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '403':
 *           description: >
 *             El usuario no tiene rol SUPER_ADMIN o ADMIN, o intenta incluir
 *             edificios inactivos sin rol SUPER_ADMIN.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * paths:
 *   /api/buildings/{id}:
 *     get:
 *       tags:
 *         - Buildings
 *       summary: Obtener un edificio por ID
 *       description: Devuelve los datos de un edificio específico. Requiere autenticación mediante JWT y rol `SUPER_ADMIN` o `ADMIN`.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           description: ID del edificio
 *           schema:
 *             type: string
 *             format: uuid
 *       responses:
 *         '200':
 *           description: Edificio encontrado correctamente
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
 *                     $ref: '#/components/schemas/Building'
 *         '401':
 *           description: JWT ausente, inválido o expirado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '403':
 *           description: El usuario autenticado no tiene rol SUPER_ADMIN o ADMIN
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         '404':
 *           description: Edificio no encontrado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 success: false
 *                 message: Edificio no encontrado
 */

export {};
