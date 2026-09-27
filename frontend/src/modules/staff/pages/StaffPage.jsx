import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { canManageBuildingResources } from "@/modules/auth/constants/roles";
import { useStaff } from "@/modules/staff/context/StaffContext";
import { STAFF_ROLES } from "@/modules/staff/data/staff.data";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { CreateStaffModal } from "@/modules/staff/components/CreateStaffModal";

const ROLE_LABELS = {
  [STAFF_ROLES.RECEPTIONIST]: "Recepcionista / Portero",
  [STAFF_ROLES.MAINTENANCE]: "Mantenimiento",
};

export const StaffPage = () => {
  const { staff } = useStaff();
  const { getBuildingById } = useBuildings();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const canCreate = canManageBuildingResources(user?.role);

  return (
    <div className="ct-main-scroll">
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")} className="mb-4">
          {successMessage}
        </Alert>
      )}

      {canCreate && (
        <div className="d-flex justify-content-end mb-4">
          <button
            type="button"
            className="btn btn-sm text-white d-flex align-items-center gap-2"
            style={{ background: "var(--color-accent)" }}
            onClick={() => setShowCreate(true)}
          >
            <Icon name="plus" size={14} />
            Nuevo personal
          </button>
        </div>
      )}

      <div className="ct-card overflow-hidden">
        <table className="ct-table mb-0">
          <thead>
            <tr>
              {["Nombre", "Rol", "Tipo", "Edificio", "Contacto"].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td className="fw-medium" style={{ color: "var(--color-ink)" }}>{member.name}</td>
                <td className="ct-text-muted">{ROLE_LABELS[member.role]}</td>
                <td className="ct-text-muted">
                  {member.role === STAFF_ROLES.MAINTENANCE
                    ? member.staffType === "externo"
                      ? `Empresa externa${member.company ? ` · ${member.company}` : ""}`
                      : "Personal interno"
                    : "—"}
                </td>
                <td className="ct-text-muted">{getBuildingById(member.buildingId).name}</td>
                <td className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>
                  {member.phone} · {member.email}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && (
          <div className="text-center py-5 ct-text-muted">Todavía no hay personal registrado.</div>
        )}
      </div>

      <CreateStaffModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={() => setSuccessMessage("Personal registrado correctamente.")}
      />
    </div>
  );
};
