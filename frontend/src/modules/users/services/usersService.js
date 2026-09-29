import { USERS } from "@/modules/users/data/users.data";

// Servicio mock con el CONTRATO FUTURO del backend. Cuando existan los
// endpoints, cada función se reemplaza por su llamada httpClient según el
// comentario TODO(api) — la UI y el contexto no cambian.
// Formas: fila { id, email, status, firstName, lastName, phone,
// roles: [{ roleName, buildingId, unitId?, unitCode? }] }.

let store = USERS.map((user) => ({
  ...user,
  roles: user.roles.map((role) => ({ ...role })),
}));

const fullNameOf = (user) =>
  `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

// TODO(api): GET /api/users?search=&role=&buildingId=&page=&limit=
export const listUsers = async ({
  search = "",
  role = "",
  buildingId = "",
} = {}) => {
  const term = search.trim().toLowerCase();

  const users = store.filter((user) => {
    const matchesSearch =
      !term ||
      fullNameOf(user).toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term);
    const matchesRole =
      !role || user.roles.some((entry) => entry.roleName === role);
    const matchesBuilding =
      !buildingId ||
      user.roles.some((entry) => entry.buildingId === buildingId);
    return matchesSearch && matchesRole && matchesBuilding;
  });

  return { users, total: users.length };
};

// TODO(api): POST /api/users { firstName, lastName, documentType?,
// documentNumber?, phone?, email, password, role, buildingId }
export const createUser = async ({
  firstName,
  lastName,
  email,
  phone,
  role,
  buildingId,
}) => {
  const row = {
    id: `u-local-${Date.now()}`,
    firstName: firstName?.trim() ?? "",
    lastName: lastName?.trim() ?? "",
    email: email?.trim() ?? "",
    phone: phone?.trim() || "—",
    status: "ACTIVE",
    roles: role ? [{ roleName: role, buildingId: buildingId ?? null }] : [],
  };
  store = [...store, row];
  return row;
};

// TODO(api): POST /api/buildings/:buildingId/members { email?, userId, role, unitId? }
export const assignRole = async ({ userId, role, buildingId, unit }) => {
  store = store.map((user) => {
    if (user.id !== userId) return user;

    const others = user.roles.filter(
      (entry) =>
        !(
          entry.roleName === role &&
          (entry.buildingId ?? null) === (buildingId ?? null)
        ),
    );

    return {
      ...user,
      roles: [
        ...others,
        {
          roleName: role,
          buildingId: buildingId ?? null,
          unitId: unit?.id ?? null,
          unitCode: unit?.code ?? null,
        },
      ],
    };
  });

  const updated = store.find((user) => user.id === userId);
  if (!updated) throw new Error("Usuario no encontrado.");
  return updated;
};

// TODO(api): DELETE /api/buildings/:buildingId/members/:userId (o PATCH de roles)
export const removeRole = async ({ userId, role, buildingId }) => {
  store = store.map((user) =>
    user.id !== userId
      ? user
      : {
          ...user,
          roles: user.roles.filter(
            (entry) =>
              !(
                entry.roleName === role &&
                (entry.buildingId ?? null) === (buildingId ?? null)
              ),
          ),
        },
  );

  const updated = store.find((user) => user.id === userId);
  if (!updated) throw new Error("Usuario no encontrado.");
  return updated;
};
