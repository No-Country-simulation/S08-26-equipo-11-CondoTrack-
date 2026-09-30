import httpClient from "@/core/api/httpClient";
import { apiErrorMessage, unwrapList, unwrapObject } from "@/core/api/api";

// Se mantiene el nombre para no romper importadores existentes.
export const getApiErrorMessage = apiErrorMessage;

const normalizeBuilding = (raw = {}) => ({
  id: raw.id,
  name: raw.name ?? "",
  address: raw.address ?? "",
  city: raw.city ?? "",
  state: raw.state ?? "",
  zipCode: raw.zipCode ?? "",
  description: raw.description ?? "",
  floors: raw.numberOfFloors ?? 0,
  // numberOfUnits del backend es CAPACIDAD declarada, no conteo real.
  capacity: raw.numberOfUnits ?? 0,
  // Ocupación real: la completa el contexto vía unitsService (null = cargando).
  units: null,
  isActive: raw.isActive ?? true,
  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});

export const listBuildings = async () => {
  const response = await httpClient.get("/buildings");
  return unwrapList(response).map(normalizeBuilding);
};

export const getBuilding = async (id) => {
  const response = await httpClient.get(`/buildings/${id}`);
  return normalizeBuilding(unwrapObject(response));
};

export const createBuilding = async ({
  name,
  address,
  city,
  state,
  floors,
  units,
  zipCode,
  description,
}) => {
  const response = await httpClient.post("/buildings", {
    name: name?.trim(),
    address: address?.trim(),
    city: city?.trim(),
    state: state?.trim(),
    numberOfFloors: Number(floors),
    numberOfUnits: Number(units),
    ...(zipCode?.trim() ? { zipCode: zipCode.trim() } : {}),
    ...(description?.trim() ? { description: description.trim() } : {}),
  });
  return normalizeBuilding(unwrapObject(response));
};

// PATCH /api/buildings/:id -solo SUPER_ADMIN.
// Actualización parcial: solo se envían las claves presentes. El backend
// acepta únicamente { name?, address?, numberOfFloors? (entero >= 0),
// numberOfUnits? (entero >= 0), isActive? } y exige al menos un campo.
// OJO: no acepta city/state/zipCode/description (400 si se envían).
export const updateBuilding = async (id, patch = {}) => {
  const payload = {};
  if (patch.name !== undefined) payload.name = patch.name?.trim();
  if (patch.address !== undefined) payload.address = patch.address?.trim();
  if (patch.floors !== undefined) payload.numberOfFloors = Number(patch.floors);
  if (patch.units !== undefined) payload.numberOfUnits = Number(patch.units);
  if (patch.numberOfFloors !== undefined)
    payload.numberOfFloors = Number(patch.numberOfFloors);
  if (patch.numberOfUnits !== undefined)
    payload.numberOfUnits = Number(patch.numberOfUnits);
  if (patch.isActive !== undefined) payload.isActive = Boolean(patch.isActive);

  const response = await httpClient.patch(`/buildings/${id}`, payload);
  return normalizeBuilding(unwrapObject(response));
};
