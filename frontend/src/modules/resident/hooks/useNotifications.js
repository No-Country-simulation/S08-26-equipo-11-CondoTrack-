import { useNotificationsStore } from "@/modules/notifications/context/NotificationsContext";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

const ICON_BY_TYPE = {
  delivery: "deliveries",
  access: "access",
  maintenance: "maintenance",
  reservation: "reservations",
  incident: "incidents",
  move: "truck",
};

export const useNotifications = () => {
  const { forResident, markRead } = useNotificationsStore();
  const current = useCurrentResident();
  const notifications = forResident(current);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const iconFor = (type) => ICON_BY_TYPE[type] || "notification";

  return { notifications, unreadCount, iconFor, markRead };
};
