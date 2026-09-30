import { Icon } from "@/shared/components/Icon";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useDeliveries } from "@/modules/deliveries/hooks/useDeliveries";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

export const MyDeliveriesPage = () => {
  const { forUnit } = useDeliveries();
  const current = useCurrentResident();
  const mine = forUnit(current.unit);

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-kpi-3 mb-4">
        <KpiCard
          label="En portería"
          value={mine.filter((d) => d.status === "pending" || d.status === "notified").length}
          sub="Esperando retiro"
        />
        <KpiCard label="Entregados" value={mine.filter((d) => d.status === "delivered").length} sub="Este mes" />
        <KpiCard label="En camino" value={0} sub="Sin seguimientos activos" />
      </div>

      <div className="ct-card overflow-hidden">
        <div className="ct-card-header">
          <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            Mis paquetes y correspondencia
          </p>
        </div>
        {mine.length === 0 ? (
          <div className="text-center py-5">
            <Icon name="deliveries" size={32} className="ct-text-faint mb-3" />
            <p className="ct-text-muted mb-0">Sin deliveries registrados</p>
          </div>
        ) : (
          <div>
            {mine.map((delivery) => (
              <div key={delivery.id} className="ct-row ct-row-hover d-flex align-items-center gap-4">
                <div
                  className="ct-icon-tile-lg d-flex align-items-center justify-content-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "0.75rem",
                    background: delivery.status === "pending" ? "var(--color-amber-light)" : "var(--color-canvas)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <Icon name="deliveries" size={17} className={delivery.status === "pending" ? "" : "ct-text-muted"} style={delivery.status === "pending" ? { color: "var(--color-amber)" } : undefined} />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <p className="mb-0 fw-semibold" style={{ color: "var(--color-ink)" }}>{delivery.carrier}</p>
                  <p className="ct-text-muted mb-0 mt-1">{delivery.description}</p>
                  <p className="ct-font-mono ct-text-faint mb-0 mt-1" style={{ fontSize: "0.6875rem" }}>{delivery.tracking}</p>
                </div>
                <div className="text-end flex-shrink-0">
                  <StatusBadge status={delivery.status} />
                  <p className="ct-font-mono ct-text-faint mb-0 mt-2" style={{ fontSize: "0.6875rem" }}>{delivery.received}</p>
                </div>
                {delivery.status === "pending" && (
                  <div className="text-center flex-shrink-0 px-3 py-3 rounded" style={{ background: "var(--color-amber-light)" }}>
                    <p className="mb-0 fw-semibold" style={{ color: "var(--color-amber)" }}>Pasá</p>
                    <p className="ct-font-mono mb-0" style={{ fontSize: "0.625rem", color: "var(--color-amber)" }}>por portería</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
