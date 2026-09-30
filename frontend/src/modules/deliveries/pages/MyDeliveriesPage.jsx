import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { listMyDeliveries } from "@/modules/deliveries/services/deliveriesService";
import { apiErrorMessage } from "@/core/api/api";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("es-AR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const isWaiting = (status) => status === "RECEIVED" || status === "NOTIFIED";
const isDelivered = (status) => status === "PICKED_UP";

export const MyDeliveriesPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Deliveries reales de las unidades del residente (GET /deliveries/mine).
  // Exige rol RESIDENT; sin unidades vinculadas vuelve [].
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    setLoading(true);
    setError("");

    listMyDeliveries()
      .then((items) => {
        if (!cancelled) setDeliveries(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setDeliveries([]);
          setError(
            apiErrorMessage(err, "No se pudieron cargar tus deliveries."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const waiting = deliveries.filter((d) => isWaiting(d.status));
  const delivered = deliveries.filter((d) => isDelivered(d.status));

  return (
    <div className="ct-main-scroll">
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <div className="ct-grid-kpi-3 mb-4">
        <KpiCard
          label="En portería"
          value={waiting.length}
          sub="Esperando retiro"
        />
        <KpiCard label="Entregados" value={delivered.length} sub="Retirados" />
        <KpiCard label="Total" value={deliveries.length} sub="Registrados" />
      </div>

      <div className="ct-card overflow-hidden">
        <div className="ct-card-header">
          <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            Mis paquetes y correspondencia
          </p>
        </div>
        {loading ? (
          <p className="ct-text-muted px-3 py-4 mb-0">Cargando deliveries...</p>
        ) : deliveries.length === 0 && !error ? (
          <div className="text-center py-5">
            <Icon name="deliveries" size={32} className="ct-text-faint mb-3" />
            <p className="ct-text-muted mb-0">Sin deliveries registrados</p>
          </div>
        ) : (
          <div>
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="ct-row ct-row-hover d-flex align-items-center gap-4">
                <div
                  className="ct-icon-tile-lg d-flex align-items-center justify-content-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "0.75rem",
                    background:
                      delivery.status === "RECEIVED"
                        ? "var(--color-amber-light)"
                        : "var(--color-canvas)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <Icon
                    name="deliveries"
                    size={17}
                    className={delivery.status === "RECEIVED" ? "" : "ct-text-muted"}
                    style={
                      delivery.status === "RECEIVED"
                        ? { color: "var(--color-amber)" }
                        : undefined
                    }
                  />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <p className="mb-0 fw-semibold" style={{ color: "var(--color-ink)" }}>{delivery.carrier}</p>
                  <p className="ct-text-muted mb-0 mt-1">{delivery.description || "Paquete"}</p>
                  <p className="ct-font-mono ct-text-faint mb-0 mt-1" style={{ fontSize: "0.6875rem" }}>
                    {delivery.trackingNumber || "Sin seguimiento"}
                  </p>
                </div>
                <div className="text-end flex-shrink-0">
                  <StatusBadge status={delivery.status} />
                  <p className="ct-font-mono ct-text-faint mb-0 mt-2" style={{ fontSize: "0.6875rem" }}>
                    {formatDate(delivery.received)}
                  </p>
                </div>
                {isWaiting(delivery.status) && (
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
