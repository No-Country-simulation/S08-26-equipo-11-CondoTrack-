import { Component } from "react";
import { Icon } from "@/shared/components/Icon";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado por ErrorBoundary:", error.message);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state;

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
              Lo sentimos, ha ocurrido un error inesperado. Por favor, inténtalo
              de nuevo más tarde.
            </p>

            {import.meta.env.DEV && error && (
              <details className="mt-4 p-3 rounded-3 text-start small" style={{ background: "var(--color-canvas)", color: "var(--color-ink-muted)" }}>
                <summary className="fw-medium" style={{ cursor: "pointer" }}>
                  Detalles del error
                </summary>
                <pre className="mt-2 p-2 bg-white rounded border" style={{ maxHeight: 160, overflow: "auto" }}>
                  {error.message || JSON.stringify(error, null, 2)}
                </pre>
              </details>
            )}

            <div className="mt-4 d-flex justify-content-center">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
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

    return this.props.children;
  }
}

export default ErrorBoundary;
