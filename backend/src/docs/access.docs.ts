/**
 * @openapi
 * tags:
 *   - name: Visits
 *     description: "Autorizaciones de visita: un RESIDENT de la unidad, o ADMIN/SUPER_ADMIN del edificio, genera un pase de acceso con token UUID para el QR."
 *   - name: Access
 *     description: "Flujo de porteria: validar el QR de ingreso, buscar la visita por DNI o apellido y registrar la salida. Solo RECEPTION, ADMIN y SUPER_ADMIN."
 *
 * /api/units/{unitId}/visits:
 *   post:
 *     tags: [Visits]
 *     summary: Autorizar la visita de un visitante a una unidad
 *     description: "Crea una access_authorization para la unidad. RESIDENT solo para su propia unidad (vinculo activo via unit_people); ADMIN solo en sus edificios; SUPER_ADMIN en todas. El token se devuelve en claro para que el frontend dibuje el QR; en BD solo se guarda su hash SHA-256 en qr_token_hash. qrImage es el PNG data URL generado con la libreria qrcode a partir del token y no se almacena en BD."
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
 *                 qrImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
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
/**
 * @openapi
 * tags:
 *   - name: Visits
 *     description: "Autorizaciones de visita: un RESIDENT de la unidad, o ADMIN/SUPER_ADMIN del edificio, genera un pase de acceso con token UUID para el QR."
 *   - name: Access
 *     description: "Flujo de porteria: validar el QR de ingreso, buscar la visita por DNI o apellido y registrar la salida. Solo RECEPTION, ADMIN y SUPER_ADMIN."
 *
 * /api/units/{unitId}/visits:
 *   post:
 *     tags: [Visits]
 *     summary: Autorizar la visita de un visitante a una unidad
 *     description: "Crea una access_authorization para la unidad. RESIDENT solo para su propia unidad (vinculo activo via unit_people); ADMIN solo en sus edificios; SUPER_ADMIN en todas. El token se devuelve en claro para que el frontend dibuje el QR; en BD solo se guarda su hash SHA-256 en qr_token_hash. qrImage es el PNG data URL generado con la libreria qrcode a partir del token y no se almacena en BD."
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
 *                 qrImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
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
 * /api/access/validate:
 *   post:
 *     tags: [Access]
 *     summary: Validar el QR de ingreso
 *     description: "Hashea el qrToken recibido con SHA-256 y busca la access_authorization por qr_token_hash. Si no existe o si valid_until ya paso responde 400 con mensaje de la aplicacion. Si es valida y el usuario tiene alcance sobre el edificio, crea el access_event ENTRY con access_method QR, pasa la autorizacion a READ y devuelve el visitante y la unidad de destino. El QR representa el token original y qr_token_hash nunca se expone."
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qrToken]
 *             properties:
 *               qrToken:
 *                 type: string
 *                 description: Token original que representa el QR entregado en POST /api/units/{unitId}/visits
 *           example:
 *             qrToken: '11111111-1111-4111-8111-111111111111'
 *     responses:
 *       '200':
 *         description: Ingreso registrado
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: '00000000-0000-0000-0000-000000000001'
 *                 status: READ
 *                 validFrom: '2026-09-29T18:00:00Z'
 *                 validUntil: '2026-09-29T19:00:00Z'
 *                 visitor:
 *                   id: '00000000-0000-0000-0000-000000000030'
 *                   firstName: Juan
 *                   lastName: Pérez
 *                   documentType: DNI
 *                   documentNumber: '33445566'
 *                 unit:
 *                   id: '00000000-0000-0000-0000-000000000010'
 *                   code: '1'
 *                 event:
 *                   id: '00000000-0000-0000-0000-000000000040'
 *                   eventType: ENTRY
 *                   accessMethod: QR
 *                   occurredAt: '2026-09-29T18:05:00Z'
 *       '400': { description: Token inexistente, vencido o body sin qrToken }
 *       '401': { description: No autorizado }
 *       '403': { description: Rol no habilitado o usuario de otro edificio }
 *
 * /api/access/search:
 *   get:
 *     tags: [Access]
 *     summary: Buscar la visita por DNI o apellido
 *     description: "Busca por documentNumber o lastName del visitante, de forma parcial y sin distincion de mayusculas, solo sobre autorizaciones vigentes (valid_until en el futuro o sin vencimiento). El resultado se limita a los edificios del usuario y SUPER_ADMIN conserva alcance global. El id devuelto es el authorization.id que consume PATCH /api/access/{id}/exit."
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema: { type: string, maxLength: 100, example: '33445566' }
 *         description: DNI o apellido del visitante
 *     responses:
 *       '200':
 *         description: Coincidencias vigentes
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: '00000000-0000-0000-0000-000000000001'
 *                   status: PENDING
 *                   validFrom: '2026-09-29T18:00:00Z'
 *                   validUntil: '2026-09-29T19:00:00Z'
 *                   visitor:
 *                     id: '00000000-0000-0000-0000-000000000030'
 *                     firstName: Juan
 *                     lastName: Pérez
 *                     documentType: DNI
 *                     documentNumber: '33445566'
 *                   unit:
 *                     id: '00000000-0000-0000-0000-000000000010'
 *                     code: '1'
 *                   building:
 *                     id: '00000000-0000-0000-0000-000000000002'
 *                     name: Torre Norte
 *       '400': { description: query vacío o mayor a 100 caracteres }
 *       '401': { description: No autorizado }
 *       '403': { description: Rol no habilitado }
 *
 * /api/access/{id}/exit:
 *   patch:
 *     tags: [Access]
 *     summary: Registrar la salida de la visita
 *     description: "Registra el access_event EXIT con access_method MANUAL, porque la salida la anota la porteria y no el visitante. Exige un ENTRY previo y responde 400 si la salida ya estaba registrada. El id corresponde a access_authorizations.id."
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Identificador de la access_authorization
 *     responses:
 *       '200':
 *         description: Salida registrada
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: '00000000-0000-0000-0000-000000000001'
 *                 status: READ
 *                 visitor:
 *                   id: '00000000-0000-0000-0000-000000000030'
 *                   firstName: Juan
 *                   lastName: Pérez
 *                   documentType: DNI
 *                   documentNumber: '33445566'
 *                 unit:
 *                   id: '00000000-0000-0000-0000-000000000010'
 *                   code: '1'
 *                 event:
 *                   id: '00000000-0000-0000-0000-000000000041'
 *                   eventType: EXIT
 *                   accessMethod: MANUAL
 *                   occurredAt: '2026-09-29T19:30:00Z'
 *       '400': { description: id no UUID, sin ingreso previo o salida ya registrada }
 *       '401': { description: No autorizado }
 *       '403': { description: Rol no habilitado o usuario de otro edificio }
 *       '404': { description: Autorización inexistente }
 */

export {};
