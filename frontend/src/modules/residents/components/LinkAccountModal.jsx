import { useEffect, useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { useResidentsStore } from "@/modules/residents/context/ResidentsContext";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { listUnits } from "@/modules/units/services/unitsService";

const emptyForm = (buildingId = "") => ({
  name: "",
  buildingId,
  unit: "",
  email: "",
});

// Vincula una CUENTA YA EXISTENTE (ej. login con Google) como residente:
// el backend solo pide el email y la unidad donde vive.
export const LinkAccountModal = ({
  show,
  onHide,
  onLinked,
  defaultBuildingId,
}) => {
  const { addResident } = useResidentsStore();
  const { buildings, getBuildingById } = useBuildings();
  const [form, setForm] = useState(emptyForm(defaultBuildingId ?? ""));
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (field) => (event) => {
    setForm((prev) => {
      const next = { ...prev, [field]: event.target.value };
      // Al cambiar de edificio se resetea la unidad elegida.
      if (field === "buildingId") next.unit = "";
      return next;
    });
    if (field === "buildingId") setUnits([]);
  };

  // Unidades del edificio para elegir en vez de escribir el código.
  useEffect(() => {
    if (!show || !form.buildingId) {
      return undefined;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga de unidades al elegir edificio
    setUnitsLoading(true);

    listUnits(form.buildingId)
      .then(({ units: buildingUnits }) => {
        if (!cancelled) setUnits(buildingUnits);
      })
      .catch(() => {
        if (!cancelled) setUnits([]);
      })
      .finally(() => {
        if (!cancelled) setUnitsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [show, form.buildingId]);

  const handleClose = () => {
    setForm(emptyForm(defaultBuildingId ?? ""));
    setError("");
    onHide();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.unit.trim()) {
      setError("Elegí una unidad.");
      return;
    }

    const buildingId = form.buildingId || "";
    setSaving(true);
    try {
      const result = await addResident({
        ...form,
        buildingId,
        buildingName: buildingId ? getBuildingById(buildingId).name : "",
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setForm(emptyForm(defaultBuildingId ?? ""));
      onLinked?.({ buildingId });
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>
          Vincular cuenta existente
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          <p className="ct-text-muted mb-3" style={{ fontSize: "0.8125rem" }}>
            Para cuentas ya creadas (ej. con Google). Si la cuenta no existe,
            usá “Nuevo residente”.
          </p>

          <Form.Group className="mb-3">
            <Form.Label
              className="ct-font-mono ct-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              Nombre completo
            </Form.Label>
            <Form.Control
              placeholder="Ej. Valentina Rodríguez"
              value={form.name}
              onChange={updateField("name")}
              required
            />
          </Form.Group>

          <div className="row g-3 mb-3">
            <div className="col-7">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Edificio
              </Form.Label>
              <Form.Select
                value={form.buildingId}
                onChange={updateField("buildingId")}
                disabled={!!defaultBuildingId}
                required
              >
                <option value="">Seleccionar…</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </Form.Select>
            </div>
            <div className="col-5">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Unidad
              </Form.Label>
              <Form.Select
                value={form.unit}
                onChange={updateField("unit")}
                disabled={!form.buildingId || unitsLoading}
                required
              >
                <option value="">
                  {!form.buildingId
                    ? "Primero elegí un edificio"
                    : unitsLoading
                      ? "Cargando..."
                      : "Seleccioná una unidad"}
                </option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.code}>
                    {unit.code} · Piso {unit.floor}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label
              className="ct-font-mono ct-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              Email de la cuenta
            </Form.Label>
            <Form.Control
              type="email"
              placeholder="residente@correo.com"
              value={form.email}
              onChange={updateField("email")}
              required
            />
          </Form.Group>

          {error && (
            <Alert variant="danger" className="py-2 small mb-0">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleClose}
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
            {saving ? "Vinculando..." : "Vincular"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

LinkAccountModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onLinked: PropTypes.func,
  defaultBuildingId: PropTypes.string,
};
