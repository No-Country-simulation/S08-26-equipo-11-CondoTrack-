import PropTypes from "prop-types";
import { Icon } from "@/shared/components/Icon";

export const KpiCard = ({ label, value, sub, accent, icon }) => {
  // Los valores de texto son estados sin datos ("sin unidades"), no métricas:
  // se muestran en un cuerpo legible para que no se lean como un número roto.
  const isCount = typeof value === "number";

  return (
  <div className="ct-card p-4 d-flex flex-column gap-3">
    <div className="d-flex align-items-start justify-content-between">
      <p
        className="text-uppercase mb-0 ct-text-muted"
        style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.03em" }}
      >
        {label}
      </p>
      {icon && (
        <div
          className="ct-icon-tile"
          style={{ background: accent || "var(--color-accent-light)" }}
        >
          <Icon name={icon} size={14} className="opacity-70" />
        </div>
      )}
    </div>
    <div>
      <p
        className={`ct-font-display mb-0 ${isCount ? "" : "ct-text-muted"}`}
        style={{
          fontSize: isCount ? "1.875rem" : "1.125rem",
          fontWeight: 600,
          color: isCount ? "var(--color-ink)" : "var(--color-ink-muted)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </p>
      {sub && (
        <p className="ct-font-mono ct-text-muted mb-0 mt-2" style={{ fontSize: "0.75rem" }}>
          {sub}
        </p>
      )}
    </div>
  </div>
  );
};

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string,
  accent: PropTypes.string,
  icon: PropTypes.string,
};
