import { Icon } from "@/shared/components/Icon";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDeliveries } from "@/modules/deliveries/hooks/useDeliveries";

export const DeliveriesPage = () => {
  const { deliveries, pending, notified, delivered, notifyResident } = useDeliveries();

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-kpi-3 mb-4">
        <KpiCard label="Pendientes de retiro" value={pending.length} sub={`Sin notificar: ${pending.length - notified.length >= 0 ? pending.length : 0}`} />
        <KpiCard label="Notificados" value={notified.length} sub="Esperando retiro" />
        <KpiCard label="Entregados hoy" value={delivered.length} sub="Esta semana" />
      </div>

      <div className="ct-card overflow-hidden">
        <div className="ct-card-header">
          <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            Deliveries y correspondencia
          </p>
        </div>
        <div>
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="ct-row ct-row-hover d-flex align-items-center gap-4">
              <div className="ct-icon-tile" style={{ width: 36, height: 36, background: "var(--color-canvas)", border: "1px solid var(--color-border)" }}>
                <Icon name="deliveries" size={16} className="ct-text-muted" />
              </div>
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex align-items-center gap-2">
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{delivery.resident}</p>
                  <span className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>· Unidad {delivery.unit}</span>
                </div>
                <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                  {delivery.carrier} · {delivery.description} · {delivery.tracking}
                </p>
              </div>
              <div className="text-end flex-shrink-0">
                <StatusBadge status={delivery.status} />
                <p className="ct-font-mono ct-text-faint mb-0 mt-1" style={{ fontSize: "0.6875rem" }}>{delivery.received}</p>
              </div>
              {delivery.status === "pending" && (
                <button
                  type="button"
                  className="btn btn-sm text-white flex-shrink-0"
                  style={{ background: "var(--color-amber)" }}
                  onClick={() => notifyResident(delivery.id)}
                >
                  Notificar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
