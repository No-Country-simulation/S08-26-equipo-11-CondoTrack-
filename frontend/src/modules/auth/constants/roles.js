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

// Perfiles del selector /inicio: cada rol ve solo el suyo
// (SUPER_ADMIN los ve todos). Sin rol no se ve ninguno.
export const canAccessProfile = (profileKey, role) => {
  if (role === ROLES.SUPER_ADMIN) return true;

  if (profileKey === "administracion") return role === ROLES.ADMIN;
  if (profileKey === "residente") return role === ROLES.RESIDENT;
  if (profileKey === "recepcion")
    return role === ROLES.RECEPTION || role === ROLES.MAINTENANCE;

  return false;
};
