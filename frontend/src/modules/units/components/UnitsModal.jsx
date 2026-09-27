import { useState } from "react";
import { Modal, Form, Button, Badge, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { useUnits } from "@/modules/units/context/UnitsContext";

export const UnitsModal = ({ building, show, onHide }) => {
  const { forBuilding, addUnit } = useUnits();
  const [input, setInput] = useState("");
  const [errors, setErrors] = useState([]);

  if (!building) return null;

  const units = forBuilding(building.id);

  const handleSubmit = (event) => {
    event.preventDefault();

    const labels = input
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean);

    if (labels.length === 0) {
      setErrors(["Ingresá al menos un identificador de unidad."]);
      return;
    }

    const failedMessages = [];
    labels.forEach((label) => {
      const result = addUnit(building.id, label);
      if (!result.success) failedMessages.push(result.error);
    });

    setErrors(failedMessages);
    if (failedMessages.length === 0) setInput("");
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>Unidades — {building.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-wrap gap-2 mb-4">
          {units.length === 0 && <span className="ct-text-muted">Todavía no hay unidades cargadas.</span>}
          {units.map((unit) => (
            <Badge key={unit.id} bg="light" text="dark" className="border px-2 py-2">
              {unit.label}
            </Badge>
          ))}
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>
              Numeración de unidades
            </Form.Label>
            <Form.Control
              placeholder="Ej. 1°A, 1°B, 2°A"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              isInvalid={errors.length > 0}
            />
            <Form.Text className="ct-text-muted">
              Podés cargar varias separadas por coma.
            </Form.Text>
          </Form.Group>

          {errors.length > 0 && (
            <Alert variant="danger" className="py-2 small mb-3">
              {errors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" size="sm" onClick={onHide}>
              Cerrar
            </Button>
            <Button type="submit" size="sm" style={{ background: "var(--color-accent)", borderColor: "var(--color-accent)" }}>
              Agregar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

UnitsModal.propTypes = {
  building: PropTypes.shape({ id: PropTypes.number, name: PropTypes.string }),
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};
