/**
 * Vocabulario del historial de acciones.
 *
 * Vive aparte de ActivityLogContext para no mezclar constantes con componentes
 * (regla de fast refresh) y para que las pantallas que registran acciones
 * importen solo lo que necesitan.
 */

export const ENTITY_TYPES = {
  ACCESS: "access",
  BUILDING: "building",
  UNIT: "unit",
  RESIDENT: "resident",
  USER: "user",
  DELIVERY: "delivery",
  RESERVATION: "reservation",
  INCIDENT: "incident",
  MAINTENANCE: "maintenance",
  MOVE: "move",
};

export const ENTITY_LABELS = {
  [ENTITY_TYPES.ACCESS]: "Acceso",
  [ENTITY_TYPES.BUILDING]: "Edificio",
  [ENTITY_TYPES.UNIT]: "Unidad",
  [ENTITY_TYPES.RESIDENT]: "Residente",
  [ENTITY_TYPES.USER]: "Usuario",
  [ENTITY_TYPES.DELIVERY]: "Delivery",
  [ENTITY_TYPES.RESERVATION]: "Reserva",
  [ENTITY_TYPES.INCIDENT]: "Incidente",
  [ENTITY_TYPES.MAINTENANCE]: "Mantenimiento",
  [ENTITY_TYPES.MOVE]: "Mudanza",
};

export const RESULTS = { OK: "ok", ERROR: "error" };
