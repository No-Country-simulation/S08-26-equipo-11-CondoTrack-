import { useDeliveriesStore } from "@/modules/deliveries/context/DeliveriesContext";

export const useDeliveries = () => {
  const { deliveries, forUnit, forBuilding, notifyResident } = useDeliveriesStore();

  const pending = deliveries.filter((d) => d.status === "pending");
  const notified = deliveries.filter((d) => d.status === "notified");
  const delivered = deliveries.filter((d) => d.status === "delivered");

  return { deliveries, pending, notified, delivered, forUnit, forBuilding, notifyResident };
};
