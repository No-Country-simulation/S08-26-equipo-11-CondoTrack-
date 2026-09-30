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

export {};
