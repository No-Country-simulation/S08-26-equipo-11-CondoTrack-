import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/shared/components/Icon";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { canAccessProfile } from "@/modules/auth/constants/roles";
import { RoleInfoModal } from "@/modules/home/components/RoleInfoModal";

const PROFILES = [
  {
    key: "administracion",
    title: "Administración",
    description:
      "Gestión completa del edificio: residentes, accesos, deliveries, incidentes y más.",
    icon: "gear",
    accent: "var(--color-accent)",
    tileBackground: "var(--color-accent-light)",
    available: true,
    to: "/dashboard",
  },
  {
    key: "residente",
    title: "Residente",
    description:
      "Tu unidad, deliveries, reservas, visitas y solicitudes en un solo lugar.",
    icon: "person",
    accent: "var(--color-amber)",
    tileBackground: "#fff7ed",
    available: true,
    to: "/portal",
  },
  {
    key: "recepcion",
    title: "Recepción / Portería",
    description: "Registro de accesos y deliveries en la entrada del edificio.",
    icon: "access",
    accent: "var(--color-green)",
    tileBackground: "var(--color-green-light)",
    available: true,
    to: "/recepcion",
  },
];

export const RoleSelectorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);

  // Cada rol ve solo su perfil: un RESIDENT nunca ve Administración.
  const visibleProfiles = PROFILES.filter((profile) =>
    canAccessProfile(profile.key, user?.role),
  );

  const handleEnter = () => {
    if (selected?.to) {
      navigate(selected.to);
    }
  };

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
        {visibleProfiles.map((profile) => (
          <button
            key={profile.key}
            type="button"
            className="ct-role-card"
            onClick={() => setSelected(profile)}
          >
            <div className="ct-icon-tile-lg d-flex align-items-center justify-content-center mb-3" style={{ background: profile.tileBackground }}>
              <Icon name={profile.icon} size={22} style={{ color: profile.accent }} />
            </div>
            <p className="fw-semibold mb-1" style={{ color: "var(--color-ink)" }}>{profile.title}</p>
            <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
              {profile.description}
            </p>
            <div className="d-flex align-items-center gap-2 mt-3" style={{ fontSize: "0.75rem", fontWeight: 500, color: profile.accent }}>
              Ingresar <Icon name="chevron" size={13} />
            </div>
          </button>
        ))}
        {visibleProfiles.length === 0 && (
          <p className="ct-text-muted text-center mb-0" style={{ fontSize: "0.875rem", maxWidth: "28rem" }}>
            Tu usuario no tiene un perfil asignado todavía. Pedí a tu
            administrador que te asigne un rol y un edificio.
          </p>
        )}
      </div>

      <p className="ct-font-mono ct-text-faint mb-0" style={{ fontSize: "0.6875rem" }}>Torre Madero · Buenos Aires</p>

      <RoleInfoModal
        profile={selected}
        show={!!selected}
        onHide={() => setSelected(null)}
        onEnter={handleEnter}
      />
    </div>
  );
};
