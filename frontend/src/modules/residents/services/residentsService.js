import httpClient from "@/core/api/httpClient";
import { unwrapList, unwrapObject } from "@/core/api/api";

// Contratos del backend (solo SUPER_ADMIN o ADMIN del edificio):
// - GET  /api/units/:unitId/residents -> 200 { success, data: ResidentLink[] }
// - POST /api/units/:unitId/residents -> 201 { success, data: ResidentLink }
//   body exacto: { email }. 404 unidad/email, 409 ya vinculado o sin persona.
const normalizeResidentLink = (raw = {}, unit = {}) => {
  const fullName =
    raw.fullName ??
    `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim();

  return {
    id: raw.userId ?? raw.personId ?? raw.id,
    personId: raw.personId ?? null,
    userId: raw.userId ?? null,
    unitId: raw.unitId ?? unit.id,
    buildingId: unit.buildingId,
    name: fullName || raw.email || "",
    unit: unit.code ?? "",
    email: raw.email ?? "",
    relationshipType: raw.relationshipType ?? "RESIDENT",
    startDate: raw.startDate ?? null,
    endDate: raw.endDate ?? null,
    // Campos de la fila local que el backend no trae:
    building: "",
    phone: "—",
    type: "Inquilino",
    since: raw.startDate
      ? new Date(raw.startDate).toLocaleDateString("es-AR", {
          month: "short",
          year: "numeric",
        })
      : "—",
    status: "active",
  };
};

export const listUnitResidents = async (unit) => {
  const response = await httpClient.get(`/units/${unit.id}/residents`);
  return unwrapList(response).map((raw) => normalizeResidentLink(raw, unit));
};

export const linkResident = async (unit, email) => {
  const response = await httpClient.post(`/units/${unit.id}/residents`, {
    email: email?.trim(),
  });
  return normalizeResidentLink(unwrapObject(response), unit);
};
