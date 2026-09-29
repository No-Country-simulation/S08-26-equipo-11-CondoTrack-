// Seed de usuarios para el módulo Usuarios (mock).
// Las filas respetan el contrato futuro del backend:
// GET /api/users -> { success, data: [{ id, email, status, firstName,
// lastName, phone, roles: [{ roleName, buildingId }] }], pagination }.
// Los buildingId usan los UUID del seed del backend (norte ...002,
// sur ...003, principal ...001) para que los filtros coincidan con la API.
export const USERS = [
  {
    id: "u-super-1",
    firstName: "Super",
    lastName: "Admin",
    email: "superadmin@example.com",
    phone: "—",
    status: "ACTIVE",
    roles: [
      {
        roleName: "SUPER_ADMIN",
        buildingId: "00000000-0000-0000-0000-000000000001",
      },
    ],
  },
  {
    id: "u-admin-1",
    firstName: "Admin",
    lastName: "Norte",
    email: "admin@condotrack.test",
    phone: "+54 11 4820-0002",
    status: "ACTIVE",
    roles: [
      {
        roleName: "ADMIN",
        buildingId: "00000000-0000-0000-0000-000000000002",
      },
    ],
  },
  {
    id: "u-recep-1",
    firstName: "Portería",
    lastName: "Norte",
    email: "recepcion.norte@condotrack.test",
    phone: "+54 11 4820-0001",
    status: "ACTIVE",
    roles: [
      {
        roleName: "RECEPTION",
        buildingId: "00000000-0000-0000-0000-000000000002",
      },
    ],
  },
  {
    id: "u-res-1",
    firstName: "Valentina",
    lastName: "Rodríguez",
    email: "val.rodriguez@gmail.com",
    phone: "+54 11 4823-7891",
    status: "ACTIVE",
    roles: [
      {
        roleName: "RESIDENT",
        buildingId: "00000000-0000-0000-0000-000000000002",
        unitId: null,
        unitCode: "8B",
      },
    ],
  },
  {
    id: "u-norole-1",
    firstName: "Google",
    lastName: "SinRol",
    email: "google.sinrol@gmail.com",
    phone: "—",
    status: "ACTIVE",
    roles: [],
  },
];
