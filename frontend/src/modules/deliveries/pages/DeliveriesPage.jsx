import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Alert, Button, Form } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { canHandleDeliveries } from "@/modules/auth/constants/roles";
import { useDeliveries } from "@/modules/deliveries/hooks/useDeliveries";
import { listUnits } from "@/modules/units/services/unitsService";
import { listUnitResidents } from "@/modules/residents/services/residentsService";
import {
  CARRIERS,
  DELIVERY_STATUSES,
} from "@/modules/deliveries/services/deliveriesService";
import { apiErrorMessage } from "@/core/api/api";

const EMPTY_FORM = {
  unitId: "",
  personId: "",
  carrier: "Mercado Libre",
  trackingNumber: "",
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("es-AR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const codeOfUnit = (units, unitId) =>
  units.find((unit) => unit.id === unitId)?.code ?? "";

export const DeliveriesPage = () => {
  // En /dashboard viene del layout; en /recepcion, del primer edificio propio.
  const outlet = useOutletContext();
  const { user } = useAuth();
  const building = outlet?.building ?? user?.buildings?.[0] ?? null;
  const buildingId = building?.id ?? null;

  const { forBuilding, registerDelivery, markPickedUp, isLoading, getError } =
    useDeliveries();
  // La portería también registra los paquetes que llegan: el backend acepta
  // RECEPTION en create/deliver (canHandle), antes la UI se lo negaba.
  const canRegister = canHandleDeliveries(user?.role) && !!buildingId;

  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [units, setUnits] = useState([]);
  const [unitsTotal, setUnitsTotal] = useState(0);
  const [unitsError, setUnitsError] = useState("");
  const [unitResidents, setUnitResidents] = useState([]);
  const [residentsError, setResidentsError] = useState("");
  const [personMap, setPersonMap] = useState({});
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const fetchedUnitsRef = useRef(new Set());

  const deliveries = useMemo(
    () =>
      forBuilding(buildingId).filter(
        (d) => !statusFilter || d.status === statusFilter,
      ),
    [forBuilding, buildingId, statusFilter],
  );
  const loading = isLoading(buildingId);
  const loadError = getError(buildingId);

  // Unidades del edificio (para códigos y para el formulario).
  // El error ya no se traga: un select vacío por un 403 es indistinguible de
  // un edificio sin unidades, y hacía falta adivinar por qué el portero no
  // veía la lista.
  useEffect(() => {
    if (!buildingId || !canRegister) return undefined;
    let cancelled = false;
    listUnits(buildingId)
      .then(({ units: buildingUnits, total }) => {
        if (cancelled) return;
        setUnits(buildingUnits);
        // El backend capped en 100 por request: si el edificio tiene más, el
        // select mostraría una lista parcial haciéndose pasar por completa.
        setUnitsTotal(typeof total === "number" ? total : buildingUnits.length);
        setUnitsError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setUnits([]);
        setUnitsTotal(0);
        setUnitsError(
          apiErrorMessage(err, "No se pudieron cargar las unidades."),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [buildingId, canRegister]);

  // Residentes de la unidad elegida en el formulario.
  // El contrato de GET /units/:id/residents es ADMIN/SUPER_ADMIN, así que un
  // RECEPTION recibe 403. Antes el catch lo silenciaba y el select de
  // destinatario quedaba vacío sin explicar por qué.
  useEffect(() => {
    if (!form.unitId) {
      return undefined;
    }
    let cancelled = false;
    const unit = units.find((item) => item.id === form.unitId);
    listUnitResidents(unit ?? { id: form.unitId })
      .then((rows) => {
        if (cancelled) return;
        setUnitResidents(rows);
        setResidentsError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setUnitResidents([]);
        setResidentsError(
          apiErrorMessage(err, "No se pudieron cargar los residentes."),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [form.unitId, units]);

  // Fallback: si el listado vino sin nombre de destinatario (por ejemplo
  // porque la unidad ya no responde), se cruza contra los residentes.
  useEffect(() => {
    const missingUnitIds = [
      ...new Set(
        deliveries
          .filter(
            (d) =>
              d.recipientPersonId &&
              !d.resident &&
              !personMap[d.recipientPersonId],
          )
          .map((d) => d.unitId)
          .filter(Boolean),
      ),
    ].filter((unitId) => !fetchedUnitsRef.current.has(unitId));

    if (!missingUnitIds.length) return undefined;

    const inFlight = missingUnitIds;
    missingUnitIds.forEach((unitId) => fetchedUnitsRef.current.add(unitId));

    let cancelled = false;
    Promise.all(
      missingUnitIds.map((unitId) =>
        listUnitResidents({ id: unitId }).catch(() => null),
      ),
    ).then((lists) => {
      if (cancelled) {
        // Libera las unidades para que otro intento las vuelva a consultar.
        inFlight.forEach((unitId) => fetchedUnitsRef.current.delete(unitId));
        return;
      }

      // Una consulta fallida no debe quedar cacheada: se libera para reintentar.
      lists.forEach((list, index) => {
        if (list === null) {
          fetchedUnitsRef.current.delete(inFlight[index]);
        }
      });

      const map = {};
      lists
        .filter(Boolean)
        .flat()
        .forEach((row) => {
          const key = row.personId ?? row.userId;
          if (key && row.name) map[key] = row.name;
        });

      setPersonMap((prev) => ({ ...prev, ...map }));
    });

    return () => {
      cancelled = true;
    };
  }, [deliveries, personMap]);

  const updateField = (field) => (event) => {
    setForm((prev) => {
      const next = { ...prev, [field]: event.target.value };
      if (field === "unitId") next.personId = "";
      return next;
    });
    if (field === "unitId") setUnitResidents([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.unitId || !form.personId || !form.carrier) {
      setFormError("Elegí unidad, destinatario y correo.");
      return;
    }

    setSaving(true);
    try {
      // Revalida contra datos frescos: la persona pudo desvincularse (o la
      // base pudo re-sembrarse) después de cargar el desplegable. Sin esto,
      // el backend responde 400 "destinatario no vinculado".
      const fresh = await listUnitResidents({ id: form.unitId });
      const stillLinked = fresh.some(
        (row) => row.personId && row.personId === form.personId,
      );
      if (!stillLinked) {
        setFormError(
          "Esa persona ya no figura vinculada a la unidad. Cerrá y volvé a abrir el formulario.",
        );
        return;
      }

      await registerDelivery(buildingId, form.unitId, {
        recipientPersonId: form.personId,
        carrier: form.carrier,
        trackingNumber: form.trackingNumber,
      });
      setForm(EMPTY_FORM);
      setUnitResidents([]);
      setShowForm(false);
      setSuccessMessage("Delivery registrado correctamente.");
    } catch (err) {
      setFormError(apiErrorMessage(err, "No se pudo registrar el delivery."));
    } finally {
      setSaving(false);
    }
  };

  const handleDeliver = async (delivery) => {
    setActionError("");
    try {
      await markPickedUp(delivery.id, delivery.buildingId);
      setSuccessMessage("Delivery marcado como entregado.");
    } catch (err) {
      setActionError(apiErrorMessage(err, "No se pudo marcar como entregado."));
    }
  };

  const pendingCount = forBuilding(buildingId).filter(
    (d) => d.status === "RECEIVED" || d.status === "pending",
  ).length;

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
      {actionError && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setActionError("")}
          className="mb-4"
        >
          {actionError}
        </Alert>
      )}
      {loadError && (
        <Alert variant="danger" className="mb-4">
          {loadError}
        </Alert>
      )}

      <div className="ct-grid-kpi-3 mb-4">
        <KpiCard
          label="En portería"
          value={pendingCount}
          sub={building?.name ?? ""}
        />
        <KpiCard
          label="En esta vista"
          value={deliveries.length}
          sub={statusFilter || "Todos los estados"}
        />
        <KpiCard
          label="Edificio"
          value={building?.name ?? "—"}
          sub="Alcance actual"
        />
      </div>

      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <select
          aria-label="Filtrar por estado"
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">Todos los estados</option>
          {DELIVERY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        {canRegister && (
          <button
            type="button"
            className="btn btn-sm text-white d-flex align-items-center gap-2 ms-auto"
            style={{ background: "var(--color-accent)" }}
            onClick={() => setShowForm((v) => !v)}
          >
            <Icon name="plus" size={14} />
            Registrar delivery
          </button>
        )}
      </div>

      {showForm && canRegister && (
        <div className="ct-card p-4 mb-4">
          <p
            className="ct-font-mono text-uppercase ct-text-muted mb-3"
            style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
          >
            Nuevo delivery -{building?.name}
          </p>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Unidad
                </Form.Label>
                <Form.Select
                  value={form.unitId}
                  onChange={updateField("unitId")}
                  required
                  disabled={!!unitsError}
                >
                  <option value="">
                    {unitsError
                      ? "No se pudieron cargar las unidades"
                      : units.length
                        ? "Seleccioná una unidad"
                        : "El edificio no tiene unidades"}
                  </option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.code} · Piso {unit.floor}
                    </option>
                  ))}
                </Form.Select>
                {unitsError && (
                  <Form.Text className="ct-text-muted">
                    {unitsError} La portería puede no tener permiso para ver
                    las unidades del edificio.
                  </Form.Text>
                )}
                {!unitsError && unitsTotal > units.length && (
                  <Form.Text className="ct-text-muted">
                    Se muestran {units.length} de {unitsTotal} unidades. Si
                    falta la que buscás, registrala primero en Unidades.
                  </Form.Text>
                )}
              </div>
              <div className="col-6">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Destinatario
                </Form.Label>
                <Form.Select
                  value={form.personId}
                  onChange={updateField("personId")}
                  required
                  disabled={!form.unitId || !!residentsError}
                >
                  <option value="">
                    {residentsError
                      ? "No se pudieron cargar los residentes"
                      : form.unitId
                        ? "Seleccioná una persona"
                        : "Primero elegí unidad"}
                  </option>
                  {unitResidents.map((row) => (
                    <option
                      key={row.personId ?? row.id}
                      value={row.personId ?? ""}
                    >
                      {row.name || row.email}
                    </option>
                  ))}
                </Form.Select>
                {residentsError && (
                  <Form.Text className="ct-text-muted">
                    {residentsError} Ese endpoint es solo para
                    administradores: pedile a un admin que registre el paquete.
                  </Form.Text>
                )}
              </div>
              <div className="col-6">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Correo
                </Form.Label>
                <Form.Select
                  value={form.carrier}
                  onChange={updateField("carrier")}
                  required
                >
                  {CARRIERS.map((carrier) => (
                    <option key={carrier} value={carrier}>
                      {carrier}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-6">
                <Form.Label
                  className="ct-font-mono ct-text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  Seguimiento (opcional)
                </Form.Label>
                <Form.Control
                  placeholder="Ej. AE-8831-2024"
                  value={form.trackingNumber}
                  onChange={updateField("trackingNumber")}
                />
              </div>
            </div>

            {formError && (
              <Alert variant="danger" className="py-2 small mb-3">
                {formError}
              </Alert>
            )}

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowForm(false)}
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
                {saving ? "Guardando..." : "Registrar"}
              </Button>
            </div>
          </Form>
        </div>
      )}

      <div className="ct-card overflow-hidden">
        <div className="ct-card-header">
          <p
            className="ct-font-mono text-uppercase ct-text-muted mb-0"
            style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
          >
            Deliveries y correspondencia
          </p>
        </div>
        <div>
          {loading && (
            <p className="ct-text-muted px-3 py-3 mb-0">
              Cargando deliveries...
            </p>
          )}
          {!loading && deliveries.length === 0 && (
            <div className="text-center py-5">
              <Icon
                name="deliveries"
                size={32}
                className="ct-text-faint mb-3"
              />
              <p className="ct-text-muted mb-0">Sin deliveries registrados</p>
            </div>
          )}
          {deliveries.map((delivery) => {
            const recipient =
              personMap[delivery.recipientPersonId] ||
              delivery.resident ||
              "Destinatario";
            const canDeliver = [
              "RECEIVED",
              "NOTIFIED",
              "pending",
              "notified",
            ].includes(delivery.status);
            return (
              <div
                key={delivery.id}
                className="ct-row ct-row-hover d-flex align-items-center gap-4"
              >
                <div
                  className="ct-icon-tile-lg d-flex align-items-center justify-content-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "0.75rem",
                    background: "var(--color-canvas)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <Icon name="deliveries" size={17} className="ct-text-muted" />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <p
                    className="mb-0 fw-semibold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {recipient}
                  </p>
                  <p className="ct-text-muted mb-0 mt-1">{delivery.carrier}</p>
                  <p
                    className="ct-font-mono ct-text-faint mb-0 mt-1"
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {codeOfUnit(units, delivery.unitId) || delivery.unit
                      ? `Unidad ${codeOfUnit(units, delivery.unitId) || delivery.unit} · `
                      : ""}
                    {delivery.trackingNumber || "Sin seguimiento"}
                  </p>
                </div>
                <div className="text-end flex-shrink-0">
                  <StatusBadge status={delivery.status} />
                  <p
                    className="ct-font-mono ct-text-faint mb-0 mt-2"
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {formatDate(delivery.received)}
                  </p>
                </div>
                {canDeliver && (
                  <div className="text-center flex-shrink-0">
                    <button
                      type="button"
                      className="btn btn-sm text-white"
                      style={{ background: "var(--color-green)" }}
                      onClick={() => handleDeliver(delivery)}
                    >
                      Entregar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
