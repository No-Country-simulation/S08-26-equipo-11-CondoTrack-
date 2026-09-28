import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { listUnits } from "@/modules/units/services/unitsService";

const UnitsContext = createContext(null);

export function UnitsProvider({ children }) {
  const [unitsByBuilding, setUnitsByBuilding] = useState({});
  const fetchedRef = useRef(new Set());

  const fetchUnits = useCallback(async (buildingId) => {
    if (!buildingId || fetchedRef.current.has(buildingId)) return;
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
        [buildingId]: { units, total, loading: false, error: "" },
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

  const forBuilding = useCallback(
    (buildingId) => unitsByBuilding[buildingId]?.units ?? [],
    [unitsByBuilding],
  );

  // Ocupación real (pagination.total). Sin pedir lista completa.
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

  return (
    <UnitsContext.Provider
      value={{
        forBuilding,
        fetchUnits,
        getUnitsTotal,
        isUnitsLoading,
        unitsError,
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
