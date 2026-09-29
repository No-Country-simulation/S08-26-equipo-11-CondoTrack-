import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { ROLES } from "@/modules/auth/constants/roles";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useUsers } from "@/modules/users/context/UsersContext";
import { AssignRoleModal } from "@/modules/users/components/AssignRoleModal";

const ROLE_OPTIONS = ["", ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.RECEPTION, ROLES.MAINTENANCE, ROLES.RESIDENT];

const fullNameOf = (user) =>
  `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

const initialsOf = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

export const UsuariosPage = () => {
  const {
    users,
    total,
    loading,
    error,
    filters,
    updateFilters,
    refreshUsers,
  } = useUsers();
  const { buildings, getBuildingById } = useBuildings();
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const buildingNameOf = (buildingId) => {
    if (!buildingId) return "—";
    const found = buildings.find((building) => building.id === buildingId);
    return found?.name ?? getBuildingById(buildingId).name;
  };

  return (
    <div className="ct-main-scroll">
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

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}{" "}
          <button
            type="button"
            className="btn btn-link btn-sm p-0 align-baseline"
            onClick={() => refreshUsers()}
          >
            Reintentar
          </button>
        </Alert>
      )}

      <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
        <div className="ct-search-box">
          <Icon name="search" size={15} className="ct-text-faint" />
          <input
            placeholder="Buscar por nombre o email…"
            value={filters.search}
            onChange={(event) =>
              updateFilters({ search: event.target.value })
            }
          />
        </div>
        <select
          aria-label="Filtrar por rol"
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={filters.role}
          onChange={(event) => updateFilters({ role: event.target.value })}
        >
          <option value="">Todos los roles</option>
          {ROLE_OPTIONS.filter(Boolean).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por edificio"
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={filters.buildingId}
          onChange={(event) =>
            updateFilters({ buildingId: event.target.value })
          }
        >
          <option value="">Todos los edificios</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>
        <Link
          to="/dashboard/usuarios/nuevo"
          className="btn btn-sm text-white d-flex align-items-center gap-2 ms-auto"
          style={{ background: "var(--color-accent)" }}
        >
          <Icon name="plus" size={14} />
          Nuevo usuario
        </Link>
      </div>

      <p className="ct-font-mono ct-text-muted mb-3" style={{ fontSize: "0.75rem" }}>
        {loading ? "Cargando..." : `${total} usuario(s)`}
      </p>

      <div className="ct-card overflow-hidden">
        <table className="ct-table mb-0">
          <thead>
            <tr>
              {["Usuario", "Roles", "Edificios", "Estado", ""].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="ct-avatar"
                      style={{ width: 28, height: 28, fontSize: "0.75rem" }}
                    >
                      {initialsOf(fullNameOf(user))}
                    </div>
                    <div>
                      <p
                        className="mb-0 fw-medium"
                        style={{ color: "var(--color-ink)" }}
                      >
                        {fullNameOf(user)}
                      </p>
                      <p
                        className="ct-font-mono ct-text-muted mb-0"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {user.roles.length === 0 && (
                      <span className="ct-text-faint" style={{ fontSize: "0.75rem" }}>
                        Sin rol
                      </span>
                    )}
                    {user.roles.map((role, index) => (
                      <Badge
                        key={`${role.roleName}-${role.buildingId ?? "global"}-${index}`}
                        bg="light"
                        text="dark"
                        className="border"
                      >
                        {role.roleName}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="ct-text-muted" style={{ fontSize: "0.8125rem" }}>
                  {user.roles.length === 0
                    ? "—"
                    : [
                        ...new Set(
                          user.roles.map((role) =>
                            buildingNameOf(role.buildingId),
                          ),
                        ),
                      ].join(", ")}
                </td>
                <td>
                  <StatusBadge
                    status={user.status === "ACTIVE" ? "active" : "inactive"}
                  />
                </td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setSelectedUser(user)}
                  >
                    Asignar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && users.length === 0 && (
          <div className="text-center py-5 ct-text-muted">
            Sin usuarios para los filtros elegidos.
          </div>
        )}
      </div>

      <AssignRoleModal
        key={selectedUser?.id ?? "none"}
        user={selectedUser}
        show={!!selectedUser}
        onHide={() => setSelectedUser(null)}
        onAssigned={(updated) =>
          setSuccessMessage(
            `Roles actualizados para ${updated.email}.`,
          )
        }
      />
    </div>
  );
};
