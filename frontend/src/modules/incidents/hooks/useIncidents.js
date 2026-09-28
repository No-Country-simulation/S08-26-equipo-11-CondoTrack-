import { useIncidentsStore } from "@/modules/incidents/context/IncidentsContext";

export const useIncidents = () => {
  const { items, forResident, forBuilding, updateStatus } = useIncidentsStore();

  const open = items.filter((i) => i.status === "open");
  const inProgress = items.filter((i) => i.status === "in_progress");
  const resolved = items.filter((i) => i.status === "resolved");

  return { items, open, inProgress, resolved, forResident, forBuilding, updateStatus };
};
