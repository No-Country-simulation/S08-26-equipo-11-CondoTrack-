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
  getUser,
  listUsers,
  manageUser,
} from "@/modules/users/services/usersService";
import { apiErrorMessage } from "@/core/api/api";

const UsersContext = createContext(null);

const PAGE_LIMIT = 5;

// Administración de usuarios contra GET /api/users (filtros de servidor).
// Sin buscador: el backend solo filtra por edificio y rol.
export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState({
    role: "",
    buildingId: "",
    search: "",
    page: 1,
  });
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const refreshUsers = useCallback(
    async (overrides = {}) => {
      const next = {
        role: query.role,
        buildingId: query.buildingId,
        search: query.search,
        page: query.page,
        ...overrides,
      };

      setLoading(true);
      setError("");

      try {
        // Sin parámetro search en el backend: se filtra en pantalla.
        const result = await listUsers({
          buildingId: next.buildingId,
          role: next.role,
          page: next.page,
          limit: PAGE_LIMIT,
        });
        const term = next.search.trim().toLowerCase();
        const items = term
          ? result.users.filter((user) => {
              const fullName =
                `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
              return (
                fullName.includes(term) ||
                user.email.toLowerCase().includes(term)
              );
            })
          : result.users;
        setUsers(items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        return items;
      } catch (err) {
        setUsers([]);
        setTotal(0);
        setTotalPages(1);
        setError(
          apiErrorMessage(err, "No se pudieron cargar los usuarios."),
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de usuarios
    refreshUsers();
  }, [refreshUsers]);

  const updateFilters = useCallback((patch) => {
    setQuery((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const goToPage = useCallback((nextPage) => {
    setQuery((prev) => ({ ...prev, page: nextPage }));
  }, []);

  const grantRole = async ({ userId, role, buildingId, unit }) => {
    const row = users.find((user) => user.id === userId);
    const current = row?.roles ?? [];
    const exists = current.some(
      (entry) =>
        entry.roleName === role &&
        (entry.buildingId ?? null) === (buildingId ?? null),
    );
    const next = exists
      ? current
      : [
          ...current,
          {
            roleName: role,
            buildingId: buildingId ?? null,
            unitId: unit?.id ?? null,
            unitCode: unit?.code ?? null,
          },
        ];

    const updated = await manageUser(userId, { roles: next });
    logActivity({
      actor,
      action: `Asignó rol ${role} a "${updated.email}"`,
    });
    await refreshUsers();
    return updated;
  };

  const revokeRole = async ({ userId, role, buildingId }) => {
    const row = users.find((user) => user.id === userId);
    const next = (row?.roles ?? []).filter(
      (entry) =>
        !(
          entry.roleName === role &&
          (entry.buildingId ?? null) === (buildingId ?? null)
        ),
    );

    const updated = await manageUser(userId, { roles: next });
    logActivity({
      actor,
      action: `Quitó rol ${role} a "${updated.email}"`,
    });
    await refreshUsers();
    return updated;
  };

  const setUserStatus = async ({ userId, status }) => {
    const updated = await manageUser(userId, { status });
    logActivity({
      actor,
      action: `Cambió estado a ${status} de "${updated.email}"`,
    });
    await refreshUsers();
    return updated;
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        total,
        page: query.page,
        totalPages,
        limit: PAGE_LIMIT,
        loading,
        error,
        filters: { role: query.role, buildingId: query.buildingId, search: query.search },
        updateFilters,
        goToPage,
        refreshUsers,
        getUserDetail: getUser,
        grantRole,
        revokeRole,
        setUserStatus,
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
