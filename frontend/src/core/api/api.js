// Capa compartida para todos los servicios que hablan con la API.
// Contratos del backend (ver Swagger /api-docs):
// - Éxito: { success: true, data: <objeto|array>, pagination? }
// - Error: { success: false, message: "<motivo>" } (más `error`/`stack` fuera de prod)
// Todos los servicios de `src/modules/*/services/` deben usar estos helpers
// para que los endpoints futuros se integren con el mismo formato.

// Extrae `data` como objeto (detalle / create / update).
export const unwrapObject = (response, fallback = {}) =>
  response?.data?.data ?? response?.data ?? fallback;

// Extrae `data` como array (listados).
export const unwrapList = (response) => {
  const items = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(items) ? items : [];
};

// Extrae `{ data, pagination }` de un listado paginado del backend.
export const unwrapPage = (response) => {
  const body = response?.data ?? {};
  const items = Array.isArray(body?.data) ? body.data : [];
  return { items, pagination: body?.pagination ?? null };
};

// Mensaje legible de un error: usa el `message` del backend si respondió,
// el <fallback>  </fallback> si no hubo respuesta (red/servidor), o el mensaje propio si
// es un error local (ej. validación previa al request).
export const apiErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (error.response) return error.response.data?.message ?? fallback;
  if (error.request) return fallback;
  return error.message || fallback;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Valida formato UUID (el backend lo exige en ids y buildingId).
export const isUuid = (value) =>
  typeof value === "string" && UUID_REGEX.test(value);
