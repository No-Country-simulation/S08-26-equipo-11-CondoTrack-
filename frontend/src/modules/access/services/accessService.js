import httpClient from "@/core/api/httpClient";
import { unwrapList, unwrapObject } from "@/core/api/api";

// Contratos del backend:
// - POST /api/units/:unitId/visits -> 201 { id, qrToken, qrTokenHash (=token),
//   qrImage (dataURL real), status PENDING, validFrom/validUntil, buildingId,
//   unit{id,code}, authorizedByUserId, visitor{id,firstName,lastName,
//   documentType,documentNumber}, createdAt }.
//   Body exacto: { visitorName* (2-100), visitorDni* (3-50),
//   estimatedAt* (ISO con offset) }. Validez: 60 min desde lo estimado.
//   Roles: RESIDENT vinculado a la unidad, ADMIN del edificio o SUPER_ADMIN.
// - POST /api/access/validate -> 200 { id, status, validFrom/validUntil,
//   visitor{...}, unit{id,code}, event{id,eventType,accessMethod,occurredAt} }.
//   Body: { qrToken* }. Registra el ENTRY y pasa la autorización a READ.
//   Roles: RECEPTION/ADMIN/SUPER_ADMIN (con alcance por edificio).
//   400 token inexistente o vencido.
// - GET  /api/access/search?query= -> 200 [{ id, status, validFrom/validUntil,
//   visitor{...}, unit{id,code}, building{id,name} }]. Mismos roles, acotado
//   a sus edificios.
// - PATCH /api/access/:id/exit -> 200 { ... + event EXIT }. Exige ENTRY previo
//   y rechaza duplicados (400). Mismos roles.
// Solo conexión: los contextos/pantallas deciden qué exponen.
const normalizeVisit = (raw = {}) => ({
  id: raw.id,
  buildingId: raw.buildingId ?? null,
  unitId: raw.unit?.id ?? raw.unitId ?? null,
  unit: raw.unit?.code ?? "",
  visitorId: raw.visitor?.id ?? null,
  visitorName:
    `${raw.visitor?.firstName ?? ""} ${raw.visitor?.lastName ?? ""}`.trim(),
  visitorDni: raw.visitor?.documentNumber ?? "",
  documentType: raw.visitor?.documentType ?? "DNI",
  status: raw.status ?? "",
  validFrom: raw.validFrom ?? null,
  validUntil: raw.validUntil ?? null,
  qrToken: raw.qrToken ?? null,
  // qrTokenHash en la respuesta contiene el TOKEN (alias de compatibilidad),
  // nunca el hash guardado. No persistirlo más allá de la sesión visible.
  qrImage: raw.qrImage ?? null,
  authorizedByUserId: raw.authorizedByUserId ?? null,
  createdAt: raw.createdAt ?? null,
  // Campos de la fila local que el backend no trae:
  name: `${raw.visitor?.firstName ?? ""} ${raw.visitor?.lastName ?? ""}`.trim(),
  relation: "Visita",
  validUntilLabel: raw.validUntil ?? "",
  note: "",
});

export const createVisit = async (
  unitId,
  { visitorName, visitorDni, estimatedAt },
) => {
  const response = await httpClient.post(`/units/${unitId}/visits`, {
    visitorName: visitorName?.trim(),
    visitorDni: visitorDni?.trim(),
    estimatedAt,
  });
  return normalizeVisit(unwrapObject(response));
};

export const validateQr = async (qrToken) => {
  const response = await httpClient.post("/access/validate", {
    qrToken: qrToken?.trim(),
  });
  const body = unwrapObject(response);
  const visitor = body.visitor ?? {};
  const unit = body.unit ?? {};
  return {
    ...normalizeVisit({
      ...body,
      unitId: unit.id,
      visitorName: `${visitor.firstName ?? ""} ${visitor.lastName ?? ""}`.trim(),
    }),
    name: `${visitor.firstName ?? ""} ${visitor.lastName ?? ""}`.trim(),
    relation: `${visitor.documentType ?? "DNI"} ${visitor.documentNumber ?? ""}`.trim(),
    event: body.event ?? null,
  };
};

export const searchVisits = async (query) => {
  const response = await httpClient.get("/access/search", {
    params: { query: query?.trim() },
  });
  return unwrapList(response).map((raw) =>
    normalizeVisit({
      ...raw,
      unitId: raw.unit?.id,
      visitorName: `${raw.visitor?.firstName ?? ""} ${raw.visitor?.lastName ?? ""}`.trim(),
    }),
  );
};

export const registerExit = async (authorizationId) => {
  const response = await httpClient.patch(`/access/${authorizationId}/exit`);
  const body = unwrapObject(response);
  return normalizeVisit({
    ...body,
    unitId: body.unit?.id,
    visitorName: `${body.visitor?.firstName ?? ""} ${body.visitor?.lastName ?? ""}`.trim(),
  });
};
