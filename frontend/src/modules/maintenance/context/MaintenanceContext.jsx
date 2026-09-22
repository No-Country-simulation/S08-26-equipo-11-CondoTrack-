import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { MAINTENANCE } from "@/modules/maintenance/data/maintenance.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import { useNotificationsStore } from "@/modules/notifications/context/NotificationsContext";

const MaintenanceContext = createContext(null);

const STATUS_LABELS = {
  pending: "Pendiente",
  in_progress: "En progreso",
  resolved: "Resuelto",
};

export function MaintenanceProvider({ children }) {
  const [items, setItems] = useState(MAINTENANCE);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();
  const { notify } = useNotificationsStore();

  const forUnit = (unit) => items.filter((item) => item.unit === unit);
  const forBuilding = (buildingId) => items.filter((item) => item.buildingId === buildingId);

  const updateStatus = (id, status) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    logActivity({
      actor,
      action: `Cambió el estado de "${item.title}" a "${STATUS_LABELS[status] || status}"`,
      buildingId: item.buildingId,
    });
    notify({
      type: "maintenance",
      title: "Actualización de tu solicitud de mantenimiento",
      body: `"${item.title}" → ${STATUS_LABELS[status] || status}`,
      buildingId: item.buildingId,
      unit: item.unit,
    });
  };

  const assignStaff = (id, assigned) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, assigned } : i)));
    logActivity({
      actor,
      action: `Asignó "${assigned}" a la solicitud "${item.title}"`,
      buildingId: item.buildingId,
    });
  };

  return (
    <MaintenanceContext.Provider value={{ items, forUnit, forBuilding, updateStatus, assignStaff }}>
      {children}
    </MaintenanceContext.Provider>
  );
}

MaintenanceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useMaintenanceStore() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error("useMaintenanceStore debe usarse dentro de un MaintenanceProvider");
  }
  return context;
}
