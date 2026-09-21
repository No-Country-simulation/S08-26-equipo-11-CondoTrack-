import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const NotificationsContext = createContext(null);

const SEED_NOTIFICATIONS = [
  { id: 1, type: "delivery", title: "Paquete recibido en portería", body: "Andreani · AE-8831-2024", time: "Hoy 09:15", read: false, buildingId: 1, unit: "8B" },
  { id: 2, type: "access", title: "Ingreso de visitante autorizado", body: "Carlos Pereyra ingresó a las 08:31", time: "Hoy 08:31", read: false, buildingId: 1, unit: "8B" },
  { id: 3, type: "maintenance", title: "Solicitud en progreso", body: "Pérdida de agua → asignada a Fontanero Externo", time: "Ayer 14:00", read: true, buildingId: 1, unit: "8B" },
  { id: 4, type: "reservation", title: "Reserva confirmada", body: "Salón de Eventos · Sáb 07 Sep 19:00–23:00", time: "Lun 10:22", read: true, buildingId: 1, unit: "8B" },
  { id: 5, type: "incident", title: "Incidente resuelto", body: "Mascota sin correa — cerrado por administración", time: "02 Sep 09:00", read: true, buildingId: 1, unit: "8B" },
];

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);

  // buildingId=null → todos los edificios. unit=null → todas las unidades del edificio.
  const notify = ({ type, title, body, buildingId = null, unit = null }) => {
    const nextId = notifications.length ? Math.max(...notifications.map((n) => n.id)) + 1 : 1;
    setNotifications((prev) => [
      {
        id: nextId,
        type,
        title,
        body,
        time: new Date().toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }),
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
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <NotificationsContext.Provider value={{ notifications, notify, forResident, markRead }}>
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
    throw new Error("useNotificationsStore debe usarse dentro de un NotificationsProvider");
  }
  return context;
}
