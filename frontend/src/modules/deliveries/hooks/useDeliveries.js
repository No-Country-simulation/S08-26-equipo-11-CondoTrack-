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

  return {
    deliveries,
    pending,
    notified,
    delivered,
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
