import httpClient from "@/core/api/httpClient";
import { unwrapObject, unwrapPage } from "@/core/api/api";

const normalizeUnit = (raw = {}) => ({
  id: raw.id,
  buildingId: raw.buildingId,
  code: raw.code ?? "",
  label: raw.code ?? "",
  floor: raw.floor ?? 0,
  unitType: raw.unitType ?? "",
  description: raw.description ?? "",
  isActive: raw.isActive ?? true,
});

const extractPage = (response) => {
  const { items, pagination } = unwrapPage(response);
  return {
    units: items.map(normalizeUnit),
    total: pagination?.total ?? items.length,
  };
};

// Lista una página amplia (límite backend: 100). El conteo real viene en pagination.total.
export const listUnits = async (buildingId, { limit = 100 } = {}) => {
  const response = await httpClient.get(`/buildings/${buildingId}/units`, {
    params: { limit },
  });
  return extractPage(response);
};

// Conteo barato para las tarjetas: trae 1 item pero el total real.
export const getUnitsTotal = async (buildingId) => {
  const response = await httpClient.get(`/buildings/${buildingId}/units`, {
    params: { limit: 1 },
  });
  const body = response.data ?? {};
  if (typeof body?.pagination?.total === "number") {
    return body.pagination.total;
  }
  return Array.isArray(body.data) ? body.data.length : 0;
};

// Alta de unidad. Solo SUPER_ADMIN o ADMIN del edificio.
// Body exacto del backend: { code*, floor*, unitType*, description? }.
// Responde 201 { success, data: Unit }. 409 si el código existe o se
// alcanzó la capacidad (numberOfUnits del edificio).
export const createUnit = async (
  buildingId,
  { code, floor, unitType, description },
) => {
  const response = await httpClient.post(`/buildings/${buildingId}/units`, {
    code: code?.trim(),
    floor: Number(floor),
    unitType: unitType?.trim(),
    ...(description?.trim() ? { description: description.trim() } : {}),
  });
  return normalizeUnit(unwrapObject(response));
};

// Detalle de unidad con sus vínculos activos (unitPeople + person).
// Sin UI todavía: listo para la futura pantalla de detalle de unidad.
export const getUnitDetail = async (unitId) => {
  const response = await httpClient.get(`/units/${unitId}`);
  const raw = unwrapObject(response);
  return {
    ...normalizeUnit(raw),
    unitPeople: Array.isArray(raw.unitPeople) ? raw.unitPeople : [],
  };
};

// PATCH /api/units/:unitId — solo SUPER_ADMIN o ADMIN del edificio.
// Parcial: { code?, floor? (entero >= 0), unitType?, description?, isActive? }.
// Exige al menos un campo. 409 si el código ya existe en el edificio.
export const updateUnit = async (unitId, patch = {}) => {
  const payload = {};
  if (patch.code !== undefined) payload.code = patch.code?.trim();
  if (patch.floor !== undefined) payload.floor = Number(patch.floor);
  if (patch.unitType !== undefined) payload.unitType = patch.unitType?.trim();
  if (patch.description !== undefined)
    payload.description = patch.description?.trim() ?? null;
  if (patch.isActive !== undefined) payload.isActive = Boolean(patch.isActive);

  const response = await httpClient.patch(`/units/${unitId}`, payload);
  return normalizeUnit(unwrapObject(response));
};
