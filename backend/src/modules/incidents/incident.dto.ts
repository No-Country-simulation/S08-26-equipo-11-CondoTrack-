import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  IncidentSeverity,
  IncidentStatus,
} from "./incident.model.js";

export interface CreateIncidentDto {
  title: string;
  description: string;
  severity: IncidentSeverity;
}

export interface UpdateIncidentDto {
  status?: IncidentStatus;
  assignedToPersonId?: string | null;
}

export interface ListIncidentsDto {
  status?: IncidentStatus;
}

const isUuid = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function validateCreateIncident(body: unknown): CreateIncidentDto {
  const data = body as Record<string, unknown>;

  if (
    typeof data.title !== "string" ||
    data.title.trim().length === 0 ||
    data.title.length > 150
  ) {
    throw new Error("title debe ser un texto de entre 1 y 150 caracteres");
  }

  if (
    typeof data.description !== "string" ||
    data.description.trim().length === 0
  ) {
    throw new Error("description es obligatorio");
  }

  if (
    typeof data.severity !== "string" ||
    !INCIDENT_SEVERITIES.includes(data.severity as IncidentSeverity)
  ) {
    throw new Error("severity inválido");
  }

  return {
    title: data.title.trim(),
    description: data.description.trim(),
    severity: data.severity as IncidentSeverity,
  };
}

export function validateListIncidents(
  query: Record<string, unknown>,
): ListIncidentsDto {
  if (query.status === undefined) {
    return {};
  }

  if (
    typeof query.status !== "string" ||
    !INCIDENT_STATUSES.includes(query.status as IncidentStatus)
  ) {
    throw new Error("status inválido");
  }

  return {
    status: query.status as IncidentStatus,
  };
}

export function validateUpdateIncident(body: unknown): UpdateIncidentDto {
  const data = body as Record<string, unknown>;
  const result: UpdateIncidentDto = {};

  if (data.status !== undefined) {
    if (
      typeof data.status !== "string" ||
      !INCIDENT_STATUSES.includes(data.status as IncidentStatus)
    ) {
      throw new Error("status inválido");
    }

    result.status = data.status as IncidentStatus;
  }

  if (data.assignedToPersonId !== undefined) {
    if (data.assignedToPersonId !== null && !isUuid(data.assignedToPersonId)) {
      throw new Error("assignedToPersonId debe ser un UUID válido");
    }

    result.assignedToPersonId = data.assignedToPersonId as string | null;
  }

  return result;
}
