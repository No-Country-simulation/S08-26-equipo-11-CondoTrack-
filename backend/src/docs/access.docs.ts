/**
 * @openapi
 * tags:
 *   - name: Visits
 *     description: "Autorizaciones de visita: un RESIDENT de la unidad, o ADMIN/SUPER_ADMIN del edificio, genera un pase de acceso con token UUID para el QR."
 *
 * /api/units/{unitId}/visits:
 *   post:
 *     tags: [Visits]
 *     summary: Autorizar la visita de un visitante a una unidad
 *     description: "Crea una access_authorization para la unidad. RESIDENT solo para su propia unidad (vinculo activo via unit_people); ADMIN solo en sus edificios; SUPER_ADMIN en todas. El token se devuelve en claro para que el frontend dibuje el QR; en BD solo se guarda su hash SHA-256 en qr_token_hash."
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Identificador de la unidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [visitorName, visitorDni, estimatedAt]
 *             properties:
 *               visitorName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nombre y apellido del visitante; la primera palabra es firstName, el resto lastName
 *               visitorDni:
 *                 type: string
 *                 maxLength: 50
 *                 description: DNI del visitante
 *               estimatedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha/hora estimada del ingreso (ISO 8601); validFrom del pase
 *           example:
 *             visitorName: Juan Pérez
 *             visitorDni: '33445566'
 *             estimatedAt: '2026-09-28T18:00:00Z'
 *     responses:
 *       '201':
 *         description: Pase de acceso creado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: '00000000-0000-0000-0000-000000000001'
 *                 qrToken: '11111111-1111-4111-8111-111111111111'
 *                 qrTokenHash: '11111111-1111-4111-8111-111111111111'
 *                 status: PENDING
 *                 validFrom: '2026-09-28T18:00:00Z'
 *                 validUntil: '2026-09-28T19:00:00Z'
 *                 buildingId: '00000000-0000-0000-0000-000000000002'
 *                 unit:
 *                   id: '00000000-0000-0000-0000-000000000010'
 *                   code: '1'
 *                 authorizedByUserId: '00000000-0000-0000-0000-000000000020'
 *                 visitor:
 *                   id: '00000000-0000-0000-0000-000000000030'
 *                   firstName: Juan
 *                   lastName: Pérez
 *                   documentType: DNI
 *                   documentNumber: '33445566'
 *                 createdAt: '2026-09-28T17:00:00Z'
 *       '400': { description: unitId inválido o body con datos incorrectos }
 *       '401': { description: No autorizado }
 *       '403': { description: RESIDENT de otra unidad o ADMIN de otro edificio }
 *       '404': { description: Unidad inexistente }
 *
 */

export {};
