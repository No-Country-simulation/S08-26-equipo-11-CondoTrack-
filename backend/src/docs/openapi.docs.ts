/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Los endpoints de auth emiten este token (firmado con `JWT_SECRET`, expira según `JWT_EXPIRES_IN`), pero en la rama `backend` todavía no existe un middleware que proteja rutas con él; queda documentado para cuando se agregue el guard de autenticación.
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
 */

export {};
