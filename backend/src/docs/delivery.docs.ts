/**
 * @openapi
 * /api/units/{unitId}/deliveries:
 *   post:
 *     tags: [Deliveries]
 *     summary: Registrar un paquete recibido en portería
 *     description: >
 *       RECEPTION o ADMIN del edificio, o SUPER_ADMIN.
 *       recipientPersonId debe estar vinculado a la unidad.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [recipientPersonId, carrier]
 *             properties:
 *               recipientPersonId:
 *                 type: string
 *                 format: uuid
 *               carrier:
 *                 type: string
 *                 enum: [Mercado Libre, Correo Argentino, Andreani, OCA, DHL, Otro]
 *               trackingNumber:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 100
 *           example:
 *             recipientPersonId: '00000000-0000-0000-0000-000000000002'
 *             carrier: Mercado Libre
 *             trackingNumber: ML-123456
 *     responses:
 *       '201':
 *         description: Paquete registrado con estado RECEIVED
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: '00000000-0000-0000-0000-000000000003'
 *                 status: RECEIVED
 *                 carrier: Mercado Libre
 *                 trackingNumber: ML-123456
 *                 receivedAt: '2026-09-28T18:00:00.000Z'
 *       '400': { description: Datos inválidos o destinatario no vinculado a la unidad }
 *       '401': { description: JWT inválido o ausente }
 *       '403': { description: Sin permisos en el edificio }
 *       '404': { description: Unidad inexistente }
 *
 * /api/deliveries/{id}/deliver:
 *   patch:
 *     tags: [Deliveries]
 *     summary: Marcar un paquete como entregado
 *     description: >
 *       RECEPTION o ADMIN del edificio, o SUPER_ADMIN.
 *       El usuario del token queda registrado como quien procesó la entrega.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Paquete actualizado a PICKED_UP
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: '00000000-0000-0000-0000-000000000003'
 *                 status: PICKED_UP
 *                 pickedUpByUserId: '00000000-0000-0000-0000-000000000004'
 *                 pickedUpAt: '2026-09-28T19:00:00.000Z'
 *       '400': { description: ID inválido }
 *       '401': { description: JWT inválido o ausente }
 *       '403': { description: Sin permisos en el edificio }
 *       '404': { description: Paquete inexistente }
 *       '409': { description: Paquete ya entregado o fuera de estado RECEIVED/NOTIFIED }
 *
 * /api/buildings/{buildingId}/deliveries:
 *   get:
 *     tags: [Deliveries]
 *     summary: Listar paquetes de un edificio
 *     description: >
 *       RECEPTION o ADMIN del edificio, o SUPER_ADMIN.
 *       Puede filtrar por estado.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [RECEIVED, NOTIFIED, PICKED_UP, RETURNED, LOST]
 *     responses:
 *       '200':
 *         description: Paquetes ordenados por fecha de recepción descendente
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: '00000000-0000-0000-0000-000000000003'
 *                   status: RECEIVED
 *                   carrier: OCA
 *       '400': { description: ID o filtro inválido }
 *       '401': { description: JWT inválido o ausente }
 *       '403': { description: Sin permisos en el edificio }
 *       '404': { description: Edificio inexistente }
 */
/**
 * @openapi
 * /api/deliveries/mine:
 *   get:
 *     tags: [Deliveries]
 *     summary: Listar deliveries de las unidades del residente autenticado
 *     description: >
 *       Permite a un usuario con rol RESIDENT consultar únicamente
 *       los deliveries correspondientes a sus unidades activas.
 *       El alcance se determina a partir del usuario autenticado.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [RECEIVED, NOTIFIED, PICKED_UP, RETURNED, LOST]
 *         description: Filtrar deliveries por estado
 *     responses:
 *       '200':
 *         description: Lista de deliveries de las unidades del residente
 *       '400':
 *         description: Filtro inválido
 *       '401':
 *         description: JWT inválido o ausente
 *       '403':
 *         description: El usuario no tiene rol RESIDENT
 */

export {};
