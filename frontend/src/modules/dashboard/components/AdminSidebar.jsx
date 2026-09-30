import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Icon } from "@/shared/components/Icon";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useDeliveries } from "@/modules/deliveries/hooks/useDeliveries";
import { useIncidents } from "@/modules/incidents/hooks/useIncidents";

const NAV_ITEMS = [
  { to: "/dashboard", end: true, label: "Dashboard", icon: "dashboard" },
  { to: "/dashboard/edificios", label: "Edificios", icon: "buildings" },
  { to: "/dashboard/residentes", label: "Residentes", icon: "residents" },
  { to: "/dashboard/personal", label: "Personal", icon: "person" },
  { to: "/dashboard/usuarios", label: "Usuarios", icon: "user-plus" },
  { to: "/dashboard/accesos", label: "Accesos", icon: "access" },
  { to: "/dashboard/deliveries", label: "Deliveries", icon: "deliveries", badgeKey: "pendingDeliveries" },
  { to: "/dashboard/reservas", label: "Reservas", icon: "reservations" },
  { to: "/dashboard/mudanzas", label: "Mudanzas", icon: "move" },
  { to: "/dashboard/mantenimiento", label: "Mantenimiento", icon: "maintenance" },
  { to: "/dashboard/incidentes", label: "Incidentes", icon: "incidents", badgeKey: "openIncidents" },
  { to: "/dashboard/comunicaciones", label: "Comunicaciones", icon: "notification" },
  { to: "/dashboard/actividad", label: "Actividad", icon: "clock" },
  { to: "/dashboard/perfil", label: "Mi perfil", icon: "person" },
];

export const AdminSidebar = ({ selectedBuildingId, onBuildingChange }) => {
  const [open, setOpen] = useState(false);
  const { buildings, getBuildingById } = useBuildings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const current = getBuildingById(selectedBuildingId);
  // Los badges se calculan desde los contextos ya cargados: ambos autofetchean
  // los edificios, así que acá no se dispara ningún request extra.
  const { pendingForBuilding } = useDeliveries();
  const { openForBuilding } = useIncidents();
  const badgeCounts = {
    pendingDeliveries: pendingForBuilding(selectedBuildingId).length,
    openIncidents: openForBuilding(selectedBuildingId).length,
  };

  const displayName =
    `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim() ||
    user?.email ||
    "Administración";
  const initials =
    `${user?.nombre?.[0] ?? ""}${user?.apellido?.[0] ?? ""}`.toUpperCase() ||
    (user?.email?.[0] ?? "A").toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

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
            {item.badgeKey && badgeCounts[item.badgeKey] > 0 && (
              <span className="ct-sidebar-badge">{badgeCounts[item.badgeKey]}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="ct-sidebar-footer">
        <div className="d-flex align-items-center gap-3">
          <div className="ct-avatar" style={{ width: 32, height: 32, fontSize: "0.75rem", background: "rgba(255,255,255,0.2)" }}>
            {initials}
          </div>
          <div className="flex-grow-1 min-w-0">
            <p className="text-white mb-0 text-truncate" style={{ fontSize: "0.75rem", fontWeight: 500 }}>{displayName}</p>
            <p className="text-truncate mb-0" style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)" }}>{user?.email ?? current.name}</p>
          </div>
        </div>
        <button type="button" className="ct-sidebar-link mt-2" onClick={handleLogout}>
          <Icon name="logout" size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

AdminSidebar.propTypes = {
  selectedBuildingId: PropTypes.string,
  onBuildingChange: PropTypes.func.isRequired,
};
