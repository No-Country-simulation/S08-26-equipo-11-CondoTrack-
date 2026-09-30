import { useEffect, useMemo, useState } from "react";
import { Modal, Form, Button, Alert, InputGroup } from "react-bootstrap";
import PropTypes from "prop-types";
import { useResidentsStore } from "@/modules/residents/context/ResidentsContext";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { listUnits } from "@/modules/units/services/unitsService";
import { listUsers } from "@/modules/users/services/usersService";
import { normalizeEmail } from "@/shared/utils/validators";

const PAGE_LIMIT = 100;

const emptyForm = (buildingId = "") => ({
  buildingId,
  userId: "",
  unitId: "",
});

// Vincula una CUENTA YA EXISTENTE (ej. login con Google) como residente.
// El backend solo necesita el email de la cuenta y la unidad donde vive,
// así que en vez de escribir nombre y email a mano se elige de la lista de
// cuentas del edificio: el email nunca se tipea y no puede quedar mal escrito.
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
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState("");
  const [term, setTerm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setForm(emptyForm(defaultBuildingId ?? ""));
    setTerm("");
    setAccounts([]);
    setAccountsError("");
    setError("");
  };

  const updateField = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Cambiar de edificio o de cuenta reinicia la unidad elegida.
      if (field === "buildingId" || field === "userId") next.unitId = "";
      return next;
    });
    if (field === "buildingId") {
      setAccounts([]);
      setTerm("");
    }
  };

  // Cuentas del edificio, para elegir a quién vincular.
  useEffect(() => {
    if (!show || !form.buildingId) {
      return undefined;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga de cuentas al elegir edificio
    setAccountsLoading(true);
    setAccountsError("");

    listUsers({ buildingId: form.buildingId, limit: PAGE_LIMIT })
      .then(({ users }) => {
        if (cancelled) return;
        // Sin email no hay forma de vincular: el backend lo exige.
        setAccounts(users.filter((user) => user.email));
      })
      .catch(() => {
        if (cancelled) return;
        setAccounts([]);
        setAccountsError("No se pudieron cargar las cuentas del edificio.");
      })
      .finally(() => {
        if (!cancelled) setAccountsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [show, form.buildingId]);

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

  // El backend no recibe `search`, así que el filtro es de pantalla.
  const visibleAccounts = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return accounts;

    return accounts.filter((user) => {
      const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
      return name.includes(needle) || user.email.toLowerCase().includes(needle);
    });
  }, [accounts, term]);

  const selectedAccount = accounts.find((user) => user.id === form.userId);
  const selectedUnit = units.find((unit) => unit.id === form.unitId);

  const handleClose = () => {
    reset();
    onHide();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const buildingId = form.buildingId || "";
    const email = normalizeEmail(selectedAccount?.email);

    if (!email) {
      setError("Elegí la cuenta a vincular.");
      return;
    }
    if (!form.unitId) {
      setError("Elegí una unidad.");
      return;
    }

    setSaving(true);
    try {
      const result = await addResident({
        buildingId,
        buildingName: getBuildingById(buildingId)?.name ?? "",
        unitId: form.unitId,
        unitCode: selectedUnit?.code ?? "",
        email,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

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
            Elegí la cuenta ya creada y la unidad donde vive. Si la cuenta no
            existe, usá “Nuevo usuario”.
          </p>

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
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label
              className="ct-font-mono ct-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              Cuenta
            </Form.Label>
            {!form.buildingId ? (
              <Form.Control disabled value="Primero elegí un edificio" readOnly />
            ) : (
              <>
                <InputGroup className="mb-2">
                  <Form.Control
                    placeholder="Buscar por nombre o email"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    disabled={accountsLoading}
                  />
                  <InputGroup.Text className="ct-font-mono ct-text-muted">
                    {visibleAccounts.length}
                  </InputGroup.Text>
                </InputGroup>

                {accountsError && (
                  <Alert variant="warning" className="py-2 small">
                    {accountsError}
                  </Alert>
                )}

                {accountsLoading ? (
                  <Form.Control disabled value="Cargando cuentas..." readOnly />
                ) : (
                  <Form.Select
                    value={form.userId}
                    onChange={updateField("userId")}
                    size={6}
                    required
                    disabled={!accounts.length}
                  >
                    <option value="">
                      {accounts.length
                        ? "Seleccioná una cuenta"
                        : "Este edificio no tiene cuentas cargadas"}
                    </option>
                    {visibleAccounts.map((user) => (
                      <option key={user.id} value={user.id}>
                        {`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                          "Sin nombre"}{" "}
                        · {user.email}
                      </option>
                    ))}
                  </Form.Select>
                )}

                {term && !accountsLoading && !visibleAccounts.length && (
                  <Form.Text className="ct-text-muted">
                    Ninguna cuenta coincide con “{term.trim()}”.
                  </Form.Text>
                )}
              </>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label
              className="ct-font-mono ct-text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              Unidad
            </Form.Label>
            <Form.Select
              value={form.unitId}
              onChange={updateField("unitId")}
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
                <option key={unit.id} value={unit.id}>
                  {unit.code} · Piso {unit.floor}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <p
            className="ct-text-muted mb-0"
            style={{ fontSize: "0.75rem", lineHeight: 1.5 }}
          >
            {selectedAccount && selectedUnit ? (
              <>
                Se vinculará{" "}
                <strong>
                  {(selectedAccount.firstName ?? "") +
                    " " +
                    (selectedAccount.lastName ?? "")}
                </strong>{" "}
                ({selectedAccount.email}) a la unidad {selectedUnit.code}.
              </>
            ) : (
              "Elegí una cuenta y una unidad para ver el detalle del vínculo."
            )}
          </p>

          {error && (
            <Alert variant="danger" className="py-2 small mb-0 mt-3">
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
            disabled={saving || !selectedAccount || !form.unitId}
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
