import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  // Sin endpoint de notificaciones: la lista arranca vacía. Antes venía
  // sembrada con cinco avisos inventados ("Andreani AE-8831-2024", "Carlos
  // Pereyra ingresó...") que todo residente veía en su unidad 8B, tenga o no
  // ese paquete y ese visitante.
  const [notifications, setNotifications] = useState([]);

  // buildingId=null → todos los edificios. unit=null → todas las unidades del edificio.
  const notify = ({ type, title, body, buildingId = null, unit = null }) => {
    const nextId = notifications.length
      ? Math.max(...notifications.map((n) => n.id)) + 1
      : 1;
    setNotifications((prev) => [
      {
        id: nextId,
        type,
        title,
        body,
        time: new Date().toLocaleString("es-AR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        read: false,
        buildingId,
        unit,
      },
      ...prev,
    ]);
  };

  const forResident = (resident) =>
    notifications.filter(
      (n) =>
        (n.buildingId === null || n.buildingId === resident.buildingId) &&
        (n.unit === null || n.unit === resident.unit),
    );

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  return (
    <NotificationsContext.Provider
      value={{ notifications, notify, forResident, markRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificationsStore() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotificationsStore debe usarse dentro de un NotificationsProvider",
    );
  }
  return context;
}
