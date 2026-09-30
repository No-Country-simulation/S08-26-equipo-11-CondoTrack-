import httpClient from "@/core/api/httpClient";
import { unwrapList, unwrapObject } from "@/core/api/api";

// Contratos del backend:
// - GET  /api/buildings/:buildingId/reservations -> 200 { success, data: Reservation[] }
//   (todos los estados, orden startAt ASC). Solo ADMIN del edificio o SUPER_ADMIN.
// - POST /api/common-areas/:id/reservations -> 201 { success, data: Reservation PENDING }
//   Requiere RESIDENT global + del edificio + residente de la unidad indicada.
//   Body exacto: { unitId* (uuid), startAt* (ISO con offset, futura),
//   endAt* (ISO con offset, posterior a startAt), notes? (<=2000) }.
//   404 área/unidad, 409 solape de horario.
// Solo conexión: ningún contexto ni pantalla consume esto todavía.
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

const normalizeReservation = (raw = {}) => ({
  id: raw.id,
  buildingId: raw.buildingId,
  commonAreaId: raw.commonAreaId ?? null,
  // BRECHAS vs UI mock: el backend no trae nombre del espacio (se cruza con
  // áreas comunes por commonAreaId), ni nombre de residente (requestedByUserId),
  // ni invitados, ni fecha/hora partidas (vienen startAt/endAt ISO).
  space: "",
  resident: "",
  unit: "",
  unitId: raw.unitId ?? null,
  requestedByUserId: raw.requestedByUserId ?? null,
  date: raw.startAt ?? null,
  time: raw.startAt && raw.endAt ? `${raw.startAt} – ${raw.endAt}` : "",
  startAt: raw.startAt ?? null,
  endAt: raw.endAt ?? null,
  guests: null,
  status: raw.status ?? "",
  uiStatus: UI_STATUS[raw.status] ?? raw.status ?? "",
  notes: raw.notes ?? "",
  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});

export const listBuildingReservations = async (buildingId) => {
  const response = await httpClient.get(
    `/buildings/${buildingId}/reservations`,
  );
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
