import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { INCIDENTS } from "@/modules/incidents/data/incidents.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import { useNotificationsStore } from "@/modules/notifications/context/NotificationsContext";

const IncidentsContext = createContext(null);

const STATUS_LABELS = {
  open: "Abierto",
  in_progress: "En progreso",
  resolved: "Resuelto",
};

export function IncidentsProvider({ children }) {
  const [items, setItems] = useState(INCIDENTS);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();
  const { notify } = useNotificationsStore();

  const forResident = (residentName) => items.filter((item) => item.resident === residentName);
  const forBuilding = (buildingId) => items.filter((item) => item.buildingId === buildingId);

  const updateStatus = (id, status) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    logActivity({
      actor,
      action: `Cambió el estado del incidente "${item.title}" a "${STATUS_LABELS[status] || status}"`,
      buildingId: item.buildingId,
    });
    notify({
      type: "incident",
      title: "Actualización de tu incidente",
      body: `"${item.title}" → ${STATUS_LABELS[status] || status}`,
      buildingId: item.buildingId,
      unit: item.unit,
    });
  };

  return (
    <IncidentsContext.Provider value={{ items, forResident, forBuilding, updateStatus }}>
      {children}
    </IncidentsContext.Provider>
  );
}

IncidentsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useIncidentsStore() {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error("useIncidentsStore debe usarse dentro de un IncidentsProvider");
  }
  return context;
}
