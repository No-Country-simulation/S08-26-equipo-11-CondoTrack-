import { useDeliveriesStore } from "@/modules/deliveries/context/DeliveriesContext";

export const useDeliveries = () => {
  const {
    deliveries,
    forUnit,
    forBuilding,
    notifyResident,
    fetchBuildingDeliveries,
    registerDelivery,
    markPickedUp,
    isLoading,
    getError,
  } = useDeliveriesStore();

  // Acepta vocabulario mock (minúsculas) y backend (mayúsculas).
  const pending = deliveries.filter(
    (d) => d.status === "pending" || d.status === "RECEIVED",
  );
  const notified = deliveries.filter(
    (d) => d.status === "notified" || d.status === "NOTIFIED",
  );
  const delivered = deliveries.filter(
    (d) => d.status === "delivered" || d.status === "PICKED_UP",
  );

  // Los KPIs y badges son por edificio, no globales.
  const pendingForBuilding = (buildingId) =>
    forBuilding(buildingId).filter(
      (d) => d.status === "pending" || d.status === "RECEIVED",
    );
  const notifiedForBuilding = (buildingId) =>
    forBuilding(buildingId).filter(
      (d) => d.status === "notified" || d.status === "NOTIFIED",
    );

  return {
    deliveries,
    pending,
    notified,
    delivered,
    pendingForBuilding,
    notifiedForBuilding,
    forUnit,
    forBuilding,
    notifyResident,
    fetchBuildingDeliveries,
    registerDelivery,
    markPickedUp,
    isLoading,
    getError,
  };
};
