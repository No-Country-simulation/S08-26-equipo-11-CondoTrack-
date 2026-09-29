import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { ROLES } from "@/modules/auth/constants/roles";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useUsers } from "@/modules/users/context/UsersContext";
import { listUnits } from "@/modules/units/services/unitsService";
import { apiErrorMessage } from "@/core/api/api";

const ASSIGNABLE_ROLES = [
  ROLES.ADMIN,
  ROLES.RECEPTION,
  ROLES.MAINTENANCE,
  ROLES.RESIDENT,
];

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "BLOCKED"];

export const AssignRoleModal = ({ user, show, onHide, onAssigned }) => {
  const { buildings } = useBuildings();
  const { grantRole, revokeRole, setUserStatus } = useUsers();
  const { user: actor } = useAuth();
  const [form, setForm] = useState({ role: "", buildingId: "", unitId: "" });
  const [units, setUnits] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  // Jerarquía del backend: solo SUPER_ADMIN gestiona todo. Un ADMIN no puede
  // gestionarse a sí mismo, ni tocar roles ADMIN/SUPER_ADMIN, ni edificios
  // donde no es ADMIN. El backend lo refuerza; acá se deshabilita antes.
  const isSuper = actor?.role === ROLES.SUPER_ADMIN;
  const adminBuildings = (actor?.roles ?? [])
    .filter((entry) => entry.roleName === ROLES.ADMIN)
    .map((entry) => entry.buildingId);
  const isSelf = actor?.id === user?.id;
  const targetIsPrivileged = (user?.roles ?? []).some((entry) =>
    [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(entry.roleName),
  );
  const managedBuildings = isSuper
    ? buildings
    : buildings.filter((building) => adminBuildings.includes(building.id));
  const manageableRoles = isSuper
    ? ASSIGNABLE_ROLES
    : ASSIGNABLE_ROLES.filter((role) => role !== ROLES.ADMIN);
  const blocked = !isSuper && (isSelf || targetIsPrivileged);

  // El padre monta con key={user.id}: el formulario nace limpio en cada apertura.
  useEffect(() => {
    if (!form.buildingId) {
      return undefined;
    }

    let cancelled = false;
    listUnits(form.buildingId)
      .then(({ units: buildingUnits }) => {
        if (!cancelled) setUnits(buildingUnits);
      })
      .catch(() => {
        if (!cancelled) setUnits([]);
      });

    return () => {
      cancelled = true;
    };
  }, [form.buildingId]);

  if (!user) return null;

  const updateField = (field) => (event) => {
    setForm((prev) => {
      const next = { ...prev, [field]: event.target.value };
      if (field === "buildingId") next.unitId = "";
      if (field === "role" && event.target.value === ROLES.ADMIN)
        next.unitId = "";
      return next;
    });
    if (field === "buildingId") setUnits([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (blocked) {
      setError("No tenés permiso para gestionar a este usuario.");
      return;
    }

    if (!form.role || !form.buildingId) {
      setError("Elegí un rol y un edificio.");
      return;
    }

    setSaving(true);
    try {
      const unit = units.find((item) => item.id === form.unitId) ?? null;
      const updated = await grantRole({
        userId: user.id,
        role: form.role,
        buildingId: form.buildingId,
        unit,
      });
      onAssigned?.(updated);
      onHide();
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo asignar el rol."));
    } finally {
      setSaving(false);
    }
  };

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

  const handleRemoveRole = async (roleName, buildingId) => {
    setError("");

    if (blocked) {
      setError("No tenés permiso para gestionar a este usuario.");
      return;
    }

    setSaving(true);
    try {
      const updated = await revokeRole({
        userId: user.id,
        role: roleName,
        buildingId,
      });
      onAssigned?.(updated);
      onHide();
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo quitar el rol."));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (event) => {
    const status = event.target.value;
    if (!status || status === user.status) return;
    setError("");

    if (blocked) {
      setError("No tenés permiso para gestionar a este usuario.");
      return;
    }

    setStatusSaving(true);
    try {
      const updated = await setUserStatus({ userId: user.id, status });
      onAssigned?.(updated);
      onHide();
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo cambiar el estado."));
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>
          Asignar rol — {fullName}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="py-2 small mb-3">
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label
              className="ct-font-mono ct-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              Rol
            </Form.Label>
            <Form.Select
              value={form.role}
              onChange={updateField("role")}
              required
            >
              <option value="">Seleccioná un rol</option>
              {manageableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label
              className="ct-font-mono ct-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              Edificio
            </Form.Label>
            <Form.Select
              value={form.buildingId}
              onChange={updateField("buildingId")}
              required
            >
              <option value="">Seleccioná un edificio</option>
              {managedBuildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {form.role && form.role !== ROLES.ADMIN && (
            <Form.Group className="mb-3">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Unidad (opcional)
              </Form.Label>
              <Form.Select
                value={form.unitId}
                onChange={updateField("unitId")}
                disabled={units.length === 0}
              >
                <option value="">Sin unidad específica</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.code} · Piso {unit.floor}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <div className="mb-0">
            <p
              className="ct-font-mono ct-text-muted mb-1"
              style={{ fontSize: "0.75rem" }}
            >
              Roles actuales
            </p>
            {user.roles.length === 0 && (
              <p className="ct-text-faint mb-0" style={{ fontSize: "0.8125rem" }}>
                Sin rol asignado.
              </p>
            )}
            <ul className="mb-0 ps-3" style={{ fontSize: "0.8125rem" }}>
              {user.roles.map((role, index) => (
                <li
                  key={`${role.roleName}-${role.buildingId ?? "global"}-${index}`}
                  className="ct-text-muted d-flex align-items-center justify-content-between gap-2"
                >
                  <span>
                    {role.roleName}
                    {role.unitCode ? ` · Unidad ${role.unitCode}` : ""}
                  </span>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-danger"
                    disabled={saving || blocked}
                    onClick={() =>
                      handleRemoveRole(role.roleName, role.buildingId)
                    }
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3">
            <p
              className="ct-font-mono ct-text-muted mb-1"
              style={{ fontSize: "0.75rem" }}
            >
              Estado de la cuenta
            </p>
            <Form.Select
              value={user.status}
              onChange={handleStatusChange}
              disabled={statusSaving || blocked}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Form.Select>
            {blocked && (
              <p className="ct-text-muted mt-2 mb-0" style={{ fontSize: "0.75rem" }}>
                Solo un SUPER_ADMIN puede gestionar a este usuario.
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onHide}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            style={{
              background: "var(--color-accent)",
              borderColor: "var(--color-accent)",
            }}
          >
            {saving ? "Guardando..." : "Asignar"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

AssignRoleModal.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        roleName: PropTypes.string.isRequired,
        buildingId: PropTypes.string,
        unitId: PropTypes.string,
        unitCode: PropTypes.string,
      }),
    ).isRequired,
  }),
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onAssigned: PropTypes.func,
};
