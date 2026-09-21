import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { RESIDENTS } from "@/modules/residents/data/residents.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";

const ResidentsContext = createContext(null);

export function ResidentsProvider({ children }) {
  const [residents, setResidents] = useState(RESIDENTS);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const forBuilding = (buildingId) => residents.filter((resident) => resident.buildingId === buildingId);

  const addResident = ({ name, buildingId, buildingName, unit, email, phone, type }) => {
    const trimmedName = name.trim();
    const trimmedUnit = unit.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedUnit || !buildingId || !trimmedEmail) {
      return { success: false, error: "Completá nombre, edificio, unidad y email." };
    }

    const emailTaken = residents.some(
      (resident) => resident.email.toLowerCase() === trimmedEmail.toLowerCase(),
    );
    if (emailTaken) {
      return { success: false, error: "Ya existe un residente con ese email." };
    }

    const unitTaken = residents.some(
      (resident) => resident.buildingId === buildingId && resident.unit.toLowerCase() === trimmedUnit.toLowerCase(),
    );
    if (unitTaken) {
      return { success: false, error: `La unidad ${trimmedUnit} de este edificio ya tiene un residente asignado.` };
    }

    const nextId = residents.length ? Math.max(...residents.map((resident) => resident.id)) + 1 : 1;
    setResidents((prev) => [
      ...prev,
      {
        id: nextId,
        buildingId,
        building: buildingName,
        name: trimmedName,
        unit: trimmedUnit,
        email: trimmedEmail,
        phone: phone?.trim() || "—",
        type: type || "Inquilino",
        since: new Date().toLocaleDateString("es-AR", { month: "short", year: "numeric" }),
        status: "active",
      },
    ]);
    logActivity({ actor, action: `Registró al residente "${trimmedName}" (unidad ${trimmedUnit})`, buildingId });
    return { success: true };
  };

  return (
    <ResidentsContext.Provider value={{ residents, forBuilding, addResident }}>
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
    throw new Error("useResidentsStore debe usarse dentro de un ResidentsProvider");
  }
  return context;
}
