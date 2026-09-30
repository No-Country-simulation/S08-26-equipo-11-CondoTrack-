import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@/shared/components/Icon";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

const NAV_ITEMS = [
  { to: "/portal", end: true, label: "Inicio", icon: "dashboard" },
  { to: "/portal/visitas", label: "Visitas & QR", icon: "qr" },
  { to: "/portal/deliveries", label: "Mis deliveries", icon: "deliveries" },
  { to: "/portal/reservas", label: "Reservas", icon: "reservations" },
  { to: "/portal/mudanzas", label: "Mudanzas", icon: "move" },
  { to: "/portal/solicitudes", label: "Solicitudes", icon: "maintenance" },
  { to: "/portal/unidad", label: "Mi unidad", icon: "buildings" },
  { to: "/portal/perfil", label: "Mi perfil", icon: "person" },
];

export const ResidentSidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const current = useCurrentResident();
  const initials =
    current.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <aside className="ct-sidebar">
      <div className="ct-sidebar-brand" style={{ paddingBottom: "1rem" }}>
        <div className="ct-sidebar-brand-mark">
          <Icon name="buildings" size={14} className="text-white" />
        </div>
        <span className="ct-sidebar-brand-name">CondoTrack</span>
      </div>

      <div className="p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="d-flex align-items-center gap-3">
          <div className="ct-avatar" style={{ width: 40, height: 40, fontSize: "0.875rem", background: "var(--color-amber)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white mb-0 text-truncate" style={{ fontSize: "0.875rem", fontWeight: 500 }}>{current.name}</p>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }} className="ct-font-mono">Unidad</span>
              <span className="ct-font-mono fw-semibold px-2 rounded" style={{ fontSize: "10px", background: "rgba(249,115,22,0.25)", color: "#fdba74" }}>
                {current.unitLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="ct-sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `ct-sidebar-link ${isActive ? "active" : ""}`}
          >
            <Icon name={item.icon} size={15} />
            <span className="flex-grow-1">{item.label}</span>
            {item.badge && <span className="ct-sidebar-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="ct-sidebar-footer">
        <button
          type="button"
          className="btn btn-link p-0 d-flex align-items-center gap-2 ct-font-mono"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", textDecoration: "none" }}
          onClick={async () => {
            await logout();
            navigate("/login", { replace: true });
          }}
        >
          <Icon name="logout" size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
