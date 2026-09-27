import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { UNITS } from "@/modules/units/data/units.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";

const UnitsContext = createContext(null);

export function UnitsProvider({ children }) {
  const [units, setUnits] = useState(UNITS);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const forBuilding = (buildingId) => units.filter((unit) => unit.buildingId === buildingId);

  const addUnit = (buildingId, label) => {
    const trimmed = label.trim();
    if (!trimmed) {
      return { success: false, error: "Ingresá un identificador de unidad." };
    }

    const isDuplicate = units.some(
      (unit) => unit.buildingId === buildingId && unit.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) {
      return { success: false, error: `La unidad "${trimmed}" ya existe en este edificio.` };
    }

    const nextId = units.length ? Math.max(...units.map((unit) => unit.id)) + 1 : 1;
    setUnits((prev) => [...prev, { id: nextId, buildingId, label: trimmed }]);
    logActivity({ actor, action: `Agregó la unidad "${trimmed}"`, buildingId });
    return { success: true };
  };

  return (
    <UnitsContext.Provider value={{ forBuilding, addUnit }}>{children}</UnitsContext.Provider>
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
