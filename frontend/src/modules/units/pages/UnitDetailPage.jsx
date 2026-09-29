import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { getUnitDetail } from "@/modules/units/services/unitsService";
import { apiErrorMessage } from "@/core/api/api";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

export const UnitDetailPage = () => {
  const { buildingId, unitId } = useParams();
  const { getBuildingById } = useBuildings();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUnit = useCallback(async () => {
    if (!unitId) return;
    setLoading(true);
    setError("");

    try {
      setUnit(await getUnitDetail(unitId));
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo cargar la unidad."));
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial del detalle
    loadUnit();
  }, [loadUnit]);

  const building = getBuildingById(buildingId);
  const residents = unit?.unitPeople ?? [];

  if (loading) {
    return (
      <div className="ct-main-scroll">
        <p className="ct-text-muted">Cargando unidad...</p>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="ct-main-scroll">
        <Link
          to={`/dashboard/edificios/${buildingId}`}
          className="ct-card-link"
          style={{ fontSize: "0.75rem" }}
        >
          ← Volver al edificio
        </Link>
        <Alert variant="danger" className="mt-3">
          {error || "Unidad no encontrada."}
        </Alert>
      </div>
    );
  }

  return (
    <div className="ct-main-scroll">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <Link
            to={`/dashboard/edificios/${buildingId}`}
            className="ct-card-link"
            style={{ fontSize: "0.75rem" }}
          >
            ← Volver a {building.name}
          </Link>
          <h2
            className="ct-font-display mb-0 mt-1"
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--color-ink)",
            }}
          >
            Unidad {unit.code}
          </h2>
          <p className="ct-text-muted mb-0">
            {building.name} · Piso {unit.floor} · {unit.unitType}
          </p>
        </div>
        <StatusBadge status={unit.isActive ? "active" : "inactive"} />
      </div>

      <div className="ct-grid-kpi mb-4">
        <div className="ct-card p-3 text-center">
          <p
            className="ct-font-display mb-0"
            style={{ fontSize: "1.5rem", fontWeight: 600 }}
          >
            {unit.floor}
          </p>
          <p
            className="ct-font-mono ct-text-muted mb-0"
            style={{ fontSize: "0.75rem" }}
          >
            Piso
          </p>
        </div>
        <div className="ct-card p-3 text-center">
          <p
            className="ct-font-display mb-0"
            style={{ fontSize: "1.125rem", fontWeight: 600 }}
          >
            {unit.unitType}
          </p>
          <p
            className="ct-font-mono ct-text-muted mb-0"
            style={{ fontSize: "0.75rem" }}
          >
            Tipo
          </p>
        </div>
        <div className="ct-card p-3 text-center">
          <p
            className="ct-font-display mb-0"
            style={{ fontSize: "1.5rem", fontWeight: 600 }}
          >
            {residents.length}
          </p>
          <p
            className="ct-font-mono ct-text-muted mb-0"
            style={{ fontSize: "0.75rem" }}
          >
            Residentes
          </p>
        </div>
      </div>

      {unit.description && (
        <div className="ct-card p-3 mb-4">
          <p
            className="ct-font-mono text-uppercase ct-text-muted mb-1"
            style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
          >
            Descripción
          </p>
          <p className="mb-0" style={{ color: "var(--color-ink)" }}>
            {unit.description}
          </p>
        </div>
      )}

      <div className="ct-card overflow-hidden">
        <div className="ct-card-header">
          <h3 className="ct-card-title">Residentes vinculados</h3>
        </div>
        {residents.length === 0 ? (
          <div className="text-center py-4 ct-text-muted">
            Sin residentes vinculados a esta unidad.
          </div>
        ) : (
          <div>
            {residents.map((link) => {
              const person = link.person ?? {};
              const fullName =
                `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
                "Sin nombre";
              return (
                <div
                  key={link.id}
                  className="ct-row ct-row-hover d-flex align-items-center justify-content-between"
                >
                  <div>
                    <p
                      className="mb-0 fw-medium"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {fullName}
                    </p>
                    <p
                      className="ct-font-mono ct-text-muted mb-0"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {link.relationshipType}
                      {person.documentNumber
                        ? ` · ${person.documentType ?? "Doc."} ${person.documentNumber}`
                        : ""}
                      {person.email ? ` · ${person.email}` : ""}
                      {person.phone ? ` · ${person.phone}` : ""}
                    </p>
                    <p
                      className="ct-font-mono ct-text-faint mb-0"
                      style={{ fontSize: "0.6875rem" }}
                    >
                      Desde {formatDate(link.startDate)}
                      {link.endDate
                        ? ` hasta ${formatDate(link.endDate)}`
                        : " · vigente"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
