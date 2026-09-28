export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  RECEPTION: "RECEPTION",
  MAINTENANCE: "MAINTENANCE",
  RESIDENT: "RESIDENT",
};

// SUPER_ADMIN controla toda la plataforma (alta de edificios).
// ADMIN gestiona los edificios a su cargo (unidades, amenidades).
// RECEPTION (portero/recepcionista) solo opera accesos y deliveries.
export const canCreateBuildings = (role) => role === ROLES.SUPER_ADMIN;
export const canManageBuildingResources = (role) =>
  role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
