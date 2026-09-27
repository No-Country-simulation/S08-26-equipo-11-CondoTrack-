import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { DELIVERIES } from "@/modules/deliveries/data/deliveries.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import { useNotificationsStore } from "@/modules/notifications/context/NotificationsContext";

const DeliveriesContext = createContext(null);

export function DeliveriesProvider({ children }) {
  const [deliveries, setDeliveries] = useState(DELIVERIES);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();
  const { notify } = useNotificationsStore();

  const forUnit = (unit) => deliveries.filter((d) => d.unit === unit);
  const forBuilding = (buildingId) => deliveries.filter((d) => d.buildingId === buildingId);

  const notifyResident = (id) => {
    const delivery = deliveries.find((d) => d.id === id);
    if (!delivery) return;
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: "notified" } : d)));
    logActivity({
      actor,
      action: `Notificó a ${delivery.resident} sobre su delivery de ${delivery.carrier}`,
      buildingId: delivery.buildingId,
    });
    notify({
      type: "delivery",
      title: "Paquete recibido en portería",
      body: `${delivery.carrier} · ${delivery.tracking}`,
      buildingId: delivery.buildingId,
      unit: delivery.unit,
    });
  };

  return (
    <DeliveriesContext.Provider value={{ deliveries, forUnit, forBuilding, notifyResident }}>
      {children}
    </DeliveriesContext.Provider>
  );
}

DeliveriesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useDeliveriesStore() {
  const context = useContext(DeliveriesContext);
  if (!context) {
    throw new Error("useDeliveriesStore debe usarse dentro de un DeliveriesProvider");
  }
  return context;
}
