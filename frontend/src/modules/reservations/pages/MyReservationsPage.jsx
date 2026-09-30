import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { useReservations } from "@/modules/reservations/hooks/useReservations";
import { useReservationBooking } from "@/modules/reservations/hooks/useReservationBooking";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";
import { listCommonAreas } from "@/modules/amenities/services/commonAreasService";
import { bookReservation } from "@/modules/reservations/services/reservationsService";
import { apiErrorMessage } from "@/core/api/api";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const toIsoWithOffset = (date, time) => {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

export const MyReservationsPage = () => {
  const { user } = useAuth();
  const current = useCurrentResident();
  const { forMine, refreshMine, loadingMine } = useReservations();
  const { selectedSpace, selectSpace, form, updateField, booked, book, reset } =
    useReservationBooking();
  const [areas, setAreas] = useState([]);
  const [bookingError, setBookingError] = useState("");
  const [bookingSaving, setBookingSaving] = useState(false);

  const myReservations = forMine();
  const myUnitId = user?.units?.[0]?.id ?? null;

  // Espacios reales del edificio (el backend los expone al RESIDENT).
  // Antes caía a una lista estática de referencia; ahora solo muestra áreas
  // comunes reales y avisa cuando el edificio todavía no tiene ninguna.
  useEffect(() => {
    if (!current.buildingId) {
      return undefined;
    }

    let cancelled = false;
    listCommonAreas(current.buildingId)
      .then((items) => {
        if (!cancelled) setAreas(items);
      })
      .catch(() => {
        if (!cancelled) setAreas([]);
      });

    return () => {
      cancelled = true;
    };
  }, [current.buildingId]);

  const spaceOptions = areas.map((area) => ({
    name: area.name,
    cap: area.capacity,
    id: area.id,
  }));

  const handleBook = async () => {
    setBookingError("");

    const area = areas.find((item) => item.name === selectedSpace);
    if (!selectedSpace || !area) {
      setBookingError("Elegí un espacio válido del edificio.");
      return;
    }
    if (!myUnitId) {
      setBookingError(
        "Tu usuario no tiene una unidad asignada para reservar.",
      );
      return;
    }

    const startAt = toIsoWithOffset(form.date, form.timeFrom);
    const endAt = toIsoWithOffset(form.date, form.timeTo);
    if (!startAt || !endAt) {
      setBookingError("Completá fecha y horarios válidos.");
      return;
    }

    setBookingSaving(true);
    try {
      await bookReservation(area.id, {
        unitId: myUnitId,
        startAt,
        endAt,
        notes: form.notes,
      });
      book();
      // La reserva recién creada debe verse en "Mis reservas" sin recargar.
      await refreshMine();
    } catch (err) {
      setBookingError(
        apiErrorMessage(err, "No se pudo enviar la reserva."),
      );
    } finally {
      setBookingSaving(false);
    }
  };

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
              {spaceOptions.length === 0 ? (
                <p className="ct-text-muted px-3 py-3 mb-0">
                  Este edificio todavía no tiene espacios comunes cargados.
                </p>
              ) : (
                spaceOptions.map((space) => (
                  <button
                    key={space.id}
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
                      <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.6875rem" }}>Capacidad: {space.cap ?? "—"} personas</p>
                    </div>
                    <Icon name="chevron" size={14} className="ct-text-faint" />
                  </button>
                ))
              )}
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
                      <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Hora inicio</label>
                      <input type="time" className="form-control form-control-sm" value={form.timeFrom} onChange={updateField("timeFrom")} />
                    </div>
                    <div className="col-6">
                      <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Hora fin</label>
                      <input type="time" className="form-control form-control-sm" value={form.timeTo} onChange={updateField("timeTo")} />
                    </div>
                    <div className="col-6">
                      <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Notas (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ej. Cumpleaños familiar"
                        className="form-control form-control-sm"
                        value={form.notes ?? ""}
                        onChange={updateField("notes")}
                      />
                    </div>
                  </div>
                  {bookingError && (
                    <Alert variant="danger" className="py-2 small mb-3">
                      {bookingError}
                    </Alert>
                  )}
                  <button
                    type="button"
                    className="btn w-100 text-white"
                    style={{ background: "var(--color-accent)" }}
                    onClick={handleBook}
                    disabled={bookingSaving}
                  >
                    {bookingSaving ? "Enviando..." : "Solicitar reserva"}
                  </button>
                  <p className="ct-font-mono ct-text-faint mt-2 mb-0" style={{ fontSize: "0.6875rem" }}>
                    {current.hasUnit
                      ? `Se reserva como Unidad ${current.unit}. Requiere rol de residente en el edificio.`
                      : "Necesitás una unidad asignada para reservar."}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="ct-card overflow-hidden">
            <div className="ct-card-header">
              <h3 className="ct-card-title" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mis reservas</h3>
            </div>
            {loadingMine ? (
              <div className="text-center py-4 ct-text-muted">Cargando reservas...</div>
            ) : myReservations.length === 0 ? (
              <div className="text-center py-4 ct-text-muted">Sin reservas activas</div>
            ) : (
              <div>
                {myReservations.map((reservation) => (
                  <div key={reservation.id} className="ct-row ct-row-hover d-flex align-items-center gap-3">
                    <div className="ct-icon-tile" style={{ width: 36, height: 36, background: "var(--color-accent-light)" }}>
                      <Icon name="reservations" size={15} style={{ color: "var(--color-accent)" }} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{reservation.space || "Espacio"}</p>
                      <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.75rem" }}>
                        {formatDateTime(reservation.startAt)} → {formatDateTime(reservation.endAt)}
                      </p>
                      <p className="ct-font-mono ct-text-faint mb-0 mt-1" style={{ fontSize: "0.6875rem" }}>
                        Unidad {reservation.unit || "—"}
                        {reservation.notes ? ` · ${reservation.notes}` : ""}
                      </p>
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
