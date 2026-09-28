/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT utilizado para autenticar y autorizar el acceso a endpoints protegidos.
 */
/**
 * @openapi
 * tags:
 *   - name: Sistema
 *     description: Endpoints generales de estado del servidor
 *   - name: Auth
 *     description: Registro y autenticación (local y Google OAuth 2.0)
 *   - name: Buildings
 *     description: Gestión de edificios
 *   - name: Units
 *     description: Gestión de unidades de los edificios
 *   - name: Residents
 *     description: Vinculación y consulta de residentes de una unidad
 */

export {};
