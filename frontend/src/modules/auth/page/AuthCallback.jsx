import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import {
  isProfileComplete,
  persistBearerFromUrl,
} from "@/modules/auth/services/authService";

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSession } = useAuth();
  const [error, setError] = useState("");
  const callbackHandled = useRef(false);

  useEffect(() => {
    if (callbackHandled.current || searchParams.get("error")) {
      return;
    }

    callbackHandled.current = true;

    const token = persistBearerFromUrl();

    // El backend puede autenticar por cookie httpOnly sin token en la URL:
    // igual intentamos validar la sesión forzando el GET /auth/me.
    refreshSession(!token)
      .then((user) => {
        if (!user) {
          setError("No se pudo validar la sesión. Intenta nuevamente.");
          return;
        }

        navigate(isProfileComplete(user) ? "/inicio" : "/perfil/completar", {
          replace: true,
        });
      })
      .catch(() =>
        setError("No se pudo validar la sesión. Intenta nuevamente."),
      );
  }, [navigate, refreshSession, searchParams]);

  const callbackError = searchParams.get("error")
    ? "Google no pudo completar el inicio de sesión."
    : error;

  return (
    <main className="d-flex min-vh-100 align-items-center justify-content-center px-3">
      <section className="text-center" aria-live="polite">
        {callbackError ? (
          <>
            <h1 className="h4">No se pudo iniciar sesión</h1>
            <p className="text-muted">{callbackError}</p>
            <Link className="btn btn-primary" to="/login">
              Volver al inicio de sesión
            </Link>
          </>
        ) : (
          <p>Validando tu sesión...</p>
        )}
      </section>
    </main>
  );
}
