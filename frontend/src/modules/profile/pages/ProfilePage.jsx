import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { isProfileComplete } from "@/modules/auth/services/authService";
import { ROLES } from "@/modules/auth/constants/roles";

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super administrador",
  [ROLES.ADMIN]: "Administrador",
  [ROLES.RECEPTION]: "Recepción / Portería",
  [ROLES.MAINTENANCE]: "Mantenimiento",
  [ROLES.RESIDENT]: "Residente",
};

const value = (input) => {
  const text = String(input ?? "").trim();
  return text.length > 0 ? text : "—";
};

export const ProfilePage = () => {
  const { user, logout, refreshSession } = useAuth();

  const nombre = value(user?.nombre);
  const apellido = value(user?.apellido);
  const nombreCompleto =
    [user?.nombre, user?.apellido].filter(Boolean).join(" ").trim() ||
    value(user?.email);

  const role = user?.role;
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const roleNames = [
    ...new Set(
      roles
        .map((entry) => (typeof entry === "string" ? entry : entry?.roleName))
        .filter(Boolean),
    ),
  ];

  const buildings = user?.buildings ?? [];
  const units = user?.units ?? [];
  const complete = isProfileComplete(user);

  return (
    <div className="ct-main-scroll">
      <div className="ct-card p-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="ct-avatar"
            style={{
              width: 56,
              height: 56,
              fontSize: "1.125rem",
              background: "var(--color-amber)",
            }}
          >
            {`${user?.nombre?.[0] ?? ""}${user?.apellido?.[0] ?? ""}`
              .toUpperCase()
              .slice(0, 2) || "?"}
          </div>
          <div className="min-w-0">
            <h2 className="ct-card-title mb-1" style={{ fontSize: "1.125rem" }}>
              {nombreCompleto}
            </h2>
            <p className="ct-text-muted mb-0" style={{ fontSize: "0.8125rem" }}>
              {value(user?.email)}
            </p>
          </div>
        </div>

        {!complete && (
          <Alert variant="warning" className="py-2 small mb-0 mt-3">
            Tu perfil está incompleto. Some datos personales para que la
            administración pueda contactarte.
          </Alert>
        )}
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="ct-card h-100">
            <div className="ct-card-header">
              <p
                className="ct-font-mono text-uppercase ct-text-muted mb-0"
                style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
              >
                Datos personales
              </p>
            </div>
            <div className="p-3">
              <dl className="mb-0">
                {[
                  ["Nombre", nombre],
                  ["Apellido", apellido],
                  ["Documento", user?.documento],
                  ["Tipo de documento", user?.tipoDocumento],
                  ["Teléfono", user?.telefono],
                  ["Email", user?.email],
                ].map(([label, content]) => (
                  <div
                    key={label}
                    className="d-flex justify-content-between gap-3 py-2"
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <dt className="ct-text-muted mb-0 fw-normal">{label}</dt>
                    <dd className="mb-0 text-end" style={{ color: "var(--color-ink)" }}>
                      {value(content)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="col-lg-6 d-flex flex-column gap-4">
          <div className="ct-card">
            <div className="ct-card-header">
              <p
                className="ct-font-mono text-uppercase ct-text-muted mb-0"
                style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
              >
                Rol y permisos
              </p>
            </div>
            <div className="p-3">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Icon name="person" size={15} className="ct-text-faint" />
                <span style={{ color: "var(--color-ink)" }}>
                  {ROLE_LABELS[role] ?? value(role)}
                </span>
              </div>
              {roleNames.length > 0 && (
                <div className="d-flex flex-wrap gap-2">
                  {roleNames.map((roleName) => (
                    <span
                      key={roleName}
                      className="ct-font-mono px-2 rounded"
                      style={{
                        fontSize: "0.6875rem",
                        background: "var(--color-accent-light)",
                        color: "var(--color-accent)",
                      }}
                    >
                      {ROLE_LABELS[roleName] ?? roleName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ct-card">
            <div className="ct-card-header">
              <p
                className="ct-font-mono text-uppercase ct-text-muted mb-0"
                style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
              >
                Asignaciones
              </p>
            </div>
            <div className="p-3">
              <p className="ct-font-mono ct-text-muted mb-2" style={{ fontSize: "0.6875rem" }}>
                Edificios ({buildings.length})
              </p>
              {buildings.length === 0 ? (
                <p className="ct-text-muted mb-3">Sin edificios asignados.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {buildings.map((building) => (
                    <span key={building.id} className="ct-badge ct-badge-accent">
                      {value(building.name)}
                    </span>
                  ))}
                </div>
              )}

              <p className="ct-font-mono ct-text-muted mb-2" style={{ fontSize: "0.6875rem" }}>
                Unidades ({units.length})
              </p>
              {units.length === 0 ? (
                <p className="ct-text-muted mb-0">Sin unidades asignadas.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {units.map((unit) => (
                    <span key={unit.id} className="ct-badge ct-badge-muted">
                      {value(unit.code)}
                      {unit.floor !== undefined && unit.floor !== null
                        ? ` · Piso ${unit.floor}`
                        : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ct-card p-3">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 fw-medium" style={{ color: "var(--color-ink)" }}>
                  Sesión
                </p>
                <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                  Los datos de tu sesión pueden estar desactualizados.
                </p>
              </div>
              <div className="d-flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                  onClick={() => refreshSession(true)}
                >
                  <Icon name="refresh" size={13} />
                  Actualizar
                </button>
                <button
                  type="button"
                  className="btn btn-sm text-white d-flex align-items-center gap-2"
                  style={{ background: "var(--color-accent)" }}
                  onClick={logout}
                >
                  <Icon name="logout" size={13} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
