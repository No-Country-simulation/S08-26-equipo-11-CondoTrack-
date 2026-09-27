import { useState } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { Icon } from "@/shared/components/Icon";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";

const NAV_ITEMS = [
  { to: "/dashboard", end: true, label: "Dashboard", icon: "dashboard" },
  { to: "/dashboard/edificios", label: "Edificios", icon: "buildings" },
  { to: "/dashboard/residentes", label: "Residentes", icon: "residents" },
  { to: "/dashboard/personal", label: "Personal", icon: "person" },
  { to: "/dashboard/accesos", label: "Accesos", icon: "access" },
  { to: "/dashboard/deliveries", label: "Deliveries", icon: "deliveries", badge: 3 },
  { to: "/dashboard/reservas", label: "Reservas", icon: "reservations" },
  { to: "/dashboard/mudanzas", label: "Mudanzas", icon: "move" },
  { to: "/dashboard/mantenimiento", label: "Mantenimiento", icon: "maintenance" },
  { to: "/dashboard/incidentes", label: "Incidentes", icon: "incidents", badge: 2 },
  { to: "/dashboard/comunicaciones", label: "Comunicaciones", icon: "notification" },
  { to: "/dashboard/actividad", label: "Actividad", icon: "clock" },
];

export const AdminSidebar = ({ selectedBuildingId, onBuildingChange }) => {
  const [open, setOpen] = useState(false);
  const { buildings, getBuildingById } = useBuildings();
  const current = getBuildingById(selectedBuildingId);

  return (
    <aside className="ct-sidebar">
      <div className="ct-sidebar-brand">
        <div className="ct-sidebar-brand-mark">
          <Icon name="buildings" size={14} className="text-white" />
        </div>
        <span className="ct-sidebar-brand-name">CondoTrack</span>
      </div>

      <div className="ct-sidebar-section">
        <p className="ct-sidebar-label">Edificio</p>
        <button type="button" className="ct-sidebar-selector" onClick={() => setOpen((o) => !o)}>
          <span className="text-truncate fw-medium">{current.name}</span>
          <Icon name="elevator" size={14} className={`ct-chevron-rotate ${open ? "open" : ""}`} />
        </button>

        {open && (
          <div className="ct-building-dropdown">
            {buildings.map((building) => (
              <button
                key={building.id}
                type="button"
                className={`ct-building-option ${building.id === selectedBuildingId ? "active" : ""}`}
                onClick={() => {
                  onBuildingChange(building.id);
                  setOpen(false);
                }}
              >
                <p className="text-truncate mb-0">{building.name}</p>
                <p className="ct-font-mono text-truncate mb-0 mt-1" style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                  {building.units} unidades · {building.city}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="ct-sidebar-nav">
        <p className="ct-sidebar-label mt-2">Gestión</p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `ct-sidebar-link ${isActive ? "active" : ""}`}
          >
            <Icon name={item.icon} size={15} />
            {item.label}
            {item.badge && <span className="ct-sidebar-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="ct-sidebar-footer">
        <div className="d-flex align-items-center gap-3">
          <div className="ct-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem", background: "rgba(255,255,255,0.2)" }}>
            AM
          </div>
          <div className="flex-grow-1 min-w-0">
            <p className="text-white mb-0 text-truncate" style={{ fontSize: "0.75rem", fontWeight: 500 }}>Administración</p>
            <p className="text-truncate mb-0" style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)" }}>{current.name}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

AdminSidebar.propTypes = {
  selectedBuildingId: PropTypes.number.isRequired,
  onBuildingChange: PropTypes.func.isRequired,
};
