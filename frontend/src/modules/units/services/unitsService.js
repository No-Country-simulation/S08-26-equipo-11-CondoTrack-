import httpClient from "@/core/api/httpClient";

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

const extractPage = (body) => {
  const items = Array.isArray(body?.data) ? body.data : [];
  return {
    units: items.map(normalizeUnit),
    total: body?.pagination?.total ?? items.length,
  };
};

// Lista una página amplia (límite backend: 100). El conteo real viene en pagination.total.
export const listUnits = async (buildingId, { limit = 100 } = {}) => {
  const response = await httpClient.get(`/buildings/${buildingId}/units`, {
    params: { limit },
  });
  return extractPage(response.data);
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
