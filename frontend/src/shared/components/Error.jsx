import { useRouteError, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Icon } from "@/shared/components/Icon";

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("Routing error:", error);
  }, [error]);

  return (
    <div
      className="d-flex align-items-center justify-content-center p-4"
      style={{ minHeight: "100vh", background: "var(--color-canvas)" }}
    >
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm text-center" style={{ maxWidth: 420, width: "100%" }}>
        <div
          className="mx-auto d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: 48, height: 48, background: "var(--color-red-light)" }}
        >
          <Icon name="alert" size={28} style={{ color: "var(--color-red)" }} />
        </div>
        <h1 className="mt-4 h4 fw-bold" style={{ color: "var(--color-ink)" }}>
          ¡Ups! Algo salió mal
        </h1>
        <p className="mt-2 ct-text-muted">
          Lo sentimos, ha ocurrido un error inesperado. Por favor, inténtalo de
          nuevo más tarde.
        </p>

        {import.meta.env.DEV && error && (
          <details className="mt-4 p-3 rounded-3 text-start small" style={{ background: "var(--color-canvas)", color: "var(--color-ink-muted)" }}>
            <summary className="fw-medium" style={{ cursor: "pointer" }}>
              Detalles del error
            </summary>
            <pre className="mt-2 p-2 bg-white rounded border" style={{ maxHeight: 160, overflow: "auto" }}>
              {error?.message || JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}

        <div className="mt-4 d-flex flex-column flex-sm-row gap-2 justify-content-center">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
            onClick={() => window.location.reload()}
          >
            <Icon name="refresh" size={16} />
            Recargar página
          </button>
        </div>
      </div>
    </div>
  );
}
