/**
 * @openapi
 * tags:
 *   - name: Incidents
 *     description: Gestión de incidentes de unidades y edificios
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Incident:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identificador único del incidente
 *         buildingId:
 *           type: string
 *           format: uuid
 *           description: Identificador del edificio
 *         unitId:
 *           type: string
 *           format: uuid
 *           description: Identificador de la unidad
 *         reportedByUserId:
 *           type: string
 *           format: uuid
 *           description: Usuario que reportó el incidente
 *         assignedToPersonId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Persona responsable asignada al incidente
 *         title:
 *           type: string
 *           maxLength: 150
 *           example: Fuga de agua
 *         description:
 *           type: string
 *           example: Se detectó una fuga de agua en el baño.
 *         severity:
 *           type: string
 *           enum:
 *             - LOW
 *             - MEDIUM
 *             - HIGH
 *             - CRITICAL
 *           example: HIGH
 *         status:
 *           type: string
 *           enum:
 *             - OPEN
 *             - IN_PROGRESS
 *             - RESOLVED
 *             - CLOSED
 *             - CANCELLED
 *           example: OPEN
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateIncidentRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - severity
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 150
 *           example: Fuga de agua
 *         description:
 *           type: string
 *           example: Se detectó una fuga de agua en el baño.
 *         severity:
 *           type: string
 *           enum:
 *             - LOW
 *             - MEDIUM
 *             - HIGH
 *             - CRITICAL
 *           example: HIGH
 *
 *     UpdateIncidentRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum:
 *             - OPEN
 *             - IN_PROGRESS
 *             - RESOLVED
 *             - CLOSED
 *             - CANCELLED
 *           example: IN_PROGRESS
 *         assignedToPersonId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Persona responsable del incidente
 */

/**
 * @openapi
 * /api/units/{unitId}/incidents:
 *   post:
 *     summary: Reportar un incidente
 *     description: Permite a un RESIDENT de la unidad o a un ADMIN reportar un incidente.
 *     tags:
 *       - Incidents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador de la unidad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateIncidentRequest'
 *     responses:
 *       201:
 *         description: Incidente creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Datos inválidos o unidad inactiva
 *       403:
 *         description: El usuario no tiene permisos para reportar incidentes en esta unidad
 *       404:
 *         description: Unidad no encontrada
 *
 * /api/buildings/{buildingId}/incidents:
 *   get:
 *     summary: Listar incidentes de un edificio
 *     description: Permite a un ADMIN o SUPER_ADMIN consultar los incidentes de un edificio.
 *     tags:
 *       - Incidents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: buildingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador del edificio
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - OPEN
 *             - IN_PROGRESS
 *             - RESOLVED
 *             - CLOSED
 *             - CANCELLED
 *         description: Filtrar incidentes por estado
 *     responses:
 *       200:
 *         description: Lista de incidentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Incident'
 *       403:
 *         description: El usuario no tiene permisos para consultar los incidentes
 *       404:
 *         description: Edificio no encontrado
 *
 * /api/incidents/{id}:
 *   patch:
 *     summary: Actualizar un incidente
 *     description: Permite a un ADMIN cambiar el estado y/o asignar una persona responsable.
 *     tags:
 *       - Incidents
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Identificador del incidente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateIncidentRequest'
 *     responses:
 *       200:
 *         description: Incidente actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: El usuario no tiene permisos para modificar el incidente
 *       404:
 *         description: Incidente no encontrado o persona asignada inexistente
 */
