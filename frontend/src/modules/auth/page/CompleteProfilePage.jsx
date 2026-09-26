import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/contexts/AuthContext";

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useAuth();
  const [form, setForm] = useState(() => ({
    telefono: user?.telefono ?? "",
    tipoDocumento: user?.tipoDocumento ?? "",
    documento: user?.documento ?? "",
    codigoPostal: user?.codigoPostal ?? "",
  }));
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await updateProfile(form);
      navigate("/inicio", { replace: true });
    } catch {
      setError("No se pudo guardar tu perfil. Intenta nuevamente.");
    }
  };

  return (
    <main className="login-page d-flex justify-content-center align-items-center min-vh-100 px-3">
      <form
        className="login-form p-4 rounded shadow-sm w-100"
        onSubmit={handleSubmit}
      >
        <h1 className="login-title text-center mb-2">Completá tu perfil</h1>
        <p className="text-center text-muted mb-4">
          Necesitamos estos datos para continuar usando CondoTrack.
        </p>

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
