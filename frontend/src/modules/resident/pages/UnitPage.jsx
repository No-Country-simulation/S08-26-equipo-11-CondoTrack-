import { useEffect, useState } from "react";
import {
  AMENITIES,
  BUILDING_CONTACTS,
  BUILDING_RULES,
} from "@/modules/resident/data/unit.data";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";
import { listCommonAreas } from "@/modules/amenities/services/commonAreasService";

export const UnitPage = () => {
  const current = useCurrentResident();
  const [areas, setAreas] = useState(null);

  // Amenities reales del edificio (el backend las expone al RESIDENT).
  // Si falla o viene vacío, se muestran las de referencia locales.
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

  const amenities = areas?.length ? areas.map((area) => area.name) : AMENITIES;

  const UNIT_STATS = [
    { label: "Edificios", val: current.buildingLabel },
    {
      label: "Piso",
      val: current.unitFloor == null ? "—" : `${current.unitFloor}°`,
    },
    { label: "Tipo", val: current.unitType ?? "—" },
    { label: "Superficie", val: "82 m²" },
    { label: "Unidad", val: "Nro. 24" },
    { label: "Baulera", val: "Nro. 08" },
    { label: "Desde", val: "—" },
    { label: "Condición", val: "—" },
  ];

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-unit">
        <div className="d-flex flex-column gap-4">
          <div className="ct-card overflow-hidden">
            <div className="ct-building-cover" style={{ height: "7rem" }}>
              <img
                src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=112&fit=crop&auto=format"
                alt={`Unidad ${current.unitLabel}`}
              />
              <p className="ct-building-cover-title">Unidad {current.unitLabel}</p>
            </div>
            <div className="p-3">
              <div className="row row-cols-2 g-3">
                {UNIT_STATS.map((stat) => (
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
              <p
                className="ct-font-mono text-uppercase ct-text-muted mb-0"
                style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
              >
                Amenities del edificio
              </p>
            </div>
            <div className="p-3 d-flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="badge rounded-pill fw-medium ct-text-muted"
                  style={{
                    border: "1px solid var(--color-border)",
                    background: "transparent",
                    fontSize: "0.75rem",
                  }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-4">
          <div className="ct-card overflow-hidden">
            <div className="ct-card-header">
              <h3 className="ct-card-title">Contactos del edificio</h3>
            </div>
            <div>
              {BUILDING_CONTACTS.map((contact) => (
                <div key={contact.role} className="ct-row ct-row-hover">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                    <div>
                      <p
                        className="ct-font-mono text-uppercase ct-text-faint mb-0"
                        style={{ fontSize: "10px", letterSpacing: "0.05em" }}
                      >
                        {contact.role}
                      </p>
                      <p
                        className="fw-semibold mb-0 mt-1"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {contact.name}
                      </p>
                    </div>
                    <span
                      className="ct-font-mono px-2 py-1 rounded"
                      style={{
                        fontSize: "0.6875rem",
                        background: "var(--color-canvas)",
                        color: "var(--color-ink-muted)",
                      }}
                    >
                      {contact.hours}
                    </span>
                  </div>
                  <p
                    className="ct-font-mono mb-0"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {contact.phone}
                  </p>
                  <p
                    className="ct-font-mono ct-text-muted mb-0"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {contact.email}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="ct-card p-4">
            <h3 className="ct-card-title mb-3">Reglamento interno</h3>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              {BUILDING_RULES.map((rule) => (
                <li
                  key={rule}
                  className="d-flex align-items-start gap-2 ct-text-muted"
                >
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "999px",
                      background: "var(--color-accent)",
                      marginTop: 8,
                      flexShrink: 0,
                    }}
                  />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
