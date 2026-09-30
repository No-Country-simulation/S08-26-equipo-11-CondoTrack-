import { useEffect, useState } from "react";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";
import { listCommonAreas } from "@/modules/amenities/services/commonAreasService";
import { listUnits } from "@/modules/units/services/unitsService";
import { listUnitResidents } from "@/modules/residents/services/residentsService";
import { useStaffByRole } from "@/modules/staff/hooks/useStaffByRole";

const RELATIONSHIP_LABELS = {
  RESIDENT: "Residente",
  OWNER: "Propietario",
  TENANT: "Inquilino",
  FAMILY: "Familiar",
};

const formatSince = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
};

// Ficha real de la unidad del residente: todo sale del backend. Antes la
// pantalla sembraba superficie, cochera, baulera, contactos de portería y
// reglamento interno, y ninguno de esos datos existe en la API.
export const UnitPage = () => {
  const current = useCurrentResident();
  const { staff, isLoading: staffLoading, error: staffError } =
    useStaffByRole(current.buildingId);
  const [unit, setUnit] = useState(null);
  const [residents, setResidents] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // La sesión trae el id de la unidad pero no su detalle: hay que buscarlo
  // entre las unidades del edificio.
  useEffect(() => {
    if (!current.buildingId || !current.unitId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia el detalle al perder la sesión
      setUnit(null);
       
      setResidents([]);
      return undefined;
    }

    let cancelled = false;
     
    setLoading(true);
    setError("");

    listUnits(current.buildingId)
      .then(({ units }) => {
        const found = units.find((item) => item.id === current.unitId);
        if (cancelled) return;
        if (!found) {
          setUnit(null);
          setError("No encontramos tu unidad en este edificio.");
          return null;
        }
        setUnit(found);
        return found;
      })
      .then((found) =>
        // Los vínculos de la unidad solo se piden si la unidad existe.
        found ? listUnitResidents(found).catch(() => []) : [],
      )
      .then((links) => {
        if (!cancelled) setResidents(links);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.response?.data?.message ??
            "No se pudo cargar el detalle de tu unidad.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [current.buildingId, current.unitId]);

  // Espacios comunes reales del edificio.
  useEffect(() => {
    if (!current.buildingId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia al perder el edificio
      setAreas([]);
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

  if (!current.hasUnit) {
    return (
      <div className="ct-main-scroll">
        <div className="ct-card p-4">
          <p className="ct-text-muted mb-0">
            Tu cuenta todavía no tiene una unidad asignada. Pedí al
            administrador que la vincule para ver el detalle.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ct-main-scroll">
        <p className="ct-text-muted">Cargando tu unidad...</p>
      </div>
    );
  }

  const unitStats = [
    { label: "Edificio", val: current.buildingLabel },
    { label: "Unidad", val: unit?.code ?? current.unitLabel },
    {
      label: "Piso",
      val: unit?.floor == null ? "—" : `${unit.floor}°`,
    },
    { label: "Tipo", val: unit?.unitType || "—" },
    { label: "Estado", val: unit?.isActive === false ? "Inactiva" : "Activa" },
    { label: "Integrantes", val: String(residents.length) },
  ];

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-unit">
        <div className="d-flex flex-column gap-4">
          <div className="ct-card overflow-hidden">
            <div className="ct-building-cover" style={{ height: "7rem" }}>
              <p className="ct-building-cover-title">
                Unidad {unit?.code ?? current.unitLabel}
              </p>
            </div>
            <div className="p-3">
              {error ? (
                <p className="ct-text-muted mb-0">{error}</p>
              ) : unit?.description ? (
                <p className="ct-text-muted mb-3">{unit.description}</p>
              ) : null}
              <div className="row row-cols-2 g-3">
                {unitStats.map((stat) => (
                  <div key={stat.label} className="col">
                    <p
                      className="ct-font-mono text-uppercase ct-text-faint mb-0"
                      style={{ fontSize: "10px", letterSpacing: "0.05em" }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="mb-0 fw-medium mt-1"
                      style={{ color: "var(--color-ink)" }}
                    >
                      {stat.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ct-card">
            <div className="ct-card-header">
              <h3 className="ct-card-title mb-0">Integrantes de la unidad</h3>
            </div>
            <div>
              {residents.length === 0 ? (
                <p className="ct-text-muted mb-0 p-3">
                  Todavía no hay personas vinculadas a esta unidad.
                </p>
              ) : (
                residents.map((link) => {
                  const person = link.person ?? {};
                  const fullName =
                    `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
                    link.email ||
                    "Sin nombre";
                  const since = formatSince(link.startDate);

                  return (
                    <div
                      key={link.id}
                      className="ct-row ct-row-hover d-flex align-items-center justify-content-between gap-3"
                    >
                      <div className="min-w-0">
                        <p
                          className="mb-0 fw-medium text-truncate"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {fullName}
                        </p>
                        <p
                          className="ct-font-mono ct-text-muted mb-0"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {RELATIONSHIP_LABELS[link.relationshipType] ??
                            link.relationshipType}
                          {since ? ` · desde ${since}` : ""}
                        </p>
                      </div>
                      {link.person?.documentNumber && (
                        <span
                          className="ct-font-mono ct-text-faint flex-shrink-0"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {link.person.documentNumber}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-4">
          <div className="ct-card overflow-hidden">
            <div className="ct-card-header">
              <h3 className="ct-card-title">Espacios comunes</h3>
            </div>
            <div className="p-3 d-flex flex-wrap gap-2">
              {areas.length === 0 ? (
                <p className="ct-text-muted mb-0">
                  Este edificio no tiene espacios comunes cargados.
                </p>
              ) : (
                areas.map((area) => (
                  <span
                    key={area.id}
                    className="badge rounded-pill fw-medium ct-text-muted"
                    style={{
                      border: "1px solid var(--color-border)",
                      background: "transparent",
                      fontSize: "0.75rem",
                    }}
                  >
                    {area.name}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="ct-card overflow-hidden">
            <div className="ct-card-header">
              <h3 className="ct-card-title">Personal del edificio</h3>
            </div>
            <div>
              {staffLoading ? (
                <p className="ct-text-muted mb-0 p-3">Cargando personal...</p>
              ) : staffError ? (
                // No se dice "no hay personal": el endpoint de usuarios es de
                // administración y un RESIDENT recibe 403. Lo que sabemos es
                // que no se pudo consultar, no que la lista esté vacía.
                <p className="ct-text-muted mb-0 p-3">
                  El personal del edificio no se puede consultar desde tu
                  perfil. Necesitás hablar con la administración.
                </p>
              ) : staff.length === 0 ? (
                <p className="ct-text-muted mb-0 p-3">
                  Este edificio no tiene personal asignado.
                </p>
              ) : (
                staff.map((member) => (
                  <div key={member.id} className="ct-row ct-row-hover">
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p
                          className="ct-font-mono text-uppercase ct-text-faint mb-0"
                          style={{ fontSize: "10px", letterSpacing: "0.05em" }}
                        >
                          {member.roleLabel}
                        </p>
                        <p
                          className="fw-semibold mb-0 mt-1 text-truncate"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {member.name || member.email}
                        </p>
                      </div>
                      <StatusBadge status={member.status} />
                    </div>
                    {member.phone && member.phone !== "—" && (
                      <p
                        className="ct-font-mono mb-0"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {member.phone}
                      </p>
                    )}
                    <p
                      className="ct-font-mono ct-text-muted mb-0"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {member.email}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
