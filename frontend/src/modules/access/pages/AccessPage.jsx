import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import {
  registerExit,
  searchVisits,
  validateQr,
} from "@/modules/access/services/accessService";
import { QrScanner } from "@/modules/access/components/QrScanner";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { ENTITY_TYPES, RESULTS } from "@/core/activity/activityTypes";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import { apiErrorMessage } from "@/core/api/api";

const formatDateTime = (value) => {
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

// Flujo de portería contra la API real:
// - Validar QR: registra el ENTRY y deja la autorización en READ.
// - Buscar por DNI/apellido: lista autorizaciones del alcance propio.
// - Registrar salida: crea el evento EXIT (exige ENTRY previo, sin duplicados).
// Sin mocks: la tabla vieja y el registro manual salieron porque el backend
// no expone carga manual de accesos (el ingreso nace del QR validado).
export const AccessPage = () => {
  // En /dashboard viene del layout; en /recepcion, del primer edificio propio.
  const outlet = useOutletContext();
  const { user } = useAuth();
  const building = outlet?.building ?? user?.buildings?.[0] ?? null;
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();

  const [qrToken, setQrToken] = useState("");
  const [validated, setValidated] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validateError, setValidateError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [exitingId, setExitingId] = useState(null);
  const [exitError, setExitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const runValidation = async (token) => {
    setValidating(true);
    try {
      const result = await validateQr(token);
      setValidated(result);
      setQrToken("");
      setSuccessMessage(
        `Ingreso registrado: ${result.name || "visitante"} · Unidad ${result.unit?.code ?? "—"}.`,
      );
      // El ingreso es el evento más crítico del edificio: sin esta traza no
      // queda registro de quién autorizó el acceso ni de qué unidad.
      logActivity({
        actor,
        action: `Validó el QR e hizo ingresar a ${result.name || "un visitante"}`,
        buildingId: result.buildingId ?? building?.id ?? null,
        unitId: result.unitId ?? null,
        unitCode: result.unit?.code ?? null,
        entityType: ENTITY_TYPES.ACCESS,
        entityId: result.id ?? null,
        result: RESULTS.OK,
        detail: result.relation || null,
      });
    } catch (err) {
      const message = apiErrorMessage(err, "No se pudo validar el QR.");
      setValidateError(message);
      // Un QR rechazado también es trazabilidad: se necesita saber qué se
      // intentó(validado, vencido o inexistente).
      logActivity({
        actor,
        action: "Intentó validar un QR sin éxito",
        buildingId: building?.id ?? null,
        entityType: ENTITY_TYPES.ACCESS,
        result: RESULTS.ERROR,
        detail: message,
      });
    } finally {
      setValidating(false);
    }
  };

  const handleValidate = async (event) => {
    event.preventDefault();
    setValidateError("");
    setValidated(null);

    if (!qrToken.trim()) {
      setValidateError("Ingresá el token del QR.");
      return;
    }

    await runValidation(qrToken);
  };

  const handleScanned = async (token) => {
    setShowScanner(false);
    setValidateError("");
    setValidated(null);
    await runValidation(token);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setSearchError("");
    setExitError("");

    if (!query.trim()) {
      setSearchError("Escribí un DNI o apellido para buscar.");
      return;
    }

    setSearching(true);
    try {
      setResults(await searchVisits(query));
      setSearched(true);
    } catch (err) {
      setResults([]);
      setSearched(false);
      setSearchError(apiErrorMessage(err, "No se pudo buscar."));
    } finally {
      setSearching(false);
    }
  };

  const handleExit = async (authorization) => {
    setExitError("");
    setExitingId(authorization.id);
    try {
      await registerExit(authorization.id);
      setSuccessMessage(
        `Salida registrada: ${authorization.name || "visitante"}.`,
      );
      logActivity({
        actor,
        action: `Registró la salida de ${authorization.name || "un visitante"}`,
        buildingId: authorization.buildingId ?? building?.id ?? null,
        unitId: authorization.unitId ?? null,
        unitCode: authorization.unit || null,
        entityType: ENTITY_TYPES.ACCESS,
        entityId: authorization.id ?? null,
        result: RESULTS.OK,
      });
      if (query.trim()) {
        setResults(await searchVisits(query));
      }
    } catch (err) {
      const message = apiErrorMessage(err, "No se pudo registrar la salida.");
      setExitError(message);
      logActivity({
        actor,
        action: `No pudo registrar la salida de ${authorization.name || "un visitante"}`,
        buildingId: authorization.buildingId ?? building?.id ?? null,
        unitId: authorization.unitId ?? null,
        entityType: ENTITY_TYPES.ACCESS,
        entityId: authorization.id ?? null,
        result: RESULTS.ERROR,
        detail: message,
      });
    } finally {
      setExitingId(null);
    }
  };

  return (
    <div className="ct-main-scroll">
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")} className="mb-4">
          {successMessage}
        </Alert>
      )}

      <p className="ct-font-mono ct-text-muted mb-4" style={{ fontSize: "0.75rem" }}>
        Portería{building?.name ? ` · ${building.name}` : ""}
      </p>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="ct-card p-4">
            <p className="ct-font-mono text-uppercase ct-text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              Validar QR de ingreso
            </p>
            <form onSubmit={handleValidate}>
              <div className="d-flex gap-2 mb-3">
                <input
                  className="form-control form-control-sm ct-font-mono"
                  placeholder="Pegar token del QR…"
                  value={qrToken}
                  onChange={(event) => setQrToken(event.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-sm text-white flex-shrink-0"
                  style={{ background: "var(--color-accent)" }}
                  disabled={validating}
                >
                  {validating ? "Validando..." : "Validar"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary flex-shrink-0"
                  onClick={() => setShowScanner((v) => !v)}
                >
                  Escanear
                </button>
              </div>
            </form>
            {showScanner && (
              <QrScanner
                onScan={handleScanned}
                onClose={() => setShowScanner(false)}
              />
            )}
            {validateError && (
              <Alert variant="danger" className="py-2 small mb-0">
                {validateError}
              </Alert>
            )}
            {validated && (
              <div
                className="rounded-3 p-3 mt-3"
                style={{ background: "var(--color-green-light)" }}
              >
                <p className="mb-0 fw-semibold" style={{ color: "var(--color-ink)" }}>
                  {validated.name || "Visitante habilitado"}
                </p>
                <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.75rem" }}>
                  {validated.relation} · Unidad {validated.unit?.code ?? "—"}
                </p>
                <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                  Válido hasta {formatDateTime(validated.validUntil)}
                </p>
                <div className="mt-2">
                  <StatusBadge status="active" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-7">
          <div className="ct-card p-4">
            <p className="ct-font-mono text-uppercase ct-text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              Buscar visita por DNI o apellido
            </p>
            <form onSubmit={handleSearch}>
              <div className="d-flex gap-2 mb-3">
                <input
                  className="form-control form-control-sm"
                  placeholder="Ej. 30123456 o García…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-outline-secondary flex-shrink-0"
                  disabled={searching}
                >
                  {searching ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </form>
            {searchError && (
              <Alert variant="danger" className="py-2 small mb-3">
                {searchError}
              </Alert>
            )}
            {exitError && (
              <Alert variant="danger" className="py-2 small mb-3">
                {exitError}
              </Alert>
            )}

            {searched && results.length === 0 && (
              <p className="ct-text-muted mb-0">Sin resultados para esa búsqueda.</p>
            )}
            <div className="d-flex flex-column gap-2">
              {results.map((authorization) => (
                <div
                  key={authorization.id}
                  className="ct-row d-flex align-items-center gap-3"
                >
                  <div
                    className="ct-avatar flex-shrink-0"
                    style={{ width: 32, height: 32, fontSize: "0.75rem" }}
                  >
                    {(authorization.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>
                      {authorization.name || "Sin nombre"}
                    </p>
                    <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                      {authorization.relation} · Unidad {authorization.unit?.code ?? "—"}
                      {" · "}
                      {formatDateTime(authorization.validUntil)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 d-flex align-items-center gap-2">
                    <StatusBadge status={authorization.status} />
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      disabled={exitingId === authorization.id}
                      onClick={() => handleExit(authorization)}
                    >
                      {exitingId === authorization.id
                        ? "Registrando..."
                        : "Salida"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
