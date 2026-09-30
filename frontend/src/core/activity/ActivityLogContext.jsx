import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const ActivityLogContext = createContext(null);

export function ActivityLogProvider({ children }) {
  const [activities, setActivities] = useState([]);

  const logActivity = ({ actor, action, buildingId = null }) => {
    setActivities((prev) => [
      {
        id: prev.length ? Math.max(...prev.map((entry) => entry.id)) + 1 : 1,
        timestamp: new Date().toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }),
        actor,
        action,
        buildingId,
      },
      ...prev,
    ]);
  };

  const forBuilding = (buildingId) => activities.filter((entry) => entry.buildingId === buildingId);

  return (
    <ActivityLogContext.Provider value={{ activities, logActivity, forBuilding }}>
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
