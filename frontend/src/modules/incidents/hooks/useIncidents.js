import { useIncidentsStore } from "@/modules/incidents/context/IncidentsContext";

export const useIncidents = () => {
  const {
    items,
    forResident,
    forUnit,
    forBuilding,
    updateStatus,
    reportIncident,
    isLoading,
    getError,
  } = useIncidentsStore();

  const open = items.filter((i) => i.status === "open" || i.status === "OPEN");

  const inProgress = items.filter(
    (i) => i.status === "in_progress" || i.status === "IN_PROGRESS",
  );

  const resolved = items.filter(
    (i) => i.status === "resolved" || i.status === "RESOLVED",
  );

  return {
    items,
    open,
    inProgress,
    resolved,
    forResident,
    forUnit,
    forBuilding,
    updateStatus,
    reportIncident,
    isLoading,
    getError,
  };
};
