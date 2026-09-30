import httpClient from "@/core/api/httpClient";
import { unwrapList, unwrapObject } from "@/core/api/api";

// Contratos del backend:
// - GET  /api/buildings/:buildingId/reservations -> 200 { success, data: Reservation[] }
//   (todos los estados, orden startAt ASC). Solo ADMIN del edificio o SUPER_ADMIN.
//   Cada fila trae commonArea{name,capacity}, unit{code,floor} y
//   requestedByUser{email, person{firstName,lastName}}.
// - GET  /api/reservations/mine -> 200 { success, data: Reservation[] }
//   Solo RESIDENT; filtrado por sus unidades activas. Mismo shape de detalle.
// - POST /api/common-areas/:id/reservations -> 201 { success, data: Reservation PENDING }
//   Requiere RESIDENT global + del edificio + residente de la unidad indicada.
//   Body exacto: { unitId* (uuid), startAt* (ISO con offset, futura),
//   endAt* (ISO con offset, posterior a startAt), notes? (<=2000) }.
//   404 área/unidad, 409 solape de horario.
export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "REJECTED",
];

// Mapeo a los estados que usa la UI actual (mock). Los no mapeados viajan
// crudos en `status`; StatusBadge los mostrará al cablear la UI.
const UI_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
};

const formatRange = (startAt, endAt) => {
  if (!startAt || !endAt) return "";
  const format = (value) =>
    new Date(value).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${format(startAt)} – ${format(endAt)}`;
};

const normalizeReservation = (raw = {}) => {
  const commonArea = raw.commonArea ?? null;
  const unit = raw.unit ?? null;
  const requestedByUser = raw.requestedByUser ?? null;
  const person = requestedByUser?.person ?? null;
  const residentName =
    [person?.firstName, person?.lastName].filter(Boolean).join(" ") || "";

  return {
    id: raw.id,
    buildingId: raw.buildingId,
    commonAreaId: raw.commonAreaId ?? null,
    unitId: raw.unitId ?? null,
    requestedByUserId: raw.requestedByUserId ?? null,

    // El backend proyecta el detalle en `list` y en `mine`; el create simple
    // no lo trae, por eso todo cae a string vacío.
    space: commonArea?.name ?? "",
    capacity: commonArea?.capacity ?? null,
    unit: unit?.code ?? "",
    unitFloor: unit?.floor ?? null,
    resident: residentName,
    residentEmail: requestedByUser?.email ?? "",

    date: raw.startAt ?? null,
    time: formatRange(raw.startAt, raw.endAt),
    startAt: raw.startAt ?? null,
    endAt: raw.endAt ?? null,
    guests: null,
    status: raw.status ?? "",
    uiStatus: UI_STATUS[raw.status] ?? raw.status ?? "",
    notes: raw.notes ?? "",
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};

export const listBuildingReservations = async (buildingId) => {
  const response = await httpClient.get(
    `/buildings/${buildingId}/reservations`,
  );
  return unwrapList(response).map(normalizeReservation);
};

// Reservas de las unidades del residente autenticado.
export const listMyReservations = async () => {
  const response = await httpClient.get("/reservations/mine");
  return unwrapList(response).map(normalizeReservation);
};

export const bookReservation = async (
  areaId,
  { unitId, startAt, endAt, notes },
) => {
  const response = await httpClient.post(
    `/common-areas/${areaId}/reservations`,
    {
      unitId,
      startAt,
      endAt,
      ...(notes?.trim() ? { notes: notes.trim().slice(0, 2000) } : {}),
    },
  );
  return normalizeReservation(unwrapObject(response));
};
