import { useState } from "react";
import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { QRCode } from "@/modules/access/components/QRCode";
import { useAccessLogs } from "@/modules/access/hooks/useAccessLogs";
import { useVisitorAuthorizations } from "@/modules/access/hooks/useVisitorAuthorizations";
import { useCurrentResident } from "@/modules/resident/hooks/useCurrentResident";

const initialsOf = (name) =>
  name.split(" ").map((part) => part[0]).join("").slice(0, 2);

export const VisitsPage = () => {
  const { forResident } = useAccessLogs();
  const current = useCurrentResident();
  const {
    visitors,
    showForm,
    setShowForm,
    openForm,
    form,
    updateField,
    submit,
    cancel,
    error,
    saving,
  } = useVisitorAuthorizations(current.unitId, current.id);
  const myAccess = forResident(current);

  const latestQr = visitors.find((visitor) => visitor.qrImage)?.qrImage ?? null;
  const latestVisit = visitors.find((visitor) => visitor.qrImage) ?? null;

  const formatValidUntil = (value) => {
    if (!value) return "";
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

  const [copiedId, setCopiedId] = useState(null);

  // Envía el QR al visitante: Web Share con imagen si se puede,
  // si no comparte el texto, y como último recurso copia el código.
  const shareVisit = async (visitor) => {
    const text =
      `Pase de visita CondoTrack para ${visitor.name} — ` +
      `válido hasta ${formatValidUntil(visitor.validUntil)}. ` +
      `Presentá este código en recepción.`;
    try {
      if (visitor.qrImage) {
        const blob = await (await fetch(visitor.qrImage)).blob();
        const file = new File([blob], `qr-visita-${visitor.id}.png`, {
          type: "image/png",
        });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Pase de visita",
            text,
          });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: "Pase de visita", text });
        return;
      }
    } catch {
      // cancelado o no soportado: se sigue al portapapeles
    }
    try {
      await navigator.clipboard.writeText(
        visitor.qrToken ? `${text} Código: ${visitor.qrToken}` : text,
      );
      setCopiedId(visitor.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore: sin portapapeles disponible
    }
  };

  const downloadQr = (visitor) => {
    if (!visitor.qrImage) return;
    const link = document.createElement("a");
    link.href = visitor.qrImage;
    link.download = `qr-visita-${visitor.id}.png`;
    link.click();
  };

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-visits">
        <div className="ct-card d-flex flex-column align-items-center gap-4 p-4">
          <div className="text-center">
            <p className="ct-font-mono text-uppercase ct-text-muted mb-1" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              {latestVisit ? "Último pase generado" : "Código de acceso"}
            </p>
            <p className="ct-font-mono ct-text-faint mb-0" style={{ fontSize: "0.75rem" }}>
              {current.hasUnit
                ? `Unidad ${current.unit} · ${current.buildingLabel}`
                : "Sin unidad asignada"}
            </p>
          </div>
          <div className="p-2 rounded-3" style={{ border: "2px solid var(--color-border)" }}>
            {latestQr ? (
              <img
                src={latestQr}
                alt="Código QR de acceso"
                width={180}
                height={180}
              />
            ) : (
              <QRCode size={180} />
            )}
          </div>
          <div className="text-center">
            <p className="ct-font-display fw-semibold mb-0" style={{ color: "var(--color-ink)" }}>
              {latestVisit ? latestVisit.name : current.name}
            </p>
            <p className="ct-font-mono ct-text-muted mb-0 mt-1" style={{ fontSize: "0.75rem" }}>
              {latestVisit
                ? `Válido hasta ${formatValidUntil(latestVisit.validUntil)}`
                : "Autorizá una visita para generar un QR válido"}
            </p>
          </div>
          <div className="ct-badge ct-badge-green" style={{ fontSize: "0.75rem" }}>
            Activo · Válido hoy
          </div>
          <p className="ct-font-mono ct-text-faint text-center mb-0" style={{ fontSize: "0.6875rem" }}>
            Presentá este código en recepción o escanealo en el lector de acceso
          </p>
        </div>

        <div className="d-flex flex-column gap-4">
          <div className="ct-card">
            <div className="ct-card-header">
              <h3 className="ct-card-title">Visitantes autorizados</h3>
              <button
                type="button"
                className="btn btn-sm text-white d-flex align-items-center gap-2"
                style={{ background: "var(--color-accent)" }}
                onClick={() => (showForm ? setShowForm(false) : openForm())}
              >
                <Icon name="plus" size={13} />
                Autorizar visitante
              </button>
            </div>

            {showForm && (
              <div className="ct-row" style={{ background: "var(--color-canvas)" }}>
                <p className="ct-font-mono text-uppercase ct-text-muted mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                  Nueva autorización
                </p>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Nombre completo</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Ej. Juan García"
                      value={form.name}
                      onChange={updateField("name")}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Relación</label>
                    <select className="form-select form-select-sm" value={form.relation} onChange={updateField("relation")}>
                      <option value="">Seleccionar…</option>
                      <option>Familiar</option>
                      <option>Amigo/a</option>
                      <option>Proveedor</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>DNI del visitante</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Ej. 30123456"
                      value={form.dni}
                      onChange={updateField("dni")}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Fecha de visita</label>
                    <input type="date" className="form-control form-control-sm" value={form.date} onChange={updateField("date")} />
                  </div>
                  <div className="col-6">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Hora estimada</label>
                    <input type="time" className="form-control form-control-sm" value={form.time} onChange={updateField("time")} />
                    <div className="form-text" style={{ fontSize: "0.6875rem" }}>El pase vale 60 min desde esa hora.</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label ct-font-mono ct-text-muted" style={{ fontSize: "0.6875rem" }}>Nota (opcional)</label>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Motivo de la visita"
                      value={form.note}
                      onChange={updateField("note")}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm text-white"
                    style={{ background: "var(--color-accent)" }}
                    onClick={submit}
                    disabled={saving}
                  >
                    {saving ? "Autorizando..." : "Confirmar autorización"}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={cancel}>
                    Cancelar
                  </button>
                </div>
                {error && (
                  <div className="alert alert-danger py-2 small mt-3 mb-0">
                    {error}
                  </div>
                )}
              </div>
            )}

            <div>
              {visitors.length === 0 && (
                <p className="ct-text-muted px-3 py-3 mb-0">
                  Todavía no autorizaste visitas en esta sesión.
                </p>
              )}
              {visitors.map((visitor) => (
                <div key={visitor.id} className="ct-row ct-row-hover d-flex align-items-center gap-3">
                  <div
                    className="ct-avatar"
                    style={{ width: 32, height: 32, fontSize: "0.75rem", background: "var(--color-accent)" }}
                  >
                    {initialsOf(visitor.name)}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{visitor.name}</p>
                    <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                      {visitor.relation} · válido hasta {formatValidUntil(visitor.validUntil)}
                    </p>
                  </div>
                  <StatusBadge status={visitor.status === "expired" ? "resolved" : "active"} />
                  <div className="d-flex flex-column gap-1 flex-shrink-0">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => shareVisit(visitor)}
                    >
                      {copiedId === visitor.id ? "¡Copiado!" : "Compartir"}
                    </button>
                    {visitor.qrImage && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-decoration-none"
                        style={{ fontSize: "0.75rem" }}
                        onClick={() => downloadQr(visitor)}
                      >
                        Descargar QR
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ct-card">
            <div className="ct-card-header">
              <h3 className="ct-card-title">
                Historial de accesos
                {current.hasUnit ? ` — Unidad ${current.unit}` : ""}
              </h3>
            </div>
            <div>
              {myAccess.map((log) => (
                <div key={log.id} className="ct-row ct-row-hover d-flex align-items-center gap-3">
                  <span className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem", width: 40, flexShrink: 0 }}>{log.time}</span>
                  <div className="flex-grow-1">
                    <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{log.person}</p>
                    <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{log.type} · {log.method}</p>
                  </div>
                  <span className="ct-font-mono" style={{ fontSize: "0.75rem", color: log.direction === "Ingreso" ? "var(--color-green)" : "var(--color-ink-muted)" }}>
                    {log.direction}
                  </span>
                  <StatusBadge status={log.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
