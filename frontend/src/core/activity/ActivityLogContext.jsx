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
import { RESULTS } from "@/core/activity/activityTypes";

const ActivityLogContext = createContext(null);

const STORAGE_KEY = "ct_activity";

// Límite de entradas por sesión. El historial es de consulta, no un archivo:
// pasado el tope se descartan las más antiguas para no llenar el sessionStorage.
const MAX_ENTRIES = 200;

const readStored = () => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStored = (entries) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Sin espacio o sin sessionStorage (modo privado): el log sigue en memoria.
  }
};

/**
 * Historial de acciones de la sesión.
 *
 * Cada entrada responde las preguntas de trazabilidad: quién gestionó
 * (`actor`), cuándo (`createdAt`), qué acción sobre qué entidad
 * (`action` + `entityType`/`entityId` + `unitId`), y con qué resultado
 * (`result`).
 *
 * LIMITACIÓN IMPORTANTE: es local al navegador. Registra lo que pasó en esta
 * pestaña, no lo que hizo otro usuario, y se pierde al cerrar la pestaña.
 * Para trazabilidad real entre roles hace falta un endpoint de auditoría en el
 * backend.
 */
export function ActivityLogProvider({ children }) {
  const [activities, setActivities] = useState(readStored);
  const { isAuthenticated } = useAuth();
  const wasAuthenticated = useRef(isAuthenticated);

  // El historial se borra al cerrar sesión: si no, el siguiente usuario que
  // entre en el mismo navegador vería las acciones del anterior.
  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      setActivities([]);
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  const logActivity = useCallback(
    ({
      actor,
      action,
      buildingId = null,
      unitId = null,
      unitCode = null,
      entityType = null,
      entityId = null,
      result = RESULTS.OK,
      detail = null,
    }) => {
      const now = new Date();

      setActivities((prev) => {
        const entry = {
          id: prev.length ? Math.max(...prev.map((item) => item.id)) + 1 : 1,
          // ISO para ordenar y filtrar por rango de fechas.
          createdAt: now.toISOString(),
          // Etiqueta lista para mostrar, como antes.
          timestamp: now.toLocaleString("es-AR", {
            dateStyle: "short",
            timeStyle: "short",
          }),
          actor: actor ?? "Sistema",
          action,
          buildingId,
          unitId,
          unitCode,
          entityType,
          entityId,
          result,
          detail,
        };

        const next = [entry, ...prev].slice(0, MAX_ENTRIES);
        writeStored(next);
        return next;
      });
    },
    [],
  );

  const forBuilding = useCallback(
    (buildingId) => activities.filter((entry) => entry.buildingId === buildingId),
    [activities],
  );

  const forUnit = useCallback(
    (unitId) => activities.filter((entry) => entry.unitId === unitId),
    [activities],
  );

  const forEntity = useCallback(
    (entityType, entityId) =>
      activities.filter(
        (entry) =>
          entry.entityType === entityType &&
          (entityId === undefined || entry.entityId === entityId),
      ),
    [activities],
  );

  const clearActivity = useCallback(() => {
    setActivities([]);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ActivityLogContext.Provider
      value={{
        activities,
        logActivity,
        forBuilding,
        forUnit,
        forEntity,
        clearActivity,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
}

ActivityLogProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useActivityLog() {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error("useActivityLog debe usarse dentro de un ActivityLogProvider");
  }
  return context;
}
