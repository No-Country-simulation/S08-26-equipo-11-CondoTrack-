import httpClient from "@/core/api/httpClient";
import { unwrapList, unwrapObject } from "@/core/api/api";
import { normalizeEmail } from "@/shared/utils/validators";

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
    // El backend no devuelve el código de la unidad: hay que tomarlo del
    // objeto que envió el llamador, que puede no traerlo.
    unit: unit.code ?? raw.unitCode ?? "",
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
    // El vínculo al resident es lo que define si sigue vigente: `endDate` en
    // el pasado significa que ya no vive ahí. Hardcodear "active" haría que
    // todos los ResidentsContext ::forBuilding contaran igual.
    status:
      raw.endDate && new Date(raw.endDate) < new Date() ? "inactive" : "active",
  };
};

export const listUnitResidents = async (unit) => {
  const response = await httpClient.get(`/units/${unit.id}/residents`);
  return unwrapList(response).map((raw) => normalizeResidentLink(raw, unit));
};

export const linkResident = async (unit, email) => {
  // El backend busca la cuenta por email. Si guardó la dirección en minúsculas
  // y acá se manda con otro case, el POST responde 404 y el vínculo falla sin
  // motivo visible, así que se normaliza siempre del mismo lado.
  const response = await httpClient.post(`/units/${unit.id}/residents`, {
    email: normalizeEmail(email),
  });
  return normalizeResidentLink(unwrapObject(response), unit);
};
