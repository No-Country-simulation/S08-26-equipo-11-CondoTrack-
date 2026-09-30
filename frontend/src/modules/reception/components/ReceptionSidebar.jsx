import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@/shared/components/Icon";
import { useAuth } from "@/modules/auth/contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/recepcion", end: true, label: "Accesos", icon: "access" },
  { to: "/recepcion/deliveries", label: "Deliveries", icon: "deliveries" },
  { to: "/recepcion/perfil", label: "Mi perfil", icon: "person" },
];

export const ReceptionSidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName =
    `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim() ||
    user?.email ||
    "Recepción / Portería";
  const initials =
    `${user?.nombre?.[0] ?? ""}${user?.apellido?.[0] ?? ""}`.toUpperCase() ||
    (user?.email?.[0] ?? "R").toUpperCase();

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

      <div className="p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="d-flex align-items-center gap-3">
          <div
            className="ct-avatar"
            style={{
              width: 40,
              height: 40,
              fontSize: "0.875rem",
              background: "var(--color-amber)",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p
              className="text-white mb-0 text-truncate"
              style={{ fontSize: "0.875rem", fontWeight: 500 }}
            >
              {displayName}
            </p>
            <p
              className="mb-0 text-truncate"
              style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)" }}
            >
              Recepción / Portería
            </p>
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
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="ct-sidebar-footer">
        <button
          type="button"
          className="ct-sidebar-link"
          onClick={() => navigate("/inicio")}
        >
          <Icon name="dashboard" size={15} />
          Cambiar perfil
        </button>
        <button
          type="button"
          className="ct-sidebar-link mt-2"
          onClick={handleLogout}
        >
          <Icon name="logout" size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
