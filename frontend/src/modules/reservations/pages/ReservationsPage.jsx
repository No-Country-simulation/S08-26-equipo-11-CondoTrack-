import { StatusBadge } from "@/shared/components/StatusBadge";
import { useReservations } from "@/modules/reservations/hooks/useReservations";

export const ReservationsPage = () => {
  const { reservations, spaces, hasReservation } = useReservations();

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-reservations">
        <div className="ct-card">
          <div className="ct-card-header">
            <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              Espacios comunes
            </p>
          </div>
          <div>
            {spaces.map((space) => (
              <div key={space.name} className="ct-row ct-row-hover ct-row-clickable d-flex align-items-center justify-content-between">
                <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{space.name}</p>
                <StatusBadge status={hasReservation(space.name) ? "confirmed" : "pending"} />
              </div>
            ))}
          </div>
        </div>

        <div className="ct-card overflow-hidden">
          <div className="ct-card-header">
            <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              Próximas reservas
            </p>
          </div>
          <table className="ct-table mb-0">
            <thead>
              <tr>
                {["Espacio", "Residente", "Fecha", "Horario", "Invitados", "Estado"].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="fw-medium" style={{ color: "var(--color-ink)" }}>{reservation.space}</td>
                  <td className="ct-text-muted">
                    {reservation.resident}
                    <span className="ct-font-mono ms-1" style={{ fontSize: "0.75rem" }}>· {reservation.unit}</span>
                  </td>
                  <td className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>{reservation.date}</td>
                  <td className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>{reservation.time}</td>
                  <td className="ct-font-mono text-center" style={{ fontSize: "0.75rem" }}>{reservation.guests || "—"}</td>
                  <td><StatusBadge status={reservation.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
