import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { AMENITIES } from "@/modules/amenities/data/amenities.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";

const AmenitiesContext = createContext(null);

export function AmenitiesProvider({ children }) {
  const [amenities, setAmenities] = useState(AMENITIES);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const forBuilding = (buildingId) =>
    amenities.filter((amenity) => amenity.buildingId === buildingId);

  const addAmenity = (buildingId, { name, capacity, openTime, closeTime }) => {
    const trimmedName = name.trim();
    if (!trimmedName || !capacity || !openTime || !closeTime) {
      return { success: false, error: "Completá nombre, capacidad y horario permitido." };
    }
    if (Number(capacity) <= 0) {
      return { success: false, error: "La capacidad debe ser mayor a 0." };
    }

    const nextId = amenities.length ? Math.max(...amenities.map((a) => a.id)) + 1 : 1;
    setAmenities((prev) => [
      ...prev,
      { id: nextId, buildingId, name: trimmedName, capacity: Number(capacity), openTime, closeTime },
    ]);
    logActivity({ actor, action: `Agregó la amenidad "${trimmedName}"`, buildingId });
    return { success: true };
  };

  return (
    <AmenitiesContext.Provider value={{ forBuilding, addAmenity }}>
      {children}
    </AmenitiesContext.Provider>
  );
}

AmenitiesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAmenities() {
  const context = useContext(AmenitiesContext);
  if (!context) {
    throw new Error("useAmenities debe usarse dentro de un AmenitiesProvider");
  }
  return context;
}
