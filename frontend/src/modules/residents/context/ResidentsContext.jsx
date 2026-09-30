import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { listUnits } from "@/modules/units/services/unitsService";
import {
  linkResident,
  listUnitResidents,
} from "@/modules/residents/services/residentsService";
import { apiErrorMessage } from "@/core/api/api";
import { isValidEmail, normalizeEmail } from "@/shared/utils/validators";

const ResidentsContext = createContext(null);

// El backend expone residentes por UNIDAD (GET /units/:id/residents).
// Este contexto agrega por EDIFICIO (unidades -> residentes) y mantiene
// los mismos contratos que consumen las pantallas (forBuilding/addResident).
export function ResidentsProvider({ children }) {
  const [residentsByBuilding, setResidentsByBuilding] = useState({});
  const fetchedRef = useRef(new Set());
  const { isAuthenticated } = useAuth();
  const { buildings } = useBuildings();
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const fetchBuildingResidents = useCallback(
    async (buildingId, buildingName) => {
      if (!buildingId || fetchedRef.current.has(buildingId)) return;
      fetchedRef.current.add(buildingId);

      setResidentsByBuilding((prev) => ({
        ...prev,
        [buildingId]: {
          residents: prev[buildingId]?.residents ?? [],
          loading: true,
          error: "",
        },
      }));

      try {
        const { units } = await listUnits(buildingId);
        const lists = await Promise.all(
          units.map((unit) => listUnitResidents(unit).catch(() => [])),
        );
        const rows = lists
          .flat()
          .map((row) => ({
            ...row,
            buildingId,
            building: buildingName ?? row.building,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setResidentsByBuilding((prev) => ({
          ...prev,
          [buildingId]: { residents: rows, loading: false, error: "" },
        }));
      } catch (err) {
        fetchedRef.current.delete(buildingId);
        setResidentsByBuilding((prev) => ({
          ...prev,
          [buildingId]: {
            residents: [],
            loading: false,
            error: apiErrorMessage(
              err,
              "No se pudieron cargar los residentes.",
            ),
          },
        }));
      }
    },
    [],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setResidentsByBuilding({});
      fetchedRef.current.clear();
      return;
    }
    buildings.forEach((building) =>
      fetchBuildingResidents(building.id, building.name),
    );
  }, [isAuthenticated, buildings, fetchBuildingResidents]);

  // Refresca un edificio a la fuerza (ej. tras crear+vincular un residente).
  const refreshBuilding = useCallback(
    async (buildingId) => {
      if (!buildingId) return;
      const building = buildings.find((item) => item.id === buildingId);
      fetchedRef.current.delete(buildingId);
      await fetchBuildingResidents(buildingId, building?.name);
    },
    [buildings, fetchBuildingResidents],
  );

  const forBuilding = useCallback(
    (buildingId) => residentsByBuilding[buildingId]?.residents ?? [],
    [residentsByBuilding],
  );

  const isResidentsLoading = useCallback(
    (buildingId) => residentsByBuilding[buildingId]?.loading ?? false,
    [residentsByBuilding],
  );

  const residentsError = useCallback(
    (buildingId) => residentsByBuilding[buildingId]?.error ?? "",
    [residentsByBuilding],
  );

  // Vincula una cuenta existente como residente (POST /units/:id/residents).
  // El backend solo pide { email }: la unidad se resuelve por código.
  const addResident = async ({
    buildingId,
    buildingName,
    unitId,
    unitCode,
    email,
    phone,
    type,
  }) => {
    const trimmedEmail = normalizeEmail(email);

    if (!unitId || !buildingId || !trimmedEmail) {
      return {
        success: false,
        error: "Completá edificio, unidad y email.",
      };
    }

    if (!isValidEmail(trimmedEmail)) {
      return {
        success: false,
        error: "El email no tiene un formato válido.",
      };
    }

    try {
      // El id de la unidad viene del selector, que ya la cargó del backend:
      // no hace falta volver a listar y casar por código.
      const row = await linkResident(
        { id: unitId, code: unitCode, buildingId },
        trimmedEmail,
      );
      const full = {
        ...row,
        unitId,
        buildingId,
        building: buildingName,
        phone: phone?.trim() || "—",
        type: type || "Inquilino",
      };

      setResidentsByBuilding((prev) => ({
        ...prev,
        [buildingId]: {
          residents: [...(prev[buildingId]?.residents ?? []), full].sort(
            (a, b) => a.name.localeCompare(b.name),
          ),
          loading: false,
          error: "",
        },
      }));
      fetchedRef.current.add(buildingId);

      logActivity({
        actor,
        action: `Vinculó al residente "${full.name}" (unidad ${full.unit})`,
        buildingId,
        unitId,
        unitCode: full.unit,
        entityType: "unit",
        entityId: unitId,
        result: "ok",
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: apiErrorMessage(err, "No se pudo vincular al residente."),
      };
    }
  };

  const residents = Object.values(residentsByBuilding).flatMap(
    (entry) => entry.residents,
  );

  return (
    <ResidentsContext.Provider
      value={{
        residents,
        forBuilding,
        addResident,
        isResidentsLoading,
        residentsError,
        refreshBuilding,
      }}
    >
      {children}
    </ResidentsContext.Provider>
  );
}

ResidentsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useResidentsStore() {
  const context = useContext(ResidentsContext);
  if (!context) {
    throw new Error(
      "useResidentsStore debe usarse dentro de un ResidentsProvider",
    );
  }
  return context;
}
