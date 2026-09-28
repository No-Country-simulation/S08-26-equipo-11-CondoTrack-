/**
 * @openapi
 * /api/common-areas/{id}/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Solicitar una reserva sin conflictos de horario
 *     description: >
 *       RESIDENT del edificio y de la unidad indicada.
 *       Crea una reserva PENDING. Se rechaza si se solapa
 *       con otra PENDING o CONFIRMED del mismo espacio.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del espacio común
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required: [unitId, startAt, endAt]
 *             properties:
 *               unitId:
 *                 type: string
 *                 format: uuid
 *               startAt:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha futura con zona horaria
 *               endAt:
 *                 type: string
 *                 format: date-time
 *                 description: Posterior a startAt
 *               notes:
 *                 type: string
 *                 nullable: true
 *                 maxLength: 2000
 *           example:
 *             unitId: '00000000-0000-0000-0000-000000000002'
 *             startAt: '2026-10-10T15:00:00-03:00'
 *             endAt: '2026-10-10T17:00:00-03:00'
 *             notes: Reunión familiar
 *     responses:
 *       '201':
 *         description: Reserva creada en estado PENDING
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: '00000000-0000-0000-0000-000000000012'
 *                 status: PENDING
 *                 startAt: '2026-10-10T18:00:00.000Z'
 *                 endAt: '2026-10-10T20:00:00.000Z'
 *       '400': { description: Datos, fechas o unidad inválidos; espacio inactivo }
 *       '401': { description: JWT inválido o ausente }
 *       '403': { description: No es residente del edificio o de la unidad }
 *       '404': { description: Espacio común inexistente }
 *       '409': { description: Reserva PENDING o CONFIRMED solapada }
 *
 * /api/buildings/{buildingId}/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar reservas de un edificio
 *     description: ADMIN del edificio o SUPER_ADMIN. Incluye todos los estados.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Reservas del edificio ordenadas por inicio
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: '00000000-0000-0000-0000-000000000012'
 *                   buildingId: '00000000-0000-0000-0000-000000000001'
 *                   status: PENDING
 *       '400': { description: ID inválido }
 *       '401': { description: JWT inválido o ausente }
 *       '403': { description: Sin permisos en el edificio }
 *       '404': { description: Edificio inexistente }
 */
