/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: "RESIDENT consulta y edita su propio perfil; ADMIN consulta y gestiona usuarios dentro de sus edificios; SUPER_ADMIN tiene alcance global."
 *
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios con filtros por edificio y rol
 *     description: "SUPER_ADMIN ve todos los usuarios y, si envía buildingId, filtra por él. ADMIN debe enviar buildingId y solo accede a edificios que tiene asignados (edificio ajeno devuelve 403)."
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: buildingId
 *         required: false
 *         schema: { type: string, format: uuid }
 *         description: Obligatorio para ADMIN; opcional para SUPER_ADMIN
 *       - in: query
 *         name: role
 *         required: false
 *         schema: { type: string, enum: [RESIDENT, RECEPTION, MAINTENANCE] }
 *         description: Filtra usuarios con ese rol
 *       - in: query
 *         name: page
 *         required: false
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         required: false
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 25 }
 *     responses:
 *       '200':
 *         description: Usuarios con información pública y metadata de paginación
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 items:
 *                   - id: '00000000-0000-0000-0000-000000000001'
 *                     email: persona@example.com
 *                     status: ACTIVE
 *                     person:
 *                       id: '00000000-0000-0000-0000-000000000002'
 *                       firstName: Ana
 *                       lastName: Pérez
 *                       documentType: DNI
 *                       documentNumber: '12345678'
 *                       phone: '+5491123456789'
 *                     roles:
 *                       - buildingId: '00000000-0000-0000-0000-000000000003'
 *                         roleName: RESIDENT
 *                 pagination:
 *                   page: 1
 *                   limit: 25
 *                   totalItems: 1
 *                   totalPages: 1
 *       '400': { description: ADMIN sin buildingId, UUID inválido o parámetros inválidos }
 *       '401': { description: No autorizado }
 *       '403': { description: Edificio ajeno al ADMIN }
 *
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Ver el detalle completo de un usuario
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       '200':
 *         description: Usuario, persona, roles, edificios y auditoría
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: '00000000-0000-0000-0000-000000000001'
 *                   email: persona@example.com
 *                   status: ACTIVE
 *                   createdAt: '2026-09-28T10:00:00Z'
 *                   lastLoginAt: '2026-09-28T11:00:00Z'
 *                 person:
 *                   id: '00000000-0000-0000-0000-000000000002'
 *                   firstName: Ana
 *                   lastName: Pérez
 *                   documentType: DNI
 *                   documentNumber: '12345678'
 *                   phone: '+5491123456789'
 *                 roles:
 *                   - buildingId: '00000000-0000-0000-0000-000000000003'
 *                     roleName: RESIDENT
 *                 buildings:
 *                   - id: '00000000-0000-0000-0000-000000000003'
 *                     name: Edificio Norte
 *                     address: Calle 123
 *                 audit:
 *                   loginCount: 2
 *                   lastLoginAt: '2026-09-28T11:00:00Z'
 *       '400': { description: ID inválido }
 *       '403': { description: Sin permiso para ver ese usuario }
 *       '404': { description: Usuario inexistente }
 *
 * /api/users/{id}/profile:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar datos personales propios o, si es SUPER_ADMIN, ajenos
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               documentType:
 *                 type: string
 *                 nullable: true
 *                 enum: [DNI, PASSPORT, CI, CUIT, CUIL]
 *               documentNumber: { type: string, nullable: true }
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 description: Formato E.164
 *           example:
 *             phone: '+5491123456789'
 *     responses:
 *       '200':
 *         description: Persona actualizada
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: '00000000-0000-0000-0000-000000000002'
 *                 firstName: Ana
 *                 lastName: Pérez
 *                 documentType: DNI
 *                 documentNumber: '12345678'
 *                 phone: '+5491123456789'
 *       '400': { description: Validación fallida o documento duplicado }
 *       '403': { description: Otro usuario o campo prohibido }
 *       '404': { description: Usuario o persona inexistente }
 *
 * /api/users/{id}/manage:
 *   patch:
 *     tags: [Users]
 *     summary: Gestionar estado y roles del usuario
 *     description: "ADMIN solo gestiona usuarios no administradores de sus edificios. SUPER_ADMIN tiene alcance global. Si se envía roles, reemplaza la lista completa."
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, BLOCKED]
 *               roles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [buildingId, roleName]
 *                   properties:
 *                     buildingId: { type: string, format: uuid }
 *                     roleName:
 *                       type: string
 *                       enum: [SUPER_ADMIN, ADMIN, RECEPTION, MAINTENANCE, RESIDENT]
 *           example:
 *             status: BLOCKED
 *             roles:
 *               - buildingId: '00000000-0000-0000-0000-000000000003'
 *                 roleName: RECEPTION
 *     responses:
 *       '200':
 *         description: Usuario actualizado con roles vigentes
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: '00000000-0000-0000-0000-000000000001'
 *                 email: persona@example.com
 *                 status: BLOCKED
 *                 roles:
 *                   - buildingId: '00000000-0000-0000-0000-000000000003'
 *                     roleName: RECEPTION
 *       '400': { description: Datos inválidos o rol superior no asignable }
 *       '403': { description: Jerarquía, edificio ajeno o campo prohibido }
 *       '404': { description: Usuario inexistente }
 */
