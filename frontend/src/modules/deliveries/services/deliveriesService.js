import httpClient from "@/core/api/httpClient";
import { unwrapList, unwrapObject } from "@/core/api/api";

// Contratos del backend (SUPER_ADMIN o RECEPTION/ADMIN del edificio):
// - GET   /api/buildings/:buildingId/deliveries?status= -> 200 { success, data: Delivery[] }
//   status enum: RECEIVED/NOTIFIED/PICKED_UP/RETURNED/LOST (opcional).
// - POST  /api/units/:unitId/deliveries -> 201 { success, data: Delivery }
//   body exacto: { recipientPersonId* (uuid), carrier* (enum), trackingNumber? (<=100) }.
// - PATCH /api/deliveries/:id/deliver -> 200 { success, data: Delivery } (PICKED_UP).
//   Sin body. 409 si ya no está pendiente de entrega.
// Solo conexión: ningún contexto ni pantalla consume esto todavía.
export const CARRIERS = [
  "Mercado Libre",
  "Correo Argentino",
  "Andreani",
  "OCA",
  "DHL",
  "Otro",
];

export const DELIVERY_STATUSES = [
  "RECEIVED",
  "NOTIFIED",
  "PICKED_UP",
  "RETURNED",
  "LOST",
];

// Mapeo a los estados que usa la UI actual (mock). Los no mapeados viajan
// crudos en `status`; StatusBadge los mostrará al cablear la UI.
const UI_STATUS = {
  RECEIVED: "pending",
  NOTIFIED: "notified",
  PICKED_UP: "delivered",
};

const normalizeDelivery = (raw = {}) => {
  const recipient = raw.recipient ?? null;
  const unit = raw.unit ?? null;

  return {
    id: raw.id,
    buildingId: raw.buildingId,
    unitId: raw.unitId,
    recipientPersonId: raw.recipientPersonId ?? null,
    // El listado proyecta recipient{firstName,lastName} y unit{code,floor}.
    // Si vinieran solo los ids (create), quedan vacíos y la UI los resuelve
    // contra /units/:id/residents.
    resident: [recipient?.firstName, recipient?.lastName]
      .filter(Boolean)
      .join(" "),
    unit: unit?.code ?? "",
    unitFloor: unit?.floor ?? null,
    receivedByUserId: raw.receivedByUserId ?? null,
    pickedUpByUserId: raw.pickedUpByUserId ?? null,
    carrier: raw.carrier ?? "",
    trackingNumber: raw.trackingNumber ?? "",
    description: "",
    received: raw.receivedAt ?? raw.createdAt ?? null,
    status: raw.status ?? "",
    uiStatus: UI_STATUS[raw.status] ?? raw.status ?? "",
    notifiedAt: raw.notifiedAt ?? null,
    pickedUpAt: raw.pickedUpAt ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};

export const listBuildingDeliveries = async (buildingId, { status } = {}) => {
  const response = await httpClient.get(`/buildings/${buildingId}/deliveries`, {
    params: status ? { status } : {},
  });
  return unwrapList(response).map(normalizeDelivery);
};

// GET /api/deliveries/mine[?status=] — deliveries de las unidades del
// residente autenticado (el backend resuelve sus UnitPeople vigentes).
// Exige rol RESIDENT (403 si no). Sin paginado: devuelve el array.
export const listMyDeliveries = async ({ status } = {}) => {
  const response = await httpClient.get("/deliveries/mine", {
    params: status ? { status } : {},
  });
  return unwrapList(response).map(normalizeDelivery);
};

export const registerDelivery = async (
  unitId,
  { recipientPersonId, carrier, trackingNumber },
) => {
  const response = await httpClient.post(`/units/${unitId}/deliveries`, {
    recipientPersonId,
    carrier,
    ...(trackingNumber?.trim() ? { trackingNumber: trackingNumber.trim() } : {}),
  });
  return normalizeDelivery(unwrapObject(response));
};

export const markPickedUp = async (deliveryId) => {
  const response = await httpClient.patch(
    `/deliveries/${deliveryId}/deliver`,
  );
  return normalizeDelivery(unwrapObject(response));
};
