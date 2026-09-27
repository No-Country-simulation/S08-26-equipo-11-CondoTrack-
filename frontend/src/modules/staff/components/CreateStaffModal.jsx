import { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { useStaff } from "@/modules/staff/context/StaffContext";
import { STAFF_ROLES } from "@/modules/staff/data/staff.data";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";

const EMPTY_FORM = {
  name: "",
  role: STAFF_ROLES.RECEPTIONIST,
  buildingId: "",
  staffType: "interno",
  company: "",
  phone: "",
  email: "",
};

export const CreateStaffModal = ({ show, onHide, onCreated }) => {
  const { addStaff } = useStaff();
  const { buildings } = useBuildings();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError("");
    onHide();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = addStaff({ ...form, buildingId: Number(form.buildingId) });
    if (!result.success) {
      setError(result.error);
      return;
    }
    setForm(EMPTY_FORM);
    setError("");
    onCreated?.();
    onHide();
  };

  const isMaintenance = form.role === STAFF_ROLES.MAINTENANCE;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>Nuevo personal</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Rol</Form.Label>
              <Form.Select value={form.role} onChange={updateField("role")}>
                <option value={STAFF_ROLES.RECEPTIONIST}>Recepcionista / Portero</option>
                <option value={STAFF_ROLES.MAINTENANCE}>Mantenimiento</option>
              </Form.Select>
            </div>
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Edificio</Form.Label>
              <Form.Select value={form.buildingId} onChange={updateField("buildingId")}>
                <option value="">Seleccionar…</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>{building.name}</option>
                ))}
              </Form.Select>
            </div>
          </div>

          {isMaintenance && (
            <div className="row g-3 mb-3">
              <div className="col-5">
                <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Tipo</Form.Label>
                <Form.Select value={form.staffType} onChange={updateField("staffType")}>
                  <option value="interno">Personal interno</option>
                  <option value="externo">Empresa externa</option>
                </Form.Select>
              </div>
              {form.staffType === "externo" && (
                <div className="col-7">
                  <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Nombre de la empresa</Form.Label>
                  <Form.Control placeholder="Ej. FríoTec SA" value={form.company} onChange={updateField("company")} />
                </div>
              )}
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>
              {isMaintenance && form.staffType === "externo" ? "Contacto / responsable" : "Nombre completo"}
            </Form.Label>
            <Form.Control
              placeholder={isMaintenance && form.staffType === "externo" ? "Ej. Juan Pérez" : "Ej. Jorge Medina"}
              value={form.name}
              onChange={updateField("name")}
            />
          </Form.Group>

          <div className="row g-3">
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Teléfono (opcional)</Form.Label>
              <Form.Control placeholder="+54 11 ..." value={form.phone} onChange={updateField("phone")} />
            </div>
            <div className="col-6">
              <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>Email (opcional)</Form.Label>
              <Form.Control type="email" placeholder="contacto@correo.com" value={form.email} onChange={updateField("email")} />
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="py-2 small mt-3 mb-0">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" style={{ background: "var(--color-accent)", borderColor: "var(--color-accent)" }}>
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

CreateStaffModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
};
