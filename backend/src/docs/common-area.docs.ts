/**
 * @openapi
 * /api/buildings/{buildingId}/common-areas:
 *   post:
 *     tags: [Common Areas]
 *     summary: Crear un espacio común
 *     description: ADMIN del edificio o SUPER_ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [name, capacity]
 *             properties:
 *               name: { type: string, maxLength: 100 }
 *               description: { type: string, nullable: true }
 *               capacity: { type: integer, minimum: 1 }
 *           example:
 *             name: SUM
 *             description: Salón de usos múltiples
 *             capacity: 40
 *     responses:
 *       '201':
 *         description: Espacio común creado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: '00000000-0000-0000-0000-000000000011'
 *                 buildingId: '00000000-0000-0000-0000-000000000001'
 *                 name: SUM
 *                 description: Salón de usos múltiples
 *                 capacity: 40
 *                 isActive: true
 *       '400': { description: Datos inválidos o edificio inactivo }
 *       '401': { description: JWT inválido o ausente }
 *       '403': { description: No administra el edificio }
 *       '404': { description: Edificio inexistente }
 *
 *   get:
 *     tags: [Common Areas]
 *     summary: Listar espacios comunes activos de un edificio
 *     description: Usuario autenticado con rol en el edificio o SUPER_ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Espacios comunes activos
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: '00000000-0000-0000-0000-000000000011'
 *                   name: SUM
 *                   capacity: 40
 *                   isActive: true
 *       '400': { description: ID inválido }
 *       '401': { description: JWT inválido o ausente }
 *       '403': { description: Sin rol en el edificio }
 *       '404': { description: Edificio inexistente }
 */
