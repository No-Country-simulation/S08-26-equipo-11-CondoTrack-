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
 *         Devuelve las unidades pertenecientes a un edificio. Requiere rol
 *         SUPER_ADMIN o ADMIN asignado al edificio indicado.
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
 */

export {};
