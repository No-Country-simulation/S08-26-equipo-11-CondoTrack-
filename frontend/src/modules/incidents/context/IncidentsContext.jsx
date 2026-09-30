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
  listBuildingIncidents,
  listMyIncidents,
  reportIncident as reportIncidentRequest,
  updateIncident as updateIncidentRequest,
} from "@/modules/incidents/services/incidentsService";
import { apiErrorMessage } from "@/core/api/api";

const IncidentsContext = createContext(null);

// Incidentes reales por edificio (GET /buildings/:id/incidents).
// Sin mock inicial: la lista arranca vacía y se carga con sesión.
// NOTA: las filas del backend no traen nombre de residente/unidad legible
// (solo ids); `forResident` por nombre solo sirve con datos viejos en memoria.
export function IncidentsProvider({ children }) {
  const [incidentsByBuilding, setIncidentsByBuilding] = useState({});
  const [myIncidents, setMyIncidents] = useState([]);
  const fetchedRef = useRef(new Set());
  const { isAuthenticated, user } = useAuth();
  const { buildings } = useBuildings();
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();
  const { notify } = useNotificationsStore();

  const fetchBuildingIncidents = useCallback(
    async (buildingId, { force = false, status } = {}) => {
      if (!buildingId) return [];
      if (!force && fetchedRef.current.has(buildingId)) {
        return [];
      }
      fetchedRef.current.add(buildingId);

      setIncidentsByBuilding((prev) => ({
        ...prev,
        [buildingId]: {
          items: prev[buildingId]?.items ?? [],
          loading: true,
          error: "",
        },
      }));

      try {
        const items = await listBuildingIncidents(buildingId, { status });
        setIncidentsByBuilding((prev) => ({
          ...prev,
          [buildingId]: { items, loading: false, error: "" },
        }));
        return items;
      } catch (err) {
        fetchedRef.current.delete(buildingId);
        const message = apiErrorMessage(
          err,
          "No se pudieron cargar los incidentes.",
        );
        setIncidentsByBuilding((prev) => ({
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia incidentes al cerrar sesión
      setIncidentsByBuilding({});
      setMyIncidents([]);
      fetchedRef.current.clear();
      return;
    }
    buildings.forEach((building) => fetchBuildingIncidents(building.id));
  }, [isAuthenticated, buildings, fetchBuildingIncidents]);

  // Los residentes no pueden usar GET /buildings/:id/incidents (403): sus
  // incidentes llegan por /incidents/mine, que ya viene filtrado por unidad.
  const isResident = Boolean(
    user?.roles?.some((role) => role.roleName === "RESIDENT"),
  );

  const fetchMyIncidents = useCallback(
    async ({ force = false } = {}) => {
      if (!force) return myIncidents;
      try {
        const items = await listMyIncidents();
        setMyIncidents(items);
        return items;
      } catch (err) {
        console.error("ERROR FETCH MY INCIDENTS", err);
        setMyIncidents([]);
        return [];
      }
    },
    [myIncidents],
  );

  useEffect(() => {
    if (!isAuthenticated || !isResident) {
      return;
    }
    let cancelled = false;
    listMyIncidents()
      .then((items) => {
        if (!cancelled) setMyIncidents(items);
      })
      .catch(() => {
        if (!cancelled) setMyIncidents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isResident]);

  const refreshBuilding = useCallback(
    async (buildingId) => {
      if (!buildingId) return;
      fetchedRef.current.delete(buildingId);
      await fetchBuildingIncidents(buildingId);
    },
    [fetchBuildingIncidents],
  );

  const forBuilding = useCallback(
    (buildingId) => incidentsByBuilding[buildingId]?.items ?? [],
    [incidentsByBuilding],
  );

  const forUnit = useCallback(
    (unitId) =>
      Object.values(incidentsByBuilding)
        .flatMap((entry) => entry.items)
        .filter((item) => item.unitId === unitId),
    [incidentsByBuilding],
  );

  const forResident = useCallback(() => myIncidents, [myIncidents]);

  const isLoading = useCallback(
    (buildingId) => incidentsByBuilding[buildingId]?.loading ?? false,
    [incidentsByBuilding],
  );

  const getError = useCallback(
    (buildingId) => incidentsByBuilding[buildingId]?.error ?? "",
    [incidentsByBuilding],
  );

  const reportIncident = async (buildingId, unitId, payload) => {
    const created = await reportIncidentRequest(buildingId, unitId, payload);
    logActivity({
      actor,
      action: `Reportó el incidente "${created.title}"`,
      buildingId,
    });
    if (isResident) {
      await fetchMyIncidents({ force: true });
    } else {
      await refreshBuilding(buildingId);
    }
    return created;
  };

  const updateStatus = async (id, status, buildingId) => {
    const updated = await updateIncidentRequest(id, { status });
    logActivity({
      actor,
      action: `Cambió el estado del incidente "${updated.title}"`,
      buildingId: buildingId ?? updated.buildingId,
    });
    notify({
      type: "incident",
      title: "Actualización de tu incidente",
      body: `"${updated.title}" → ${status}`,
      buildingId: buildingId ?? updated.buildingId,
      unit: updated.unit,
    });
    await refreshBuilding(buildingId ?? updated.buildingId);
    return updated;
  };

  const incidents = isResident
    ? myIncidents
    : Object.values(incidentsByBuilding).flatMap((entry) => entry.items);

  return (
    <IncidentsContext.Provider
      value={{
        items: incidents,
        forResident,
        forUnit,
        forBuilding,
        updateStatus,
        reportIncident,
        fetchBuildingIncidents,
        fetchMyIncidents,
        isLoading,
        getError,
      }}
    >
      {children}
    </IncidentsContext.Provider>
  );
}

IncidentsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useIncidentsStore() {
  const context = useContext(IncidentsContext);
  if (!context) {
    throw new Error(
      "useIncidentsStore debe usarse dentro de un IncidentsProvider",
    );
  }
  return context;
}
