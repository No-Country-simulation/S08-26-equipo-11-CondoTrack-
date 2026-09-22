import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { ACCESS_LOGS } from "@/modules/access/data/accessLogs.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import { useNotificationsStore } from "@/modules/notifications/context/NotificationsContext";

const AccessLogsContext = createContext(null);

export function AccessLogsProvider({ children }) {
  const [logs, setLogs] = useState(ACCESS_LOGS);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();
  const { notify } = useNotificationsStore();

  const forBuilding = (buildingId) => logs.filter((log) => log.buildingId === buildingId);

  const addLogEntry = ({ person, unit, type, method, direction, buildingId = 1 }) => {
    const trimmedPerson = person.trim();
    if (!trimmedPerson || !type || !method || !direction) {
      return { success: false, error: "Completá persona, tipo, método y dirección." };
    }

    const time = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    const nextId = logs.length ? Math.max(...logs.map((log) => log.id)) + 1 : 1;
    setLogs((prev) => [
      {
        id: nextId,
        buildingId,
        time,
        person: trimmedPerson,
        unit: unit?.trim() || "—",
        type,
        method,
        direction,
        status: "ok",
      },
      ...prev,
    ]);
    logActivity({ actor, action: `Registró ${direction.toLowerCase()} de ${trimmedPerson} (${type})`, buildingId });

    if (type === "Visitante" && direction === "Ingreso" && unit && unit.trim() && unit.trim() !== "—") {
      notify({
        type: "access",
        title: "Ingreso de visitante autorizado",
        body: `${trimmedPerson} ingresó a las ${time}`,
        buildingId,
        unit: unit.trim(),
      });
    }

    return { success: true };
  };

  return (
    <AccessLogsContext.Provider value={{ logs, forBuilding, addLogEntry }}>
      {children}
    </AccessLogsContext.Provider>
  );
}

AccessLogsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAccessLogsStore() {
  const context = useContext(AccessLogsContext);
  if (!context) {
    throw new Error("useAccessLogsStore debe usarse dentro de un AccessLogsProvider");
  }
  return context;
}
