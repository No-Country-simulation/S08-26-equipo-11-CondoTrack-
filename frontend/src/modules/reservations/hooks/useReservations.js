import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import {
  listBuildingReservations,
  listMyReservations,
} from "@/modules/reservations/services/reservationsService";

// Reservas reales. Antes este hook devolvía datos mock estáticos y por eso la
// UI mostraba datos que no existían en la base.
// - forBuilding(buildingId): requiere ADMIN/SUPER_ADMIN del edificio.
// - forMine(): requiere rol RESIDENT; el backend ya filtra por sus unidades.
export const useReservations = () => {
  const { isAuthenticated, user } = useAuth();
  const [byBuilding, setByBuilding] = useState({});
  const [mine, setMine] = useState([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const isResident = Boolean(
    user?.roles?.some((role) => role.roleName === "RESIDENT"),
  );

  const fetchBuilding = useCallback(async (buildingId) => {
    if (!buildingId) return [];
    try {
      const items = await listBuildingReservations(buildingId);
      setByBuilding((prev) => ({ ...prev, [buildingId]: items }));
      return items;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isResident) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- limpia al cerrar sesión
      setMine([]);
      return;
    }
    let cancelled = false;
    setLoadingMine(true);
    listMyReservations()
      .then((items) => {
        if (!cancelled) setMine(items);
      })
      .catch(() => {
        if (!cancelled) setMine([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMine(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isResident]);

  const forBuilding = useCallback(
    (buildingId) => byBuilding[buildingId] ?? [],
    [byBuilding],
  );

  const forMine = useCallback(() => mine, [mine]);

  const refreshMine = useCallback(async () => {
    const items = await listMyReservations();
    setMine(items);
    return items;
  }, []);

  return {
    reservations: mine,
    forBuilding,
    fetchBuilding,
    forMine,
    refreshMine,
    loadingMine,
  };
};
