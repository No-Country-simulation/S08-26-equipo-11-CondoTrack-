import httpClient from "@/core/api/httpClient";

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

export const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message ?? fallback;

export const listBuildings = async () => {
  const response = await httpClient.get("/buildings");
  const items = response.data?.data ?? response.data ?? [];
  return (Array.isArray(items) ? items : []).map(normalizeBuilding);
};

export const getBuilding = async (id) => {
  const response = await httpClient.get(`/buildings/${id}`);
  return normalizeBuilding(response.data?.data ?? response.data);
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
  return normalizeBuilding(response.data?.data ?? response.data);
};
