import httpClient from "@/core/api/httpClient";
import { unwrapList, unwrapObject } from "@/core/api/api";

// Contratos del backend:
// - POST /api/buildings/:buildingId/units/:unitId/incidents -> 201
//   body: { title, description, severity }
// - GET /api/buildings/:buildingId/incidents?status= -> 200 (ADMIN/SUPER_ADMIN)
// - GET /api/incidents/mine?status= -> 200 (RESIDENT, solo sus unidades)
// - PATCH /api/incidents/:id -> 200

export const INCIDENT_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const INCIDENT_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

// Mapeo de estados del backend a los estados usados actualmente por la UI.
const UI_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "resolved",
};

// Mapeo de severidades del backend a los estados usados por la UI.
const UI_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "high",
};

const normalizeIncident = (raw = {}) => ({
  id: raw.id,
  buildingId: raw.buildingId,
  unitId: raw.unitId ?? null,

  // El backend actualmente devuelve IDs, no nombres legibles.
  resident: "",
  unit: "",

  reported: raw.createdAt ?? null,
  reportedByUserId: raw.reportedByUserId ?? null,
  assignedToPersonId: raw.assignedToPersonId ?? null,
  assigned: "",

  title: raw.title ?? "",
  description: raw.description ?? "",
  category: "",

  severity: raw.severity ?? "",
  uiSeverity: UI_SEVERITY[raw.severity] ?? raw.severity ?? "",

  status: raw.status ?? "",
  uiStatus: UI_STATUS[raw.status] ?? raw.status ?? "",

  resolvedAt: raw.resolvedAt ?? null,
  createdAt: raw.createdAt ?? null,
  updatedAt: raw.updatedAt ?? null,
});

// Obtener incidentes de un edificio.
export const listBuildingIncidents = async (buildingId, { status } = {}) => {
  if (!buildingId) {
    throw new Error("buildingId es requerido para consultar incidentes.");
  }

  try {
    const response = await httpClient.get(
      `/buildings/${buildingId}/incidents`,
      {
        params: status ? { status } : {},
      },
    );

    return unwrapList(response).map(normalizeIncident);
  } catch (error) {
    console.error("ERROR GET INCIDENTS");

    throw error;
  }
};

// Crear un incidente.
export const reportIncident = async (
  buildingId,
  unitId,
  { title, description, severity },
) => {
  if (!buildingId) {
    throw new Error("buildingId es requerido.");
  }

  if (!unitId) {
    throw new Error("unitId es requerido.");
  }

  try {
    const response = await httpClient.post(
      `/buildings/${buildingId}/units/${unitId}/incidents`,
      {
        title: title?.trim(),
        description: description?.trim(),
        severity,
      },
    );

    return normalizeIncident(unwrapObject(response));
  } catch (error) {
    console.error("ERROR POST INCIDENT:", {
      buildingId,
      unitId,
      payload: {
        title: title?.trim(),
        description: description?.trim(),
        severity,
      },
      statusCode: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });

    throw error;
  }
};

// Incidentes reportados por el residente autenticado.
export const listMyIncidents = async ({ status } = {}) => {
  try {
    const response = await httpClient.get("/incidents/mine", {
      params: status ? { status } : {},
    });

    return unwrapList(response).map(normalizeIncident);
  } catch (error) {
    console.error("ERROR GET MY INCIDENTS");
    console.log("statusCode:", error.response?.status);
    console.log("response.data:", error.response?.data);
    throw error;
  }
};

// Actualizar un incidente.
export const updateIncident = async (incidentId, patch = {}) => {
  if (!incidentId) {
    throw new Error("incidentId es requerido.");
  }

  const payload = {};

  if (patch.status !== undefined) {
    payload.status = patch.status;
  }

  if (patch.assignedToPersonId !== undefined) {
    payload.assignedToPersonId = patch.assignedToPersonId;
  }

  try {
    const response = await httpClient.patch(
      `/incidents/${incidentId}`,
      payload,
    );

    return normalizeIncident(unwrapObject(response));
  } catch (error) {
    console.error("ERROR PATCH INCIDENT:", {
      incidentId,
      payload,
      statusCode: error.response?.status,
      response: error.response?.data,
      message: error.message,
    });

    throw error;
  }
};
