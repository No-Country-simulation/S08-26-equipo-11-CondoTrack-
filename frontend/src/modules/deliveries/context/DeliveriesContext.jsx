import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useNotificationsStore } from "@/modules/notifications/context/NotificationsContext";
import {
  listBuildingDeliveries,
  markPickedUp as markPickedUpRequest,
  registerDelivery as registerDeliveryRequest,
} from "@/modules/deliveries/services/deliveriesService";
import { apiErrorMessage } from "@/core/api/api";

const DeliveriesContext = createContext(null);

// Deliveries reales por edificio (GET /buildings/:id/deliveries).
// Sin mock inicial: la lista arranca vacía y se carga con sesión.
// NOTA: el backend no tiene endpoint de "notificar": notifyResident sigue
// siendo un cambio local (se pisa al refrescar).
export function DeliveriesProvider({ children }) {
  const [deliveriesByBuilding, setDeliveriesByBuilding] = useState({});
  const fetchedRef = useRef(new Set());
  const { isAuthenticated } = useAuth();
  const { buildings } = useBuildings();
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();
  const { notify } = useNotificationsStore();

  const fetchBuildingDeliveries = useCallback(
    async (buildingId, { force = false, status } = {}) => {
      if (!buildingId) return [];
      if (!force && fetchedRef.current.has(buildingId)) {
        return [];
      }
      fetchedRef.current.add(buildingId);

      setDeliveriesByBuilding((prev) => ({
        ...prev,
        [buildingId]: {
          items: prev[buildingId]?.items ?? [],
          loading: true,
          error: "",
        },
      }));

      try {
        const items = await listBuildingDeliveries(buildingId, { status });
        setDeliveriesByBuilding((prev) => ({
          ...prev,
          [buildingId]: { items, loading: false, error: "" },
        }));
        return items;
      } catch (err) {
        fetchedRef.current.delete(buildingId);
        const message = apiErrorMessage(
          err,
          "No se pudieron cargar los deliveries.",
        );
        setDeliveriesByBuilding((prev) => ({
          ...prev,
          [buildingId]: { items: [], loading: false, error: message },
        }));
        return [];
      }
    },
    [],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia deliveries al cerrar sesión
      setDeliveriesByBuilding({});
      fetchedRef.current.clear();
      return;
    }
    buildings.forEach((building) => fetchBuildingDeliveries(building.id));
  }, [isAuthenticated, buildings, fetchBuildingDeliveries]);

  const refreshBuilding = useCallback(
    async (buildingId) => {
      if (!buildingId) return;
      fetchedRef.current.delete(buildingId);
      await fetchBuildingDeliveries(buildingId);
    },
    [fetchBuildingDeliveries],
  );

  const forBuilding = useCallback(
    (buildingId) => deliveriesByBuilding[buildingId]?.items ?? [],
    [deliveriesByBuilding],
  );

  const isLoading = useCallback(
    (buildingId) => deliveriesByBuilding[buildingId]?.loading ?? false,
    [deliveriesByBuilding],
  );

  const getError = useCallback(
    (buildingId) => deliveriesByBuilding[buildingId]?.error ?? "",
    [deliveriesByBuilding],
  );

  const forUnit = useCallback(
    (unit) =>
      Object.values(deliveriesByBuilding)
        .flatMap((entry) => entry.items)
        .filter((d) => d.unit === unit || d.unitId === unit),
    [deliveriesByBuilding],
  );

  const registerDelivery = async (buildingId, unitId, payload) => {
    const created = await registerDeliveryRequest(unitId, payload);
    logActivity({
      actor,
      action: `Registró un delivery de ${created.carrier}`,
      buildingId,
    });
    await refreshBuilding(buildingId);
    return created;
  };

  const markPickedUp = async (deliveryId, buildingId) => {
    const updated = await markPickedUpRequest(deliveryId);
    logActivity({ actor, action: "Marcó un delivery como entregado", buildingId });
    await refreshBuilding(buildingId);
    return updated;
  };

  const notifyResident = (id) => {
    // Sin endpoint: cambio local + notificación interna.
    const all = Object.values(deliveriesByBuilding).flatMap(
      (entry) => entry.items,
    );
    const delivery = all.find((d) => d.id === id);
    if (!delivery) return;
    setDeliveriesByBuilding((prev) => ({
      ...prev,
      [delivery.buildingId]: {
        ...prev[delivery.buildingId],
        items: prev[delivery.buildingId].items.map((d) =>
          d.id === id ? { ...d, status: "NOTIFIED", uiStatus: "notified" } : d,
        ),
      },
    }));
    logActivity({
      actor,
      action: `Notificó a ${delivery.resident || "residente"} sobre su delivery de ${delivery.carrier}`,
      buildingId: delivery.buildingId,
    });
    notify({
      type: "delivery",
      title: "Paquete recibido en portería",
      body: `${delivery.carrier} · ${delivery.trackingNumber}`,
      buildingId: delivery.buildingId,
      unit: delivery.unit,
    });
  };

  const deliveries = Object.values(deliveriesByBuilding).flatMap(
    (entry) => entry.items,
  );

  return (
    <DeliveriesContext.Provider
      value={{
        deliveries,
        forUnit,
        forBuilding,
        notifyResident,
        fetchBuildingDeliveries,
        registerDelivery,
        markPickedUp,
        isLoading,
        getError,
      }}
    >
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
    throw new Error(
      "useDeliveriesStore debe usarse dentro de un DeliveriesProvider",
    );
  }
  return context;
}
