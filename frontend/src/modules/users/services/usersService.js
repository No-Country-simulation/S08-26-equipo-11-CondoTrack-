import httpClient from "@/core/api/httpClient";
import { unwrapObject } from "@/core/api/api";

const normalizeRow = (raw = {}) => {
  const person = raw.person ?? {};
  const fullName =
    `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
    raw.fullName ||
    "";

  return {
    id: raw.id,
    email: raw.email ?? "",
    status: raw.status ?? "ACTIVE",
    firstName: person.firstName ?? raw.firstName ?? "",
    lastName: person.lastName ?? raw.lastName ?? "",
    phone: person.phone ?? raw.phone ?? "—",
    documentType: person.documentType ?? null,
    documentNumber: person.documentNumber ?? null,
    roles: Array.isArray(raw.roles)
      ? raw.roles.map((entry) => ({
          roleName: entry.roleName ?? entry,
          buildingId: entry.buildingId ?? null,
          unitId: entry.unitId ?? null,
          unitCode: entry.unitCode ?? null,
        }))
      : [],
    name: fullName || raw.email || "",
  };
};

const cleanProfilePayload = (profile = {}) => {
  const payload = {};
  const text = (value) => (typeof value === "string" ? value.trim() : value);

  if (text(profile.nombre ?? profile.firstName)) {
    payload.firstName = text(profile.nombre ?? profile.firstName);
  }
  if (text(profile.apellido ?? profile.lastName)) {
    payload.lastName = text(profile.apellido ?? profile.lastName);
  }
  if (profile.tipoDocumento ?? profile.documentType) {
    payload.documentType = profile.tipoDocumento ?? profile.documentType;
  }
  if (text(profile.documento ?? profile.documentNumber)) {
    payload.documentNumber = text(profile.documento ?? profile.documentNumber);
  }
  if (text(profile.telefono ?? profile.phone)) {
    payload.phone = text(profile.telefono ?? profile.phone);
  }

  return payload;
};

export const listUsers = async ({
  buildingId = "",
  role = "",
  page = 1,
  limit = 25,
} = {}) => {
  const params = { page, limit };
  if (buildingId) params.buildingId = buildingId;
  if (role) params.role = role;

  const response = await httpClient.get("/users", { params });
  const body = response?.data?.data ?? {};
  const items = Array.isArray(body.items) ? body.items : [];
  const pagination = body.pagination ?? {};

  return {
    users: items.map(normalizeRow),
    total: pagination.totalItems ?? items.length,
    page: pagination.page ?? page,
    totalPages: pagination.totalPages ?? 1,
    limit: pagination.limit ?? limit,
  };
};

export const getUser = async (id) => {
  const response = await httpClient.get(`/users/${id}`);
  const data = unwrapObject(response);
  const person = data.person ?? {};

  return {
    id: data.user?.id ?? data.id,
    email: data.user?.email ?? data.email ?? "",
    status: data.user?.status ?? data.status ?? "ACTIVE",
    createdAt: data.user?.createdAt ?? null,
    lastLoginAt: data.audit?.lastLoginAt ?? data.user?.lastLoginAt ?? null,
    loginCount: data.audit?.loginCount ?? null,
    firstName: person.firstName ?? "",
    lastName: person.lastName ?? "",
    phone: person.phone ?? "—",
    documentType: person.documentType ?? null,
    documentNumber: person.documentNumber ?? null,
    roles: Array.isArray(data.roles) ? data.roles : [],
    buildings: Array.isArray(data.buildings) ? data.buildings : [],
  };
};

export const updateUserProfile = async (id, profile) => {
  const payload = cleanProfilePayload(profile);
  const response = await httpClient.patch(`/users/${id}/profile`, payload);
  const person = unwrapObject(response);

  return {
    firstName: person.firstName ?? "",
    lastName: person.lastName ?? "",
    phone: person.phone ?? "—",
    documentType: person.documentType ?? null,
    documentNumber: person.documentNumber ?? null,
  };
};

export const manageUser = async (id, { status, roles } = {}) => {
  const payload = {};
  if (status) payload.status = status;
  if (roles) {
    payload.roles = roles.map((entry) => ({
      buildingId: entry.buildingId,
      roleName: entry.roleName,
    }));
  }

  const response = await httpClient.patch(`/users/${id}/manage`, payload);
  return normalizeRow(unwrapObject(response));
};
