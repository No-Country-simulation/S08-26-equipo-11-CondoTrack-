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
import { useAuth } from "@/modules/auth/contexts/AuthContext";

const UsersContext = createContext(null);

const PAGE_LIMIT = 5;

/**
 * Administración de usuarios contra GET /api/users.
 *
 * Los filtros de building y role se envían al backend.
 * El buscador se realiza actualmente en el frontend.
 */
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

  /**
   * IMPORTANTE:
   *
   * `users` es el array de usuarios que estamos listando.
   * El usuario autenticado viene de useAuth().
   */
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  /**
   * Roles que pueden administrar usuarios.
   *
   * SUPER_ADMIN y ADMIN pueden acceder al listado.
   */
  const canManageUsers = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

  /**
   * El backend exige `buildingId` a los ADMIN y responde 400 sin él
   * ("El identificador del edificio es obligatorio"). Un ADMIN que todavía no
   * eligió edificio no es un error: es una pantalla a la espera de una
   * selección, así que se saltea la petición en vez de mostrar una alerta roja
   * por algo que el usuario todavía no tenía forma de completar.
   * SUPER_ADMIN sí puede listar sin edificio y sigue consultando.
   */
  const isAdminWithoutBuilding =
    user?.role === "ADMIN" && !query.buildingId;

  /**
   * Carga la lista de usuarios.
   */
  const refreshUsers = useCallback(
    async (overrides = {}) => {
      const next = {
        role: query.role,
        buildingId: query.buildingId,
        search: query.search,
        page: query.page,
        ...overrides,
      };

      if (isAdminWithoutBuilding) {
        setUsers([]);
        setTotal(0);
        setTotalPages(1);
        setLoading(false);
        setError("");
        return [];
      }

      setLoading(true);
      setError("");

      try {
        /**
         * GET /api/users
         *
         * El httpClient ya debería tener /api
         * configurado como baseURL, por lo que
         * usersService debe utilizar /users.
         */
        const result = await listUsers({
          buildingId: next.buildingId,
          role: next.role,
          page: next.page,
          limit: PAGE_LIMIT,
        });

        const term = next.search.trim().toLowerCase();

        /**
         * El backend actualmente no recibe `search`,
         * por lo que filtramos los resultados en pantalla.
         */
        const items = term
          ? result.users.filter((user) => {
              const fullName = `${user.firstName ?? ""} ${
                user.lastName ?? ""
              }`.toLowerCase();

              const email = String(user.email ?? "").toLowerCase();

              return fullName.includes(term) || email.includes(term);
            })
          : result.users;

        setUsers(items);
        setTotal(result.total);
        setTotalPages(result.totalPages);

        return items;
      } catch (err) {
        console.error("Error cargando usuarios:", err);

        setUsers([]);
        setTotal(0);
        setTotalPages(1);

        setError(apiErrorMessage(err, "No se pudieron cargar los usuarios."));

        return [];
      } finally {
        setLoading(false);
      }
    },
    [query, isAdminWithoutBuilding],
  );

  /**
   * Carga inicial.
   *
   * Antes se comprobaba `users?.roles`, pero
   * `users` es el array del listado.
   *
   * Ahora comprobamos el rol del usuario autenticado.
   */
  useEffect(() => {
    if (authLoading || !isAuthenticated || !canManageUsers) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUsers();
  }, [authLoading, isAuthenticated, canManageUsers, refreshUsers]);

  /**
   * Actualiza filtros y vuelve a la página 1.
   */
  const updateFilters = useCallback((patch) => {
    setQuery((prev) => ({
      ...prev,
      ...patch,
      page: 1,
    }));
  }, []);

  /**
   * Cambia de página.
   */
  const goToPage = useCallback((nextPage) => {
    setQuery((prev) => ({
      ...prev,
      page: nextPage,
    }));
  }, []);

  /**
   * Asigna un rol a un usuario.
   */
  const grantRole = async ({ userId, role, buildingId, unit }) => {
    /**
     * La lista GET /users puede devolver roles
     * limitados al filtro actual.
     *
     * Por eso obtenemos primero el detalle completo.
     */
    const detail = await getUser(userId);

    const current = detail.roles ?? [];

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

    const updated = await manageUser(userId, {
      roles: next,
    });

    logActivity({
      actor,
      action: `Asignó rol ${role} a "${updated.email}"`,
      buildingId: buildingId ?? null,
    });

    await refreshUsers();

    return updated;
  };

  /**
   * Revoca un rol de un usuario.
   */
  const revokeRole = async ({ userId, role, buildingId }) => {
    const detail = await getUser(userId);

    const next = (detail.roles ?? []).filter(
      (entry) =>
        !(
          entry.roleName === role &&
          (entry.buildingId ?? null) === (buildingId ?? null)
        ),
    );

    const updated = await manageUser(userId, {
      roles: next,
    });

    logActivity({
      actor,
      action: `Quitó rol ${role} a "${updated.email}"`,
      buildingId: buildingId ?? null,
    });

    await refreshUsers();

    return updated;
  };

  /**
   * Cambia el estado de un usuario.
   */
  const setUserStatus = async ({ userId, status }) => {
    const updated = await manageUser(userId, {
      status,
    });

    logActivity({
      actor,
      action: `Cambió estado a ${status} de "${updated.email}"`,
      buildingId: updated.roles?.[0]?.buildingId ?? null,
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

        filters: {
          role: query.role,
          buildingId: query.buildingId,
          search: query.search,
        },

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
