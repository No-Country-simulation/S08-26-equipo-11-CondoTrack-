import { useMaintenanceStore } from "@/modules/maintenance/context/MaintenanceContext";

export const useMaintenance = () => {
  const { items, forUnit, forBuilding, updateStatus, assignStaff } = useMaintenanceStore();

  const pending = items.filter((m) => m.status === "pending");
  const inProgress = items.filter((m) => m.status === "in_progress");
  const resolved = items.filter((m) => m.status === "resolved");

  return { items, pending, inProgress, resolved, forUnit, forBuilding, updateStatus, assignStaff };
};
