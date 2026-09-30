import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

import PropTypes from "prop-types";

import {
  createUnit as createUnitRequest,
  listUnits,
} from "@/modules/units/services/unitsService";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { ENTITY_TYPES, RESULTS } from "@/core/activity/activityTypes";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";

const UnitsContext = createContext(null);

export function UnitsProvider({ children }) {
  const [unitsByBuilding, setUnitsByBuilding] = useState({});
  const fetchedRef = useRef(new Set());
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const fetchUnits = useCallback(async (buildingId, force = false) => {
    if (!buildingId) return;

    if (!force && fetchedRef.current.has(buildingId)) {
      return;
    }

    fetchedRef.current.add(buildingId);

    setUnitsByBuilding((prev) => ({
      ...prev,
      [buildingId]: {
        units: prev[buildingId]?.units ?? [],
        total: prev[buildingId]?.total ?? null,
        loading: true,
        error: "",
      },
    }));

    try {
      const { units, total } = await listUnits(buildingId);

      setUnitsByBuilding((prev) => ({
        ...prev,
        [buildingId]: {
          units,
          total,
          loading: false,
          error: "",
        },
      }));
    } catch (err) {
      fetchedRef.current.delete(buildingId);

      setUnitsByBuilding((prev) => ({
        ...prev,
        [buildingId]: {
          units: [],
          total: null,
          loading: false,
          error:
            err?.response?.data?.message ??
            "No se pudieron cargar las unidades.",
        },
      }));
    }
  }, []);

  const refreshUnits = useCallback(
    async (buildingId) => {
      await fetchUnits(buildingId, true);
    },
    [fetchUnits],
  );

  const forBuilding = useCallback(
    (buildingId) => unitsByBuilding[buildingId]?.units ?? [],
    [unitsByBuilding],
  );

  const getUnitsTotal = useCallback(
    (buildingId) => unitsByBuilding[buildingId]?.total ?? null,
    [unitsByBuilding],
  );

  const isUnitsLoading = useCallback(
    (buildingId) => unitsByBuilding[buildingId]?.loading ?? false,
    [unitsByBuilding],
  );

  const unitsError = useCallback(
    (buildingId) => unitsByBuilding[buildingId]?.error ?? "",
    [unitsByBuilding],
  );

  const createUnit = useCallback(
    async (buildingId, payload) => {
      try {
        const created = await createUnitRequest(buildingId, payload);

        logActivity({
          actor,
          action: `Creó la unidad ${created.code || payload.code || ""}`.trim(),
          buildingId,
          unitId: created.id ?? null,
          unitCode: created.code ?? payload.code ?? null,
          entityType: ENTITY_TYPES.UNIT,
          entityId: created.id ?? null,
          result: RESULTS.OK,
        });

        await refreshUnits(buildingId);

        return created;
      } catch (err) {
        logActivity({
          actor,
          action: `No pudo crear la unidad ${payload.code || ""}`.trim(),
          buildingId,
          unitCode: payload.code ?? null,
          entityType: ENTITY_TYPES.UNIT,
          result: RESULTS.ERROR,
          detail: err?.response?.data?.message ?? null,
        });
        throw err;
      }
    },
    [refreshUnits, logActivity, actor],
  );

  return (
    <UnitsContext.Provider
      value={{
        forBuilding,
        fetchUnits,
        refreshUnits,
        getUnitsTotal,
        isUnitsLoading,
        unitsError,
        createUnit,
      }}
    >
      {children}
    </UnitsContext.Provider>
  );
}

UnitsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useUnits() {
  const context = useContext(UnitsContext);

  if (!context) {
    throw new Error("useUnits debe usarse dentro de un UnitsProvider");
  }

  return context;
}
