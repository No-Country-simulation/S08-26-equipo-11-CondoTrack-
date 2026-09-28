import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/contexts/AuthContext";

// El backend trae "PENDIENTE" como placeholder: se pide el nombre real.
const realName = (value) => (value && value !== "PENDIENTE" ? value : "");

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useAuth();
  const [form, setForm] = useState(() => ({
    nombre: realName(user?.nombre),
    apellido: realName(user?.apellido),
    telefono: user?.telefono ?? "",
    tipoDocumento: user?.tipoDocumento ?? "",
    documento: user?.documento ?? "",
    codigoPostal: user?.codigoPostal ?? "",
  }));
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
    if (!form.apellido.trim()) errors.apellido = "El apellido es obligatorio.";
    if (!form.telefono.trim()) errors.telefono = "El teléfono es obligatorio.";
    if (!form.tipoDocumento)
      errors.tipoDocumento = "El tipo de documento es obligatorio.";
    if (!form.documento.trim())
      errors.documento = "El documento es obligatorio.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationErrors = validate();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await updateProfile(form);
      navigate("/inicio", { replace: true });
    } catch (err) {
      // Muestra el motivo real del backend (ej. validación del PATCH /auth/me).
      setError(
        err?.response?.data?.message ??
          "No se pudo guardar tu perfil. Intenta nuevamente.",
      );
    }
  };

  return (
    <main className="login-page d-flex justify-content-center align-items-center min-vh-100 px-3">
      <form
        className="login-form p-4 rounded shadow-sm w-100"
        onSubmit={handleSubmit}
        noValidate
      >
        <h1 className="login-title text-center mb-2">Completá tu perfil</h1>
        <p className="text-center text-muted mb-4">
          Necesitamos estos datos para continuar usando CondoTrack.
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
            <option value="">Seleccioná una opción</option>
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

        <div className="mb-3">
          <label className="form-label" htmlFor="documento">
            DNI / Documento
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

        <div className="mb-3">
          <label className="form-label" htmlFor="codigoPostal">
            Código postal (opcional)
          </label>
          <input
            className="form-control"
            id="codigoPostal"
            type="text"
            autoComplete="postal-code"
            value={form.codigoPostal}
            onChange={handleChange("codigoPostal")}
          />
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button
          type="submit"
          className="login-submit w-100 btn"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar y continuar"}
        </button>
      </form>
    </main>
  );
}
