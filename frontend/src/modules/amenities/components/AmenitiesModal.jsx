import { useEffect, useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { canManageBuildingResources } from "@/modules/auth/constants/roles";
import {
  createCommonArea,
  listCommonAreas,
} from "@/modules/amenities/services/commonAreasService";
import { apiErrorMessage } from "@/core/api/api";

const EMPTY_FORM = { name: "", capacity: "", description: "" };

export const AmenitiesModal = ({ building, show, onHide }) => {
  const { user } = useAuth();
  const canCreate = canManageBuildingResources(user?.role) && !!building?.id;
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show || !building?.id) {
      return undefined;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- recarga espacios al abrir/cambiar edificio
    setLoading(true);
    setLoadError("");

    listCommonAreas(building.id)
      .then((items) => {
        if (!cancelled) setAreas(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setAreas([]);
          setLoadError(
            apiErrorMessage(err, "No se pudieron cargar los espacios."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [show, building?.id]);

  if (!building) return null;

  const updateField = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.capacity || Number(form.capacity) <= 0) {
      setError("Ingresá nombre y una capacidad válida.");
      return;
    }

    setSaving(true);
    try {
      const created = await createCommonArea(building.id, form);
      setAreas((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setError("");
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo crear el espacio."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>
          Amenidades - {building.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          {loading && (
            <p className="ct-text-muted mb-0">Cargando espacios...</p>
          )}
          {!loading && loadError && (
            <Alert variant="danger" className="py-2 small mb-0">
              {loadError}
            </Alert>
          )}
          {!loading && !loadError && areas.length === 0 && (
            <p className="ct-text-muted mb-0">
              Todavía no hay amenidades cargadas.
            </p>
          )}
          {!loading &&
            !loadError &&
            areas.map((amenity) => (
              <div
                key={amenity.id}
                className="ct-row ct-row-hover d-flex align-items-center justify-content-between"
              >
                <div>
                  <p
                    className="mb-0 fw-medium"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {amenity.name}
                  </p>
                  <p
                    className="ct-font-mono ct-text-muted mb-0"
                    style={{ fontSize: "0.75rem" }}
                  >
                    Capacidad: {amenity.capacity ?? "-"}
                    {amenity.description ? ` · ${amenity.description}` : ""}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {canCreate && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Nombre del espacio
              </Form.Label>
              <Form.Control
                placeholder="Ej. Gimnasio"
                value={form.name}
                onChange={updateField("name")}
                required
              />
            </Form.Group>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Capacidad
                </Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  step={1}
                  value={form.capacity}
                  onChange={updateField("capacity")}
                  required
                />
              </div>
              <div className="col-6">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Descripción (opcional)
                </Form.Label>
                <Form.Control
                  placeholder="Ej. Planta baja"
                  value={form.description}
                  onChange={updateField("description")}
                />
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="py-2 small mb-3">
                {error}
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onHide}
                disabled={saving}
              >
                Cerrar
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
                {saving ? "Guardando..." : "Agregar espacio"}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

AmenitiesModal.propTypes = {
  building: PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }),
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};
