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

const UnitsContext = createContext(null);

export function UnitsProvider({ children }) {
  const [unitsByBuilding, setUnitsByBuilding] = useState({});
  const fetchedRef = useRef(new Set());

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
      const created = await createUnitRequest(buildingId, payload);

      await refreshUnits(buildingId);

      return created;
    },
    [refreshUnits],
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
