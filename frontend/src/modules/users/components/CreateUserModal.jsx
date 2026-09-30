import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { registerService } from "@/modules/auth/services/authService";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { listUnits } from "@/modules/units/services/unitsService";
import { linkResident } from "@/modules/residents/services/residentsService";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import { apiErrorMessage } from "@/core/api/api";
import { isValidEmail, normalizeEmail } from "@/shared/utils/validators";

const EMPTY_FORM = {
  nombre: "",
  apellido: "",
  tipoDocumento: "",
  documento: "",
  telefono: "",
  email: "",
  password: "",
  confirmPassword: "",
  buildingId: "",
  unitId: "",
};

export const CreateUserModal = ({ show, onHide, onCreated, defaultBuildingId }) => {
  const { buildings, loading: buildingsLoading } = useBuildings();
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();
  const emptyForm = () => ({
    ...EMPTY_FORM,
    buildingId: defaultBuildingId ?? "",
  });
  const [form, setForm] = useState(emptyForm);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => {
      const next = { ...prev, [field]: event.target.value };
      // Al cambiar de edificio se resetea la unidad elegida.
      if (field === "buildingId") {
        next.unitId = "";
        setUnits([]);
      }
      // Al elegir unidad el email queda bloqueado: se muestra normalizado
      // para que se vea exactamente la dirección con la que se vincula.
      if (field === "unitId" && event.target.value && next.email) {
        next.email = normalizeEmail(next.email);
      }
      return next;
    });
  };

  // Unidades del edificio elegido para vincular al usuario al crearlo.
  // Sin vínculo a unidad, el residente no aparece en las listas.
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
    setForm(emptyForm());
    setUnits([]);
    setFieldErrors({});
    setError("");
    onHide();
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
    if (!form.apellido.trim()) errors.apellido = "El apellido es obligatorio.";
    if (!form.tipoDocumento)
      errors.tipoDocumento = "El tipo de documento es obligatorio.";
    if (!form.documento.trim())
      errors.documento = "El documento es obligatorio.";
    if (!form.telefono.trim())
      errors.telefono = "El teléfono es obligatorio.";
    if (!form.email.trim()) errors.email = "El correo es obligatorio.";
    else if (!isValidEmail(form.email))
      errors.email = "El correo no tiene un formato válido.";
    if (form.password.length < 8)
      errors.password = "La contraseña debe tener al menos 8 caracteres.";
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Las contraseñas no coinciden.";
    if (!form.buildingId) errors.buildingId = "Elegí un edificio.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationErrors = validate();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const result = await registerService(form);
      // El backend puede normalizar el email (minúsculas, espacios). Para
      // vincular hay que usar el que devolvió el registro: mandar el tipeado
      // hacía que el POST /units/:id/residents respondiera 404 sin motivo claro.
      const createdEmail = normalizeEmail(
        result?.data?.user?.email ?? form.email,
      );
      let linkFailed = false;
      let message = `Usuario ${createdEmail} creado correctamente.`;

      // Vincula a la unidad para que aparezca en las listas del edificio.
      if (form.unitId) {
        try {
          await linkResident(
            { id: form.unitId, buildingId: form.buildingId },
            createdEmail,
          );
          message = `Usuario ${createdEmail} creado y vinculado a la unidad.`;
        } catch (linkError) {
          // La cuenta ya existe: se avisa y se deja el modal abierto para
          // reintentar el vínculo, en lugar de cerrarlo y perder el error.
          linkFailed = true;
          setError(
            `El usuario se creó, pero no se pudo vincular a la unidad: ${apiErrorMessage(linkError, "reintentá el vínculo desde Residentes.")}`,
          );
        }
      }

      logActivity({
        actor,
        action: `Registró al usuario "${createdEmail}"`,
        buildingId: form.buildingId,
        unitId: form.unitId || null,
        unitCode: units.find((unit) => unit.id === form.unitId)?.code ?? null,
        entityType: "unit",
        entityId: form.unitId || null,
        result: linkFailed ? "error" : "ok",
        detail: linkFailed ? message : null,
      });

      if (!linkFailed) {
        setForm(emptyForm());
        setUnits([]);
        setFieldErrors({});
        onCreated?.(message, { buildingId: form.buildingId });
        handleClose();
      }
    } catch (err) {
      // Muestra el motivo real del backend (ej. email/documento duplicado).
      setError(
        err?.response?.data?.message ??
          "No se pudo crear el usuario. Inténtalo nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.1rem" }}>
          Nuevo usuario
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate autoComplete="off">
        <Modal.Body>
          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Nombre
              </Form.Label>
              <Form.Control
                value={form.nombre}
                onChange={handleChange("nombre")}
                isInvalid={!!fieldErrors.nombre}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.nombre}
              </Form.Control.Feedback>
            </div>
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Apellido
              </Form.Label>
              <Form.Control
                value={form.apellido}
                onChange={handleChange("apellido")}
                isInvalid={!!fieldErrors.apellido}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.apellido}
              </Form.Control.Feedback>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Tipo de documento
              </Form.Label>
              <Form.Select
                value={form.tipoDocumento}
                onChange={handleChange("tipoDocumento")}
                isInvalid={!!fieldErrors.tipoDocumento}
                required
              >
                <option value="">Seleccioná</option>
                <option value="DNI">DNI</option>
                <option value="CUIL">CUIL</option>
                <option value="PASSPORT">Pasaporte</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.tipoDocumento}
              </Form.Control.Feedback>
            </div>
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Documento
              </Form.Label>
              <Form.Control
                inputMode="numeric"
                value={form.documento}
                onChange={handleChange("documento")}
                isInvalid={!!fieldErrors.documento}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.documento}
              </Form.Control.Feedback>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Teléfono
              </Form.Label>
              <Form.Control
                type="tel"
                value={form.telefono}
                onChange={handleChange("telefono")}
                isInvalid={!!fieldErrors.telefono}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.telefono}
              </Form.Control.Feedback>
            </div>
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Correo electrónico
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="usuario@correo.com"
                value={form.email}
                onChange={handleChange("email")}
                isInvalid={!!fieldErrors.email}
                // Con unidad elegida el email identifica la cuenta que se
                // vincula después, así que se muestra ya normalizado.
                disabled={!!form.unitId}
                required
              />
              {form.unitId && (
                <Form.Text className="ct-text-muted">
                  Se usará para vincular la cuenta a la unidad.
                </Form.Text>
              )}
              <Form.Control.Feedback type="invalid">
                {fieldErrors.email}
              </Form.Control.Feedback>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Contraseña
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange("password")}
                isInvalid={!!fieldErrors.password}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.password}
              </Form.Control.Feedback>
            </div>
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Confirmar
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="**********"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                isInvalid={!!fieldErrors.confirmPassword}
                required
              />
              <Form.Control.Feedback type="invalid">
                {fieldErrors.confirmPassword}
              </Form.Control.Feedback>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Edificio
              </Form.Label>
              <Form.Select
                value={form.buildingId}
                onChange={handleChange("buildingId")}
                isInvalid={!!fieldErrors.buildingId}
                required
                disabled={
                  !!defaultBuildingId ||
                  buildingsLoading ||
                  buildings.length === 0
                }
              >
                <option value="">
                  {buildingsLoading ? "Cargando..." : "Seleccioná un edificio"}
                </option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {fieldErrors.buildingId}
              </Form.Control.Feedback>
            </div>
            <div className="col-6">
              <Form.Label
                className="ct-font-mono ct-text-muted"
                style={{ fontSize: "0.75rem" }}
              >
                Unidad (opcional)
              </Form.Label>
              <Form.Select
                value={form.unitId}
                onChange={handleChange("unitId")}
                disabled={!form.buildingId || unitsLoading}
              >
                <option value="">
                  {!form.buildingId
                    ? "Primero elegí un edificio"
                    : unitsLoading
                      ? "Cargando..."
                      : "Sin vincular (solo cuenta)"}
                </option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.code} · Piso {unit.floor}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="ct-text-muted">
                Si la elegís, el residente aparece en las listas.
              </Form.Text>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            style={{
              background: "var(--color-accent)",
              borderColor: "var(--color-accent)",
            }}
          >
            {loading ? "Creando..." : "Crear usuario"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

CreateUserModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
  defaultBuildingId: PropTypes.string,
};
