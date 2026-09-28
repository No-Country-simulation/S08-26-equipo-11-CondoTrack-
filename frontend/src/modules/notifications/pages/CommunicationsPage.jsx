import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { useNotificationsStore } from "@/modules/notifications/context/NotificationsContext";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { SendNotificationModal } from "@/modules/notifications/components/SendNotificationModal";

export const CommunicationsPage = () => {
  const { notifications } = useNotificationsStore();
  const { getBuildingById } = useBuildings();
  const [showSend, setShowSend] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div className="ct-main-scroll">
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")} className="mb-4">
          {successMessage}
        </Alert>
      )}

      <div className="d-flex justify-content-end mb-4">
        <button
          type="button"
          className="btn btn-sm text-white d-flex align-items-center gap-2"
          style={{ background: "var(--color-accent)" }}
          onClick={() => setShowSend(true)}
        >
          <Icon name="plus" size={14} />
          Nuevo aviso
        </button>
      </div>

      <div className="ct-card overflow-hidden">
        <div className="ct-card-header">
          <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            Notificaciones enviadas
          </p>
        </div>
        <div>
          {notifications.map((notification) => (
            <div key={notification.id} className="ct-row ct-row-hover">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{notification.title}</p>
                  <p className="ct-text-muted mb-0 mt-1">{notification.body}</p>
                  <p className="ct-font-mono ct-text-faint mb-0 mt-1" style={{ fontSize: "0.6875rem" }}>
                    {notification.buildingId ? getBuildingById(notification.buildingId).name : "Todos los edificios"}
                    {notification.unit ? ` · Unidad ${notification.unit}` : ""}
                  </p>
                </div>
                <span className="ct-font-mono ct-text-faint flex-shrink-0" style={{ fontSize: "0.6875rem" }}>{notification.time}</span>
              </div>
            </div>
          ))}
        </div>
        {notifications.length === 0 && (
          <div className="text-center py-5 ct-text-muted">Todavía no se enviaron avisos.</div>
        )}
      </div>

      <SendNotificationModal
        show={showSend}
        onHide={() => setShowSend(false)}
        onSent={() => setSuccessMessage("Aviso enviado correctamente.")}
      />
    </div>
  );
};
