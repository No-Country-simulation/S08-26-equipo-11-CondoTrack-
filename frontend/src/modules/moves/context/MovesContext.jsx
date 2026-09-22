import { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import { MOVES } from "@/modules/moves/data/moves.data";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useActorLabel } from "@/modules/auth/hooks/useActorLabel";
import { useNotificationsStore } from "@/modules/notifications/context/NotificationsContext";

const MovesContext = createContext(null);

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  rejected: "Rechazada",
};

export function MovesProvider({ children }) {
  const [moves, setMoves] = useState(MOVES);
  const { logActivity } = useActivityLog();
  const actor = useActorLabel();
  const { notify } = useNotificationsStore();

  const forUnit = (unit) => moves.filter((move) => move.unit === unit);
  const forBuilding = (buildingId) => moves.filter((move) => move.buildingId === buildingId);

  const requestMove = ({ buildingId, unit, resident, type, date, time, notes }) => {
    const trimmedUnit = unit.trim();
    if (!buildingId || !trimmedUnit || !resident || !type || !date || !time) {
      return { success: false, error: "Completá edificio, unidad, tipo, fecha y horario." };
    }

    const overlaps = moves.some(
      (move) =>
        move.buildingId === buildingId &&
        move.date === date &&
        move.status !== "rejected" &&
        move.time === time,
    );
    if (overlaps) {
      return { success: false, error: "Ya hay una mudanza programada en ese horario para este edificio." };
    }

    const nextId = moves.length ? Math.max(...moves.map((move) => move.id)) + 1 : 1;
    setMoves((prev) => [
      ...prev,
      {
        id: nextId,
        buildingId,
        unit: trimmedUnit,
        resident,
        type,
        date,
        time,
        notes: notes?.trim() || "",
        status: "pending",
      },
    ]);
    logActivity({ actor, action: `Solicitó "${type}" para la unidad ${trimmedUnit} el ${date}`, buildingId });
    return { success: true };
  };

  const updateStatus = (id, status) => {
    const move = moves.find((m) => m.id === id);
    if (!move) return;
    setMoves((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    logActivity({
      actor,
      action: `Cambió la mudanza de unidad ${move.unit} a "${STATUS_LABELS[status] || status}"`,
      buildingId: move.buildingId,
    });
    notify({
      type: "move",
      title: status === "confirmed" ? "Mudanza confirmada" : "Mudanza rechazada",
      body: `${move.type} · ${move.date} ${move.time}`,
      buildingId: move.buildingId,
      unit: move.unit,
    });
  };

  return (
    <MovesContext.Provider value={{ moves, forUnit, forBuilding, requestMove, updateStatus }}>
      {children}
    </MovesContext.Provider>
  );
}

MovesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export function useMoves() {
  const context = useContext(MovesContext);
  if (!context) {
    throw new Error("useMoves debe usarse dentro de un MovesProvider");
  }
  return context;
}
