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

// Mensaje legible de un error axios (usa el `message` del backend).
export const apiErrorMessage = (error, fallback) =>
  error?.response?.data?.message ?? fallback;
