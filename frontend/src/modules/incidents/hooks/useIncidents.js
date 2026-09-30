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

  // Los KPIs y badges son por edificio, no globales.
  const openForBuilding = (buildingId) =>
    forBuilding(buildingId).filter(
      (i) => i.status === "open" || i.status === "OPEN",
    );

  return {
    items,
    open,
    inProgress,
    resolved,
    openForBuilding,
    forResident,
    forUnit,
    forBuilding,
    updateStatus,
    reportIncident,
    isLoading,
    getError,
  };
};
