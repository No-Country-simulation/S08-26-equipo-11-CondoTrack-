import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@/shared/components/Icon";

const NAV_ITEMS = [
  { to: "/recepcion", end: true, label: "Accesos", icon: "access" },
  { to: "/recepcion/deliveries", label: "Deliveries", icon: "deliveries" },
];

export const ReceptionSidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="ct-sidebar">
      <div className="ct-sidebar-brand">
        <div className="ct-sidebar-brand-mark">
          <Icon name="buildings" size={14} className="text-white" />
        </div>
        <span className="ct-sidebar-brand-name">CondoTrack</span>
      </div>

      <div className="p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="ct-sidebar-label mb-0">Perfil</p>
        <p className="text-white mb-0 mt-1" style={{ fontSize: "0.875rem", fontWeight: 500 }}>Recepción / Portería</p>
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
          className="btn btn-link p-0 d-flex align-items-center gap-2 ct-font-mono"
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", textDecoration: "none" }}
          onClick={() => navigate("/inicio")}
        >
          <Icon name="logout" size={13} />
          Cambiar perfil
        </button>
      </div>
    </aside>
  );
};
