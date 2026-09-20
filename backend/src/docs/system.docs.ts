/**
 * @openapi
 * paths:
 *   /:
 *     get:
 *       tags:
 *       - Sistema
 *       summary: Mensaje de bienvenida
 *       description: Endpoint raíz que confirma que la API está corriendo.
 *       responses:
 *         '200':
 *           description: La API está funcionando
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: CondoTrack API funcionando
 */

/**
 * @openapi
 * paths:
 *   /health:
 *     get:
 *       tags:
 *       - Sistema
 *       summary: Health check
 *       description: Verifica el estado del servidor y la conectividad con la base de datos PostgreSQL.
 *       responses:
 *         '200':
 *           description: El servidor y la base de datos están operativos
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/HealthStatus'
 *               example:
 *                 status: ok
 *                 services:
 *                   database: connected
 *         '503':
 *           description: El servidor está arriba pero la base de datos no responde
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/HealthStatus'
 *               example:
 *                 status: error
 *                 services:
 *                   database: disconnected
 */

/**
 * @openapi
 * paths:
 *   /api-docs:
 *     get:
 *       tags:
 *       - Sistema
 *       summary: UI de Swagger
 *       description: Sirve la documentación interactiva de la API mediante Swagger UI.
 *       responses:
 *         '200':
 *           description: HTML de Swagger UI
 */

export {};