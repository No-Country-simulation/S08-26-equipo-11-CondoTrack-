import httpClient from "@/core/api/httpClient";
import { unwrapList } from "@/core/api/api";

// Áreas comunes del edificio (amenities).
// GET /api/buildings/:buildingId/common-areas -> 200 { success, data: [{ id,
// buildingId, name, description, capacity, isActive }] } (solo activas).
// Roles: SUPER_ADMIN o ADMIN/RECEPTION/MAINTENANCE/RESIDENT de ese edificio.
const normalizeArea = (raw = {}) => ({
  id: raw.id,
  buildingId: raw.buildingId,
  name: raw.name ?? "",
  description: raw.description ?? "",
  capacity: raw.capacity ?? null,
  isActive: raw.isActive ?? true,
});

export const listCommonAreas = async (buildingId) => {
  const response = await httpClient.get(
    `/buildings/${buildingId}/common-areas`,
  );
  return unwrapList(response).map(normalizeArea);
};

// Alta de área común. Solo SUPER_ADMIN o ADMIN del edificio.
// Body exacto: { name*, capacity* (entero > 0), description? }.
export const createCommonArea = async (
  buildingId,
  { name, capacity, description },
) => {
  const response = await httpClient.post(
    `/buildings/${buildingId}/common-areas`,
    {
      name: name?.trim(),
      capacity: Number(capacity),
      ...(description?.trim() ? { description: description.trim() } : {}),
    },
  );
  const body = response?.data?.data ?? response?.data ?? {};
  return normalizeArea(body);
};
