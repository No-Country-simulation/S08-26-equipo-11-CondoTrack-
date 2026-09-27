import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerService } from "@/modules/auth/services/authService";
import { GoogleAuthButton } from "@/modules/auth/components/GoogleAuthButton";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await registerService(form);
      navigate("/login", { replace: true });
    } catch {
      setError("No se pudo completar el registro. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center min-vh-100 px-3">
      <form
        className="login-form p-4 rounded shadow-sm w-100"
        autoComplete="on"
        onSubmit={handleSubmit}
      >
        <h1 className="login-title text-center mb-1">Registrá tu edificio</h1>
        <p className="text-center ct-text-muted mb-4" style={{ fontSize: "0.875rem" }}>
          Creá tu cuenta de administración para empezar a usar CondoTrack.
        </p>

        <div className="mb-3">
          <label className="form-label" htmlFor="nombre">
            Nombre
          </label>
          <input
            className="form-control"
            id="nombre"
            type="text"
            autoComplete="given-name"
            value={form.nombre}
            onChange={handleChange("nombre")}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="apellido">
            Apellido
          </label>
          <input
            className="form-control"
            id="apellido"
            type="text"
            autoComplete="family-name"
            value={form.apellido}
            onChange={handleChange("apellido")}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="documento">
            Documento
          </label>
          <input
            className="form-control"
            id="documento"
            type="number"
            value={form.documento}
            onChange={handleChange("documento")}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            className="form-control"
            id="email"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="username"
            value={form.email}
            onChange={handleChange("email")}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="password">
            Contraseña
          </label>
          <input
            className="form-control"
            id="password"
            type="password"
            placeholder="**********"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange("password")}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="confirmPassword">
            Confirmación de contraseña
          </label>
          <input
            className="form-control"
            id="confirmPassword"
            type="password"
            placeholder="**********"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            required
          />
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button
          type="submit"
          className="login-submit w-100 btn"
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <div className="d-flex align-items-center gap-2 my-3">
          <hr className="flex-grow-1" />
          <span className="text-muted small">o</span>
          <hr className="flex-grow-1" />
        </div>

        <GoogleAuthButton />

        <p className="text-center mt-3 mb-0">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="login-link text-decoration-none">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
};
