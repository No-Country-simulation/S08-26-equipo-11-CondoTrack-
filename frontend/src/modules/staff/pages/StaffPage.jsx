import { useNavigate, useOutletContext } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { canManageBuildingResources } from "@/modules/auth/constants/roles";
import { useStaffByRole } from "@/modules/staff/hooks/useStaffByRole";
import { StatusBadge } from "@/shared/components/StatusBadge";
import Loading from "@/shared/components/Loading";

/**
 * Personal del edificio.
 *
 * El personal es un usuario con rol operativo (recepción, mantenimiento o
 * administración), no una entidad propia: por eso se lee de `/users`. El
 * alta y la baja de personal viven en /dashboard/usuarios, que es donde se
 * gestionan los roles.
 */
export const StaffPage = () => {
  const navigate = useNavigate();
  const { building } = useOutletContext();
  const { user } = useAuth();
  const { staff, isLoading, error } = useStaffByRole(building?.id);

  const canManage = canManageBuildingResources(user?.role);

  return (
    <div className="ct-main-scroll">
      {canManage && (
        <div className="d-flex justify-content-end mb-4">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => navigate("/dashboard/usuarios")}
          >
            <Icon name="plus" size={14} />
            Gestionar usuarios y roles
          </button>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="py-2 small mb-3">
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Loading />
      ) : (
        <div className="ct-card overflow-hidden">
          <table className="ct-table mb-0">
            <thead>
              <tr>
                {["Nombre", "Rol", "Unidad", "Estado", "Contacto"].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td className="fw-medium" style={{ color: "var(--color-ink)" }}>
                    {member.name}
                  </td>
                  <td className="ct-text-muted">
                    {member.roleLabel}
                    {member.roles.length > 1 && (
                      <span className="ct-text-faint ms-1" style={{ fontSize: "0.75rem" }}>
                        +{member.roles.length - 1}
                      </span>
                    )}
                  </td>
                  <td className="ct-text-muted">
                    {member.roles.find((role) => role.unitCode)?.unitCode ?? "—"}
                  </td>
                  <td>
                    <StatusBadge
                      status={
                        member.status === "ACTIVE"
                          ? "active"
                          : member.status === "BLOCKED"
                            ? "blocked"
                            : "inactive"
                      }
                    />
                  </td>
                  <td
                    className="ct-font-mono ct-text-muted"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {member.phone} · {member.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && (
            <div className="text-center py-5 ct-text-muted">
              Todavía no hay personal asignado a este edificio.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
