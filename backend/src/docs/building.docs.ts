/**
 * @openapi
 * paths:
 *   /api/buildings:
 *     post:
 *       tags:
 *       - Buildings
 *       summary: Registrar un nuevo edificio
 *       description: Crea un edificio nuevo. Requiere autenticación y rol SUPER_ADMIN.
 *       security:
 *       - bearerAuth: []
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
 *           description: Edificio creado correctamente.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     $ref: '#/components/schemas/Building'
 *         '400':
 *           description: Datos inválidos o campos obligatorios faltantes.
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
 *           description: El usuario no posee el rol SUPER_ADMIN.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 */

export {};