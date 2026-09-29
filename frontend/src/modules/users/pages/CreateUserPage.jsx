import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { registerService } from "@/modules/auth/services/authService";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useUsers } from "@/modules/users/context/UsersContext";
import { listUnits } from "@/modules/units/services/unitsService";
import { linkResident } from "@/modules/residents/services/residentsService";
import { apiErrorMessage } from "@/core/api/api";

export const CreateUserPage = () => {
  const { buildings, loading: buildingsLoading } = useBuildings();
  const { addLocalUser } = useUsers();
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
    unitId: "",
  });
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => {
      const next = { ...prev, [field]: event.target.value };
      // Al cambiar de edificio se resetea la unidad elegida.
      if (field === "buildingId") next.unitId = "";
      return next;
    });
  };

  // Unidades del edificio elegido para vincular al usuario al crearlo.
  // Sin vínculo a unidad, el residente no aparece en las listas.
  useEffect(() => {
    if (!form.buildingId) {
      return undefined;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga de unidades al elegir edificio
    setUnitsLoading(true);

    listUnits(form.buildingId)
      .then(({ units: buildingUnits }) => {
        if (!cancelled) setUnits(buildingUnits);
      })
      .catch(() => {
        if (!cancelled) setUnits([]);
      })
      .finally(() => {
        if (!cancelled) setUnitsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.buildingId]);

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
    if (!form.buildingId) errors.buildingId = "Elegí un edificio.";
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationErrors = validate();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const result = await registerService(form);
      const createdEmail = result?.data?.user?.email ?? form.email;

      // Refleja al creado en la lista local (el backend aún no lo lista).
      try {
        await addLocalUser({
          firstName: form.nombre,
          lastName: form.apellido,
          email: createdEmail,
          phone: form.telefono,
          buildingId: form.buildingId,
        });
      } catch {
        // ignore: la lista se sincroniza al recargar
      }

      // Vincula a la unidad para que aparezca en las listas del edificio.
      if (form.unitId) {
        try {
          await linkResident(
            { id: form.unitId, buildingId: form.buildingId },
            form.email,
          );
          setSuccessMessage(
            `Usuario ${createdEmail} creado y vinculado a la unidad.`,
          );
        } catch (linkError) {
          setSuccessMessage(`Usuario ${createdEmail} creado correctamente.`);
          setError(
            `No se pudo vincular a la unidad: ${apiErrorMessage(linkError, "intenta vincularlo desde Residentes.")}`,
          );
        }
      } else {
        setSuccessMessage(`Usuario ${createdEmail} creado correctamente.`);
      }

      setForm({
        nombre: "",
        apellido: "",
        tipoDocumento: "",
        documento: "",
        telefono: "",
        email: "",
        password: "",
        confirmPassword: "",
        buildingId: "",
        unitId: "",
      });
      setUnits([]);
      setFieldErrors({});
    } catch (err) {
      // Muestra el motivo real del backend (ej. email/documento duplicado).
      setError(
        err?.response?.data?.message ??
          "No se pudo crear el usuario. Inténtalo nuevamente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ct-main-scroll">
      <Link
        to="/dashboard/personal"
        className="ct-card-link"
        style={{ fontSize: "0.75rem" }}
      >
        ← Volver a personal
      </Link>
      <h2
        className="ct-font-display mb-1 mt-1"
        style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-ink)" }}
      >
        Crear usuario
      </h2>
      <p className="ct-text-muted mb-4" style={{ fontSize: "0.875rem" }}>
        El usuario quedará vinculado al edificio con el rol que defina el
        backend (hoy: RESIDENT).
      </p>

      {successMessage && (
        <div className="alert alert-success py-2 mb-4">{successMessage}</div>
      )}

      <form
        className="login-form p-4 rounded shadow-sm w-100"
        autoComplete="off"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="form-label" htmlFor="nombre">
              Nombre
            </label>
            <input
              className="form-control"
              id="nombre"
              type="text"
              autoComplete="off"
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
              autoComplete="off"
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
            autoComplete="off"
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
            placeholder="usuario@correo.com"
            autoComplete="off"
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
            Edificio
          </label>
          <select
            className="form-select"
            id="buildingId"
            value={form.buildingId}
            onChange={handleChange("buildingId")}
            required
            disabled={buildingsLoading || buildings.length === 0}
          >
            <option value="">
              {buildingsLoading ? "Cargando..." : "Seleccioná un edificio"}
            </option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
          {fieldErrors.buildingId && (
            <div className="invalid-feedback d-block">
              {fieldErrors.buildingId}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="unitId">
            Unidad (opcional)
          </label>
          <select
            className="form-select"
            id="unitId"
            value={form.unitId}
            onChange={handleChange("unitId")}
            disabled={!form.buildingId || unitsLoading}
          >
            <option value="">
              {!form.buildingId
                ? "Primero elegí un edificio"
                : unitsLoading
                  ? "Cargando..."
                  : "Sin vincular (solo cuenta)"}
            </option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.code} · Piso {unit.floor}
              </option>
            ))}
          </select>
          <div className="form-text">
            Si la elegís, el residente aparece en las listas del edificio.
          </div>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button
          type="submit"
          className="login-submit w-100 btn"
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear usuario"}
        </button>
      </form>
    </div>
  );
};
