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
