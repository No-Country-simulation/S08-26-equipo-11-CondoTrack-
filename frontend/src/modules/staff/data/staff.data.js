export const STAFF_ROLES = {
  RECEPTIONIST: "receptionist",
  MAINTENANCE: "maintenance",
};

export const STAFF = [
  {
    id: 1,
    name: "Jorge Medina",
    role: STAFF_ROLES.RECEPTIONIST,
    buildingId: 1,
    staffType: "interno",
    company: null,
    phone: "+54 11 4820-0002",
    email: "porteria.tm@condotrack.com.ar",
  },
  {
    id: 2,
    name: "FríoTec SA",
    role: STAFF_ROLES.MAINTENANCE,
    buildingId: 1,
    staffType: "externo",
    company: "FríoTec SA",
    phone: "+54 11 4555-1212",
    email: "contacto@friotec.com.ar",
  },
];
