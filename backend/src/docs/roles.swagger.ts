/**
 * @openapi
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador único del rol
 *           example: 1
 *         name:
 *           type: string
 *           description: Nombre del rol
 *           example: ADMIN
 *         description:
 *           type: string
 *           nullable: true
 *           description: Descripción del rol
 *           example: Administrador del edificio
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */