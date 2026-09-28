import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { ROLES } from "@/modules/auth/constants/roles";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import {
  createBuilding,
  listBuildings,
} from "@/modules/buildings/services/buildingsService";

const BuildingsContext = createContext(null);

// El backend solo lista edificios a SUPER_ADMIN y ADMIN (el resto recibe 403).
// Tolera roles como string ("ADMIN") u objeto ({ roleName: "ADMIN" }).
const canViewBuildings = (user) => {
  const names = [
    user?.role,
    ...(Array.isArray(user?.roles)
      ? user.roles.map((entry) =>
          typeof entry === "string" ? entry : (entry?.roleName ?? entry?.name),
        )
      : []),
  ].filter(Boolean);

  return names.some(
    (name) => name === ROLES.SUPER_ADMIN || name === ROLES.ADMIN,
  );
};

// Fallback seguro: los módulos que siguen en mock (staff, actividad,
// comunicaciones) llaman getBuildingById(...).name con ids viejos y no deben romper.
const EMPTY_BUILDING = {
  id: null,
  name: "—",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  description: "",
  floors: 0,
  capacity: 0,
  units: null,
  isActive: true,
  createdAt: null,
  updatedAt: null,
};

export function BuildingsProvider({ children }) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isAuthenticated, user } = useAuth();
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const refreshBuildings = useCallback(async () => {
    // El backend solo permite listar edificios a SUPER_ADMIN y ADMIN.
    // Sin esos roles el GET /buildings responde 403: ni lo intentamos
    // (evita el error en consola y muestra un mensaje claro).
    if (!canViewBuildings(user)) {
      setBuildings([]);
      setError(
        "Tu usuario no tiene un rol con acceso a edificios. Pedí que te asignen un edificio o un rol de administración.",
      );
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError("");

    try {
      const items = await listBuildings();
      setBuildings(items);
      return items;
    } catch (err) {
      setBuildings([]);
      setError(
        err?.response?.data?.message ?? "No se pudieron cargar los edificios.",
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia edificios al cerrar sesión
      setBuildings([]);
      return;
    }
    refreshBuildings();
  }, [isAuthenticated, refreshBuildings]);

  const getBuildingById = useCallback(
    (id) =>
      buildings.find((building) => building.id === id) ?? {
        ...EMPTY_BUILDING,
        id,
      },
    [buildings],
  );

  const addBuilding = async (form) => {
    const created = await createBuilding(form);
    setBuildings((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
    );
    logActivity({
      actor,
      action: `Creó el edificio "${created.name}"`,
      buildingId: created.id,
    });
    return created;
  };

  return (
    <BuildingsContext.Provider
      value={{
        buildings,
        loading,
        error,
        refreshBuildings,
        getBuildingById,
        addBuilding,
      }}
    >
      {children}
    </BuildingsContext.Provider>
  );
}

BuildingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useBuildings() {
  const context = useContext(BuildingsContext);
  if (!context) {
    throw new Error("useBuildings debe usarse dentro de un BuildingsProvider");
  }
  return context;
}
