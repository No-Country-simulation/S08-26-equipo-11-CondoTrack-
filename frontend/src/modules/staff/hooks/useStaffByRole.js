import { useCallback, useEffect, useState } from "react";
import { listUsers } from "@/modules/users/services/usersService";
import { ROLES } from "@/modules/auth/constants/roles";
import { apiErrorMessage } from "@/core/api/api";

/**
 * Personal operativo de un edificio.
 *
 * No existe un endpoint `/staff`: el personal es un usuario con rol. Por eso
 * este hook consume `GET /users` y se queda solo con quienes tienen un rol
 * operativo en el edificio pedido.
 *
 * `RESIDENT` queda fuera a propósito, los residentes se gestionan en
 * /dashboard/residentes.
 */
export const STAFF_ROLE_NAMES = [ROLES.RECEPTION, ROLES.MAINTENANCE, ROLES.ADMIN];

// El listado de usuarios se pagina de a 5 en /dashboard/usuarios porque es
// una tabla con búsqueda. Acá se necesitan todas las filas del edificio para
// contar el personal, así que se pide un límite alto.
const STAFF_LIMIT = 100;

const ROLE_LABELS = {
  [ROLES.RECEPTION]: "Recepcionista / Portero",
  [ROLES.MAINTENANCE]: "Mantenimiento",
  [ROLES.ADMIN]: "Administrador",
};

/**
 * Deja solo los roles operativos del usuario dentro del edificio buscado.
 *
 * El backend puede devolver más de un rol por entrada (un ADMIN que además
 * es RECEPTION, por ejemplo) y también roles de otros edificios, así que
 * el filtrado se hace acá y no se confía en el query param.
 */
const rolesForBuilding = (roles, buildingId) =>
  roles.filter(
    (entry) =>
      STAFF_ROLE_NAMES.includes(entry.roleName) &&
      (!buildingId || entry.buildingId === buildingId),
  );

/**
 * Devuelve el personal de un edificio a partir del endpoint de usuarios.
 *
 * @param {string} buildingId  Edificio a filtrar. Si viene vacío devuelve
 *                             todo el personal operativo, sin edificio.
 */
export function useStaffByRole(buildingId) {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!buildingId) {
      setStaff([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Una consulta por rol para aprovechar el filtro del backend. Un mismo
      // usuario con dos roles operativos vuelve dos veces, se deduplica.
      const results = await Promise.all(
        STAFF_ROLE_NAMES.map((roleName) =>
          listUsers({ buildingId, role: roleName, limit: STAFF_LIMIT }),
        ),
      );

      const byId = new Map();

      for (const result of results) {
        for (const user of result.users) {
          const roles = rolesForBuilding(user.roles, buildingId);
          if (roles.length === 0) continue;

          const existing = byId.get(user.id);
          if (existing) {
            existing.roles.push(...roles);
            continue;
          }

          byId.set(user.id, { ...user, roles: [...roles] });
        }
      }

      setStaff(
        [...byId.values()]
          .map((member) => ({
            id: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone,
            status: member.status,
            roles: member.roles,
            role: member.roles[0].roleName,
            roleLabel: ROLE_LABELS[member.roles[0].roleName] ?? member.roles[0].roleName,
          }))
          .sort((a, b) => a.name.localeCompare(b.name, "es")),
      );
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo cargar el personal."));
      setStaff([]);
    } finally {
      setIsLoading(false);
    }
  }, [buildingId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial al cambiar de edificio
    load();
  }, [load]);

  return { staff, isLoading, error, refresh: load };
}
