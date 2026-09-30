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

/**
 * El query param `role` de GET /users solo acepta estos tres valores:
 * `Invalid option: expected one of "RESIDENT"|"RECEPTION"|"MAINTENANCE"`.
 * Mandar ADMIN o SUPER_ADMIN hace fallar la petición entera, así que los
 * administradores no se pueden filtrar desde el servidor.
 */
const QUERYABLE_STAFF_ROLES = [ROLES.RECEPTION, ROLES.MAINTENANCE];

/**
 * Roles que no se pueden pedir por query param. Se detectan con una consulta
 * amplia del edificio y filtrando en cliente.
 */
const CLIENT_SIDE_STAFF_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

const STAFF_ROLES = [...QUERYABLE_STAFF_ROLES, ...CLIENT_SIDE_STAFF_ROLES];

// El listado de usuarios se pagina de a 5 en /dashboard/usuarios porque es
// una tabla con búsqueda. Acá se necesitan todas las filas para contar el
// personal, así que se pide un límite alto.
const STAFF_LIMIT = 100;

const ROLE_LABELS = {
  [ROLES.RECEPTION]: "Recepcionista / Portero",
  [ROLES.MAINTENANCE]: "Mantenimiento",
  [ROLES.ADMIN]: "Administrador",
  [ROLES.SUPER_ADMIN]: "Administrador",
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
      STAFF_ROLES.includes(entry.roleName) &&
      (!buildingId || entry.buildingId === buildingId),
  );

/**
 * Devuelve el personal de un edificio a partir del endpoint de usuarios.
 *
 * @param {string} buildingId  Edificio a filtrar.
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
      const results = await Promise.allSettled([
        // Una consulta por rol filtrable para aprovechar el backend.
        ...QUERYABLE_STAFF_ROLES.map((roleName) =>
          listUsers({ buildingId, role: roleName, limit: STAFF_LIMIT }),
        ),
        // Consulta amplia del edificio: es la única forma de ubicar a los
        // administradores, porque `role=ADMIN` el backend lo rechaza. Viene
        // también con los residentes, que se descartan en rolesForBuilding.
        listUsers({ buildingId, limit: STAFF_LIMIT }),
      ]);

      const rejected = results.filter((entry) => entry.status === "rejected");

      // Solo es un error real si no respondió ninguna consulta.
      if (results.length === rejected.length) {
        throw rejected[0].reason;
      }

      const byId = new Map();

      for (const entry of results) {
        if (entry.status !== "fulfilled") continue;

        for (const user of entry.value.users) {
          const roles = rolesForBuilding(user.roles, buildingId);
          if (roles.length === 0) continue;

          // Un mismo usuario puede aparecer en varias consultas: se le
          // acumulan los roles en vez de duplicarlo.
          const existing = byId.get(user.id);
          if (existing) {
            const seen = new Set(existing.roles.map((role) => role.roleName));
            existing.roles.push(
              ...roles.filter((role) => !seen.has(role.roleName)),
            );
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
            roleLabel:
              ROLE_LABELS[member.roles[0].roleName] ?? member.roles[0].roleName,
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
