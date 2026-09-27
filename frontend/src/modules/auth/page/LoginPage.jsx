import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { GoogleAuthButton } from "@/modules/auth/components/GoogleAuthButton";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/inicio", { replace: true });
    } catch {
      setError("No se pudo iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center min-vh-100 px-3">
      <form
        className="login-form p-4 rounded shadow-sm w-100"
        autoComplete="on"
        onSubmit={handleSubmit}
      >
        <h1 className="login-title text-center mb-4">Bienvenidos</h1>

        <div className="mb-3">
          <label className="form-label" htmlFor="formBasicEmail">
            Correo electrónico
          </label>
          <input
            className="form-control"
            id="formBasicEmail"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="formPassword">
            Contraseña
          </label>
          <input
            className="form-control"
            id="formPassword"
            type="password"
            placeholder="**********"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              id="rememberMe"
              type="checkbox"
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Recordarme
            </label>
          </div>
          <a href="#" className="login-link text-decoration-none">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button
          type="submit"
          className="login-submit w-100 btn"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <div className="d-flex align-items-center gap-2 my-3">
          <hr className="flex-grow-1" />
          <span className="text-muted small">o</span>
          <hr className="flex-grow-1" />
        </div>

        <GoogleAuthButton />

        <p className="text-center mt-3 mb-0">
          ¿Sos dueño de un edificio y todavía no tenés cuenta?{" "}
          <Link to="/register" className="login-link text-decoration-none">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  );
};
