/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - firstName
 *         - lastName
 *         - documentType
 *         - documentNumber
 *         - email
 *         - phone
 *         - passwordHash
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador único del usuario
 *           example: 1
 *         firstName:
 *           type: string
 *           description: Nombre del usuario
 *           example: Juan
 *         lastName:
 *           type: string
 *           description: Apellido del usuario
 *           example: Pérez
 *         documentType:
 *           type: string
 *           description: Tipo de documento
 *           example: DNI
 *         documentNumber:
 *           type: string
 *           description: Número de documento
 *           example: "12345678"
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *           example: juan.perez@example.com
 *         phone:
 *           type: string
 *           description: Teléfono del usuario
 *           example: "+5491123456789"
 *         passwordHash:
 *           type: string
 *           description: Contraseña almacenada mediante hash
 *           example: "$2b$10$..."
 *         status:
 *           type: string
 *           enum:
 *             - ACTIVE
 *             - INACTIVE
 *             - BLOCKED
 *           description: Estado de la cuenta
 *           example: ACTIVE
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Fecha y hora del último inicio de sesión
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */