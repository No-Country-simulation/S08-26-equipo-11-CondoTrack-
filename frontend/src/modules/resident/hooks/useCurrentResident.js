import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { CURRENT_RESIDENT as MOCK_RESIDENT } from "@/modules/residents/data/residents.data";

// Adapta el usuario logueado a la forma que espera el portal del residente
// ({ id, buildingId, name, unit, building, email, ... }).
// Si la sesión no trae unidad/edificio (ej. Google sin rol asignado), usa la
// persona mock para que las pantallas sigan funcionando.
export const useCurrentResident = () => {
  const { user } = useAuth();

  if (!user) return MOCK_RESIDENT;

  const fullName = `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim();
  const firstUnit = user.units?.[0];
  const firstBuilding = user.buildings?.[0];

  return {
    ...MOCK_RESIDENT,
    id: user.id ?? MOCK_RESIDENT.id,
    name: fullName || user.email || MOCK_RESIDENT.name,
    email: user.email ?? MOCK_RESIDENT.email,
    phone: user.telefono || MOCK_RESIDENT.phone,
    unit: firstUnit?.code ?? MOCK_RESIDENT.unit,
    unitId: firstUnit?.id ?? null,
    unitFloor: firstUnit?.floor ?? null,
    unitType: firstUnit?.unitType ?? null,
    building: firstBuilding?.name ?? MOCK_RESIDENT.building,
    buildingId:
      firstBuilding?.id ?? firstUnit?.buildingId ?? MOCK_RESIDENT.buildingId,
  };
};
