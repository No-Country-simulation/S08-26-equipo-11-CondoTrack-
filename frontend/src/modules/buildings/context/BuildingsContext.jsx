import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { BUILDINGS } from "@/modules/buildings/data/buildings.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";

const BuildingsContext = createContext(null);

export function BuildingsProvider({ children }) {
  const [buildings, setBuildings] = useState(BUILDINGS);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const getBuildingById = (id) =>
    buildings.find((building) => building.id === id) || buildings[0];

  const addBuilding = ({ name, address, floors, units, city }) => {
    setBuildings((prev) => {
      const nextId = prev.length ? Math.max(...prev.map((b) => b.id)) + 1 : 1;
      logActivity({ actor, action: `Creó el edificio "${name}"`, buildingId: nextId });
      return [
        ...prev,
        {
          id: nextId,
          name,
          address,
          floors: Number(floors),
          units: Number(units),
          city: city || "—",
        },
      ];
    });
  };

  return (
    <BuildingsContext.Provider value={{ buildings, getBuildingById, addBuilding }}>
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
