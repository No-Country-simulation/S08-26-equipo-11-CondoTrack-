/**
 * @openapi
 * components:
 *   schemas:
 *     UserBuildingRole:
 *       type: object
 *       required:
 *         - userId
 *         - buildingId
 *         - roleId
 *       properties:
 *         userId:
 *           type: integer
 *           description: Identificador del usuario
 *           example: 1
 *         buildingId:
 *           type: integer
 *           description: Identificador del edificio
 *           example: 1
 *         roleId:
 *           type: integer
 *           description: Identificador del rol
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de asignación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */