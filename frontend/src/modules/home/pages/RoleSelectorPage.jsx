import { useNavigate } from "react-router-dom";
import { Icon } from "@/shared/components/Icon";

export const RoleSelectorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center gap-5" style={{ minHeight: "100vh", background: "var(--color-canvas)" }}>
      <div className="text-center">
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <div className="ct-icon-tile-lg d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, borderRadius: "0.75rem", background: "var(--color-accent)" }}>
            <Icon name="buildings" size={18} className="text-white" />
          </div>
          <span className="ct-font-display" style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-ink)" }}>CondoTrack</span>
        </div>
        <p className="ct-text-muted mb-0">Seleccioná tu perfil para continuar</p>
      </div>

      <div className="d-flex gap-4 flex-wrap justify-content-center">
        <button type="button" className="ct-role-card" onClick={() => navigate("/dashboard")}>
          <div className="ct-icon-tile-lg d-flex align-items-center justify-content-center mb-3" style={{ background: "var(--color-accent-light)" }}>
            <Icon name="gear" size={22} style={{ color: "var(--color-accent)" }} />
          </div>
          <p className="fw-semibold mb-1" style={{ color: "var(--color-ink)" }}>Administración</p>
          <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
            Gestión completa del edificio: residentes, accesos, deliveries, incidentes y más.
          </p>
          <div className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--color-accent)" }}>
            Ingresar <Icon name="chevron" size={13} />
          </div>
        </button>

        <button type="button" className="ct-role-card" onClick={() => navigate("/portal")}>
          <div className="ct-icon-tile-lg d-flex align-items-center justify-content-center mb-3" style={{ background: "#fff7ed" }}>
            <Icon name="person" size={22} style={{ color: "var(--color-amber)" }} />
          </div>
          <p className="fw-semibold mb-1" style={{ color: "var(--color-ink)" }}>Residente</p>
          <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
            Tu unidad, deliveries, reservas, visitas y solicitudes en un solo lugar.
          </p>
          <div className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--color-amber)" }}>
            Ingresar <Icon name="chevron" size={13} />
          </div>
        </button>

        <button type="button" className="ct-role-card" onClick={() => navigate("/recepcion")}>
          <div className="ct-icon-tile-lg d-flex align-items-center justify-content-center mb-3" style={{ background: "var(--color-green-light)" }}>
            <Icon name="access" size={22} style={{ color: "var(--color-green)" }} />
          </div>
          <p className="fw-semibold mb-1" style={{ color: "var(--color-ink)" }}>Recepción / Portería</p>
          <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
            Registro de accesos y deliveries en la entrada del edificio.
          </p>
          <div className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--color-green)" }}>
            Ingresar <Icon name="chevron" size={13} />
          </div>
        </button>
      </div>

      <p className="ct-font-mono ct-text-faint mb-0" style={{ fontSize: "0.6875rem" }}>Torre Madero · Buenos Aires</p>
    </div>
  );
};
