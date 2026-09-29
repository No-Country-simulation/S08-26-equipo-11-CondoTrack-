import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useReservations } from "@/modules/reservations/hooks/useReservations";
import { useReservationBooking } from "@/modules/reservations/hooks/useReservationBooking";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

export const MyReservationsPage = () => {
  const { spaces, forUnit } = useReservations();
  const { selectedSpace, selectSpace, form, updateField, booked, book, reset } = useReservationBooking();
  const current = useCurrentResident();
  const myReservations = forUnit(current.unit);

  return (
    <div className="ct-main-scroll">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="ct-card overflow-hidden">
            <div className="ct-card-header">
              <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                Espacios disponibles
              </p>
            </div>
            <div>
              {spaces.map((space) => (
                <button
                  key={space.name}
                  type="button"
                  className="ct-row ct-row-hover d-flex align-items-center justify-content-between w-100 border-0 bg-transparent text-start"
                  style={{
                    background: selectedSpace === space.name ? "var(--color-accent-light)" : undefined,
                    borderLeft: selectedSpace === space.name ? "3px solid var(--color-accent)" : "3px solid transparent",
                  }}
                  onClick={() => selectSpace(space.name)}
                >
                  <div>
                    <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{space.name}</p>
                    <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.6875rem" }}>Capacidad: {space.cap} personas</p>
                  </div>
                  <Icon name="chevron" size={14} className="ct-text-faint" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8 d-flex flex-column gap-4">
          {selectedSpace && (
            <div className="ct-card">
              <div className="ct-card-header" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                <p className="ct-font-mono text-uppercase ct-text-muted mb-1" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>Reservar</p>
                <h3 className="ct-card-title" style={{ fontSize: "1rem" }}>{selectedSpace}</h3>
              </div>
              {booked ? (
                <div className="text-center py-4">
                  <div className="ct-icon-tile-lg d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 48, height: 48, borderRadius: "999px", background: "var(--color-green-light)" }}>
                    <Icon name="check" size={22} style={{ color: "var(--color-green)" }} />
                  </div>
                  <p className="fw-semibold mb-0" style={{ color: "var(--color-ink)" }}>¡Reserva enviada!</p>
                  <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.75rem" }}>La administración confirmará en breve</p>
                  <button type="button" className="btn btn-link btn-sm mt-2" onClick={reset}>Volver</button>
                </div>
              ) : (
                <div className="p-3">
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Fecha</label>
                      <input type="date" className="form-control form-control-sm" value={form.date} onChange={updateField("date")} />
                    </div>
                    <div className="col-6">
                      <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Cant. invitados</label>
                      <input type="number" min={0} placeholder="0" className="form-control form-control-sm" value={form.guests} onChange={updateField("guests")} />
                    </div>
                    <div className="col-6">
                      <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Hora inicio</label>
                      <input type="time" className="form-control form-control-sm" value={form.timeFrom} onChange={updateField("timeFrom")} />
                    </div>
                    <div className="col-6">
                      <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Hora fin</label>
                      <input type="time" className="form-control form-control-sm" value={form.timeTo} onChange={updateField("timeTo")} />
                    </div>
                  </div>
                  <button type="button" className="btn w-100 text-white" style={{ background: "var(--color-accent)" }} onClick={book}>
                    Solicitar reserva
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="ct-card overflow-hidden">
            <div className="ct-card-header">
              <h3 className="ct-card-title" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mis reservas</h3>
            </div>
            {myReservations.length === 0 ? (
              <div className="text-center py-4 ct-text-muted">Sin reservas activas</div>
            ) : (
              <div>
                {myReservations.map((reservation) => (
                  <div key={reservation.id} className="ct-row ct-row-hover d-flex align-items-center gap-3">
                    <div className="ct-icon-tile" style={{ width: 36, height: 36, background: "var(--color-accent-light)" }}>
                      <Icon name="reservations" size={15} style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{reservation.space}</p>
                      <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.75rem" }}>{reservation.date} · {reservation.time}</p>
                    </div>
                    <StatusBadge status={reservation.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
