import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { listCommonAreas } from "@/modules/amenities/services/commonAreasService";
import { listBuildingReservations } from "@/modules/reservations/services/reservationsService";
import { apiErrorMessage } from "@/core/api/api";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export const ReservationsPage = () => {
  const { buildings } = useBuildings();
  const [buildingId, setBuildingId] = useState("");
  const [areas, setAreas] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!buildingId) {
      return undefined;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga al elegir edificio
    setLoading(true);
    setError("");

    Promise.allSettled([
      listCommonAreas(buildingId),
      listBuildingReservations(buildingId),
    ])
      .then(([areasResult, reservationsResult]) => {
        if (cancelled) return;
        setAreas(
          areasResult.status === "fulfilled" ? areasResult.value : [],
        );
        if (reservationsResult.status === "fulfilled") {
          setReservations(reservationsResult.value);
        } else {
          setReservations([]);
          setError(
            apiErrorMessage(
              reservationsResult.reason,
              "No se pudieron cargar las reservas.",
            ),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [buildingId]);

  const areaNameOf = (commonAreaId) =>
    areas.find((area) => area.id === commonAreaId)?.name ?? "Espacio";

  return (
    <div className="ct-main-scroll">
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <select
          aria-label="Edificio"
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={buildingId}
          onChange={(event) => {
            setBuildingId(event.target.value);
            setAreas([]);
            setReservations([]);
            setError("");
          }}
        >
          <option value="">Seleccioná un edificio</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {!buildingId ? (
        <div className="text-center py-5 ct-text-muted">
          Elegí un edificio para ver sus espacios y reservas.
        </div>
      ) : (
        <div className="ct-grid-reservations">
          <div className="ct-card">
            <div className="ct-card-header">
              <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                Espacios comunes
              </p>
            </div>
            <div>
              {loading && (
                <p className="ct-text-muted px-3 py-3 mb-0">Cargando...</p>
              )}
              {!loading &&
                areas.map((space) => (
                  <div
                    key={space.id}
                    className="ct-row d-flex align-items-center justify-content-between"
                  >
                    <div>
                      <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>
                        {space.name}
                      </p>
                      <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.6875rem" }}>
                        Capacidad: {space.capacity ?? "—"}
                        {space.description ? ` · ${space.description}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              {!loading && areas.length === 0 && (
                <p className="ct-text-muted px-3 py-3 mb-0">
                  Sin espacios cargados. Crealos desde Edificios → Amenidades.
                </p>
              )}
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
                  {["Espacio", "Inicio", "Fin", "Notas", "Estado"].map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="fw-medium" style={{ color: "var(--color-ink)" }}>
                      {areaNameOf(reservation.commonAreaId)}
                    </td>
                    <td className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>
                      {formatDateTime(reservation.startAt)}
                    </td>
                    <td className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>
                      {formatDateTime(reservation.endAt)}
                    </td>
                    <td className="ct-text-muted" style={{ fontSize: "0.75rem" }}>
                      {reservation.notes || "—"}
                    </td>
                    <td><StatusBadge status={reservation.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && reservations.length === 0 && (
              <div className="text-center py-4 ct-text-muted">Sin reservas.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
