export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMINISTRATOR: "administrator",
  RECEPTIONIST: "receptionist",
};

// SUPER_ADMIN controla toda la plataforma (alta de edificios).
// ADMINISTRATOR gestiona los edificios a su cargo (unidades, amenidades).
// RECEPTIONIST (portero/recepcionista) solo opera accesos y deliveries.
export const canCreateBuildings = (role) => role === ROLES.SUPER_ADMIN;
export const canManageBuildingResources = (role) =>
  role === ROLES.SUPER_ADMIN || role === ROLES.ADMINISTRATOR;
