import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Badge } from "react-bootstrap";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useUsers } from "@/modules/users/context/UsersContext";
import { AssignRoleModal } from "@/modules/users/components/AssignRoleModal";
import { apiErrorMessage } from "@/core/api/api";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export const UserDetailPage = () => {
  const { userId } = useParams();
  const { getBuildingById } = useBuildings();
  const { getUserDetail, refreshUsers } = useUsers();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadDetail = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      setDetail(await getUserDetail(userId));
    } catch (err) {
      setDetail(null);
      setError(apiErrorMessage(err, "No se pudo cargar el usuario."));
    } finally {
      setLoading(false);
    }
  }, [userId, getUserDetail]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial del detalle
    loadDetail();
  }, [loadDetail]);

  const handleAssigned = async () => {
    setShowAssign(false);
    setSuccessMessage("Roles actualizados correctamente.");
    await loadDetail();
    refreshUsers();
  };

  const fullName =
    `${detail?.firstName ?? ""} ${detail?.lastName ?? ""}`.trim() ||
    detail?.email ||
    "";

  const buildingNameOf = (buildingId) => {
    if (!buildingId) return "Global";
    return getBuildingById(buildingId).name;
  };

  if (loading) {
    return (
      <div className="ct-main-scroll">
        <p className="ct-text-muted">Cargando usuario...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="ct-main-scroll">
        <Link
          to="/dashboard/usuarios"
          className="ct-card-link"
          style={{ fontSize: "0.75rem" }}
        >
          ← Volver a usuarios
        </Link>
        <Alert variant="danger" className="mt-3">
          {error || "Usuario no encontrado."}
        </Alert>
      </div>
    );
  }

  return (
    <div className="ct-main-scroll">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <Link
            to="/dashboard/usuarios"
            className="ct-card-link"
            style={{ fontSize: "0.75rem" }}
          >
            ← Volver a usuarios
          </Link>
          <h2
            className="ct-font-display mb-0 mt-1"
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--color-ink)",
            }}
          >
            {fullName}
          </h2>
          <p className="ct-text-muted mb-0">{detail.email}</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <StatusBadge
            status={
              detail.status === "ACTIVE"
                ? "active"
                : detail.status === "BLOCKED"
                  ? "blocked"
                  : "inactive"
            }
          />
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowAssign(true)}
          >
            Asignar rol
          </button>
        </div>
      </div>

      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage("")}
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="ct-card p-3 h-100">
            <p
              className="ct-font-mono text-uppercase ct-text-muted mb-3"
              style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
            >
              Datos personales
            </p>
            {[
              { label: "Nombre", val: detail.firstName || "—" },
              { label: "Apellido", val: detail.lastName || "—" },
              {
                label: "Documento",
                val: detail.documentNumber
                  ? `${detail.documentType ?? "Doc."} ${detail.documentNumber}`
                  : "—",
              },
              { label: "Teléfono", val: detail.phone || "—" },
              { label: "Email", val: detail.email },
            ].map((row) => (
              <div
                key={row.label}
                className="d-flex justify-content-between gap-3 py-2"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <span className="ct-text-muted" style={{ fontSize: "0.875rem" }}>
                  {row.label}
                </span>
                <span
                  className="fw-medium text-end"
                  style={{ color: "var(--color-ink)", fontSize: "0.875rem" }}
                >
                  {row.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="ct-card p-3 h-100">
            <p
              className="ct-font-mono text-uppercase ct-text-muted mb-3"
              style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
            >
              Actividad
            </p>
            {[
              { label: "Miembro desde", val: formatDateTime(detail.createdAt) },
              {
                label: "Último ingreso",
                val: formatDateTime(detail.lastLoginAt),
              },
              {
                label: "Ingresos",
                val: detail.loginCount ?? "—",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="d-flex justify-content-between gap-3 py-2"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <span className="ct-text-muted" style={{ fontSize: "0.875rem" }}>
                  {row.label}
                </span>
                <span
                  className="fw-medium text-end"
                  style={{ color: "var(--color-ink)", fontSize: "0.875rem" }}
                >
                  {row.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ct-card overflow-hidden mt-4">
        <div className="ct-card-header">
          <h3 className="ct-card-title">
            Roles y edificios ({detail.roles.length})
          </h3>
        </div>
        {detail.roles.length === 0 ? (
          <div className="text-center py-4 ct-text-muted">
            Sin roles asignados.
          </div>
        ) : (
          <div>
            {detail.roles.map((role, index) => (
              <div
                key={`${role.roleName}-${role.buildingId ?? "global"}-${index}`}
                className="ct-row d-flex align-items-center gap-3"
              >
                <Badge
                  bg="light"
                  text="dark"
                  className="border flex-shrink-0"
                >
                  {role.roleName}
                </Badge>
                <p className="ct-text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                  {buildingNameOf(role.buildingId)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail.buildings.length > 0 && (
        <div className="ct-card overflow-hidden mt-4">
          <div className="ct-card-header">
            <h3 className="ct-card-title">Edificios vinculados</h3>
          </div>
          <div>
            {detail.buildings.map((building) => (
              <div
                key={building.id}
                className="ct-row d-flex align-items-center justify-content-between gap-3"
              >
                <div>
                  <p
                    className="mb-0 fw-medium"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {building.name}
                  </p>
                  {building.address && (
                    <p
                      className="ct-font-mono ct-text-muted mb-0"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {building.address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AssignRoleModal
        key={detail.id}
        user={{
          id: detail.id,
          firstName: detail.firstName,
          lastName: detail.lastName,
          email: detail.email,
          roles: detail.roles,
        }}
        show={showAssign}
        onHide={() => setShowAssign(false)}
        onAssigned={handleAssigned}
      />
    </div>
  );
};
