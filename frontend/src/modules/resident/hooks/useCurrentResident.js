import { useAuth } from "@/modules/auth/contexts/AuthContext";

/**
 * Adapta el usuario logueado a la forma que espera el portal del residente
 * ({ id, buildingId, name, unit, building, email, ... }).
 *
 * Todo sale de la sesión real. Antes esta función sembraba sus propios huecos
 * con un residente de ejemplo, así que un usuario sin unidad asignada veía en
 * pantalla la unidad, el edificio y el teléfono de otra persona. Un dato que
 * no existe se devuelve como null y se explica con las etiquetas, nunca se
 * inventa.
 */
export const useCurrentResident = () => {
  const { user } = useAuth();

  const fullName = `${user?.nombre ?? ""} ${user?.apellido ?? ""}`.trim();
  const firstUnit = user?.units?.[0] ?? null;
  const firstBuilding = user?.buildings?.[0] ?? null;
  const name = fullName || user?.email || "";

  return {
    id: user?.id ?? null,
    name,
    email: user?.email ?? "",
    phone: user?.telefono || null,
    unit: firstUnit?.code ?? null,
    unitId: firstUnit?.id ?? null,
    unitFloor: firstUnit?.floor ?? null,
    unitType: firstUnit?.unitType ?? null,
    building: firstBuilding?.name ?? null,
    buildingId: firstBuilding?.id ?? firstUnit?.buildingId ?? null,

    // Etiquetas listas para pintar. Un usuario sin rol de residente no tiene
    // unidad: decirlo es más útil que mostrar un código que no es suyo.
    unitLabel: firstUnit?.code ?? "sin unidad",
    buildingLabel: firstBuilding?.name ?? "sin edificio",
    hasUnit: Boolean(firstUnit),
    hasBuilding: Boolean(firstBuilding),
  };
};
