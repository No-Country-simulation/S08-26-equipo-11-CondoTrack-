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
 *           type: string
 *           format: uuid
 *           description: Identificador único del edificio
 *           example: "550e8400-e29b-41d4-a716-446655440000"
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