import { RESERVATIONS, SPACES } from "@/modules/reservations/data/reservations.data";

export const useReservations = () => {
  const forUnit = (unit) => RESERVATIONS.filter((r) => r.unit === unit);
  const forBuilding = (buildingId) => RESERVATIONS.filter((r) => r.buildingId === buildingId);
  const hasReservation = (spaceName) => RESERVATIONS.some((r) => r.space === spaceName);

  return { reservations: RESERVATIONS, spaces: SPACES, forUnit, forBuilding, hasReservation };
};
