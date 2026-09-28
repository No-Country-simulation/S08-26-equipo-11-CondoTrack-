import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { STAFF, STAFF_ROLES } from "@/modules/staff/data/staff.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";

const StaffContext = createContext(null);

export function StaffProvider({ children }) {
  const [staff, setStaff] = useState(STAFF);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const forBuilding = (buildingId) => staff.filter((member) => member.buildingId === buildingId);

  const addStaff = ({ name, role, buildingId, staffType, company, phone, email }) => {
    const trimmedName = name.trim();
    if (!trimmedName || !role || !buildingId) {
      return { success: false, error: "Completá nombre, rol y edificio." };
    }
    if (role === STAFF_ROLES.MAINTENANCE && staffType === "externo" && !company?.trim()) {
      return { success: false, error: "Ingresá el nombre de la empresa externa." };
    }

    const nextId = staff.length ? Math.max(...staff.map((member) => member.id)) + 1 : 1;
    setStaff((prev) => [
      ...prev,
      {
        id: nextId,
        name: trimmedName,
        role,
        buildingId,
        staffType: role === STAFF_ROLES.MAINTENANCE ? staffType || "interno" : "interno",
        company: role === STAFF_ROLES.MAINTENANCE && staffType === "externo" ? company.trim() : null,
        phone: phone?.trim() || "—",
        email: email?.trim() || "—",
      },
    ]);
    logActivity({ actor, action: `Registró personal: "${trimmedName}"`, buildingId });
    return { success: true };
  };

  return (
    <StaffContext.Provider value={{ staff, forBuilding, addStaff }}>
      {children}
    </StaffContext.Provider>
  );
}

StaffProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff debe usarse dentro de un StaffProvider");
  }
  return context;
}
