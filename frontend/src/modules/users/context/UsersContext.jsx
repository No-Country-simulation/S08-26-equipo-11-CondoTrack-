import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import {
  assignRole,
  createUser,
  listUsers,
  removeRole,
} from "@/modules/users/services/usersService";
import { apiErrorMessage } from "@/core/api/api";

const UsersContext = createContext(null);

// Lista y administración de usuarios (hoy mock, mañana GET /api/users).
// Filtros en el servidor (mock: en memoria) + estado local sincronizado.
export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    buildingId: "",
  });
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const refreshUsers = useCallback(
    async (nextFilters = filters) => {
      setLoading(true);
      setError("");

      try {
        const { users: items, total: count } =
          await listUsers(nextFilters);
        setUsers(items);
        setTotal(count);
        return items;
      } catch (err) {
        setUsers([]);
        setTotal(0);
        setError(
          apiErrorMessage(err, "No se pudieron cargar los usuarios."),
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de usuarios
    refreshUsers();
  }, [refreshUsers]);

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const addUser = async (payload) => {
    const created = await createUser(payload);
    logActivity({
      actor,
      action: `Creó al usuario "${created.email}"`,
    });
    await refreshUsers();
    return created;
  };

  // Agrega una fila local para usuarios creados por fuera del store
  // (ej. alta real por POST /auth/register, que el backend aún no lista).
  // TODO(api): quitar cuando exista GET /api/users.
  const addLocalUser = useCallback(
    async ({ firstName, lastName, email, phone, buildingId }) => {
      const created = await createUser({
        firstName,
        lastName,
        email,
        phone,
        role: "RESIDENT",
        buildingId,
      });
      await refreshUsers();
      return created;
    },
    [refreshUsers],
  );

  const grantRole = async (assignment) => {
    const updated = await assignRole(assignment);
    logActivity({
      actor,
      action: `Asignó rol ${assignment.role} a "${updated.email}"`,
    });
    await refreshUsers();
    return updated;
  };

  const revokeRole = async (assignment) => {
    const updated = await removeRole(assignment);
    logActivity({
      actor,
      action: `Quitó rol ${assignment.role} a "${updated.email}"`,
    });
    await refreshUsers();
    return updated;
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        total,
        loading,
        error,
        filters,
        updateFilters,
        refreshUsers,
        addUser,
        addLocalUser,
        grantRole,
        revokeRole,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

UsersProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers debe usarse dentro de un UsersProvider");
  }
  return context;
}
