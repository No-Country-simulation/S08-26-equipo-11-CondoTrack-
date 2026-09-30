import { useAccessLogsStore } from "@/modules/access/context/AccessLogsContext";

export const useAccessLogs = () => {
  const { logs, forBuilding, addLogEntry } = useAccessLogsStore();

  const ingressCount = logs.filter((log) => log.direction === "Ingreso").length;
  const egressCount = logs.filter((log) => log.direction === "Egreso").length;
  const deniedCount = logs.filter((log) => log.status === "denied").length;

  const forResident = (resident) =>
    logs.filter((log) => log.unit === resident.unit || log.person === resident.name);

  return { logs, ingressCount, egressCount, deniedCount, forResident, forBuilding, addLogEntry };
};
