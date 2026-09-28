import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerService } from "@/modules/auth/services/authService";
import { GoogleAuthButton } from "@/modules/auth/components/GoogleAuthButton";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "",
    documento: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
    buildingId: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
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
    if (form.password.length < 8)
      errors.password = "La contraseña debe tener al menos 8 caracteres.";
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Las contraseñas no coinciden.";
    if (!form.buildingId.trim()) {
      errors.buildingId = "El ID del edificio es obligatorio.";
    } else if (!UUID_REGEX.test(form.buildingId.trim())) {
      errors.buildingId = "El ID del edificio no tiene un formato válido.";
    }
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
      await registerService(form);
      navigate("/login", { replace: true });
    } catch (err) {
      // Muestra el motivo real del backend (ej. email/documento duplicado).
      setError(
        err?.response?.data?.message ??
          "No se pudo completar el registro. Inténtalo nuevamente.",
      );
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
        noValidate
      >
        <h1 className="login-title text-center mb-1">Creá tu cuenta</h1>
        <p
          className="text-center ct-text-muted mb-4"
          style={{ fontSize: "0.875rem" }}
        >
          Registrate para acceder a tu edificio en CondoTrack.
        </p>

        <div className="row g-3 mb-3">
          <div className="col-6">
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
            {fieldErrors.nombre && (
              <div className="invalid-feedback d-block">
                {fieldErrors.nombre}
              </div>
            )}
          </div>
          <div className="col-6">
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
            {fieldErrors.apellido && (
              <div className="invalid-feedback d-block">
                {fieldErrors.apellido}
              </div>
            )}
          </div>
        </div>

        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label" htmlFor="tipoDocumento">
              Tipo de documento
            </label>
            <select
              className="form-select"
              id="tipoDocumento"
              value={form.tipoDocumento}
              onChange={handleChange("tipoDocumento")}
              required
            >
              <option value="">Seleccioná</option>
              <option value="DNI">DNI</option>
              <option value="CUIL">CUIL</option>
              <option value="PASSPORT">Pasaporte</option>
            </select>
            {fieldErrors.tipoDocumento && (
              <div className="invalid-feedback d-block">
                {fieldErrors.tipoDocumento}
              </div>
            )}
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="documento">
              Documento
            </label>
            <input
              className="form-control"
              id="documento"
              type="text"
              inputMode="numeric"
              value={form.documento}
              onChange={handleChange("documento")}
              required
            />
            {fieldErrors.documento && (
              <div className="invalid-feedback d-block">
                {fieldErrors.documento}
              </div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="telefono">
            Teléfono
          </label>
          <input
            className="form-control"
            id="telefono"
            type="tel"
            autoComplete="tel"
            value={form.telefono}
            onChange={handleChange("telefono")}
            required
          />
          {fieldErrors.telefono && (
            <div className="invalid-feedback d-block">
              {fieldErrors.telefono}
            </div>
          )}
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
          {fieldErrors.email && (
            <div className="invalid-feedback d-block">{fieldErrors.email}</div>
          )}
        </div>

        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              className="form-control"
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange("password")}
              required
            />
            {fieldErrors.password && (
              <div className="invalid-feedback d-block">
                {fieldErrors.password}
              </div>
            )}
          </div>
          <div className="col-6">
            <label className="form-label" htmlFor="confirmPassword">
              Confirmar
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
            {fieldErrors.confirmPassword && (
              <div className="invalid-feedback d-block">
                {fieldErrors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="buildingId">
            ID del edificio
          </label>
          <input
            className="form-control ct-font-mono"
            id="buildingId"
            type="text"
            placeholder="Ej. 00000000-0000-0000-0000-000000000002"
            value={form.buildingId}
            onChange={handleChange("buildingId")}
            required
          />
          <div className="form-text">
            Pedí este código al administrador de tu edificio. Tu cuenta
            quedará vinculada a él.
          </div>
          {fieldErrors.buildingId && (
            <div className="invalid-feedback d-block">
              {fieldErrors.buildingId}
            </div>
          )}
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
