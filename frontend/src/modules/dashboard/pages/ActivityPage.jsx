import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";

export const ActivityPage = () => {
  const { activities } = useActivityLog();
  const { getBuildingById } = useBuildings();

  return (
    <div className="ct-main-scroll">
      <div className="ct-card overflow-hidden">
        <div className="ct-card-header">
          <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            Historial de acciones — todos los edificios
          </p>
        </div>
        <div>
          {activities.map((entry) => (
            <div key={entry.id} className="ct-row ct-row-hover d-flex align-items-start gap-3">
              <span className="ct-font-mono ct-text-muted flex-shrink-0" style={{ fontSize: "0.75rem", width: 130 }}>{entry.timestamp}</span>
              <div className="flex-grow-1 min-w-0">
                <p className="mb-0" style={{ color: "var(--color-ink)" }}>{entry.action}</p>
                <p className="ct-font-mono ct-text-faint mb-0 mt-1" style={{ fontSize: "0.6875rem" }}>
                  {entry.actor} · {entry.buildingId ? getBuildingById(entry.buildingId).name : "Sistema"}
                </p>
              </div>
            </div>
          ))}
        </div>
        {activities.length === 0 && (
          <div className="text-center py-5 ct-text-muted">Todavía no hay actividad registrada en esta sesión.</div>
        )}
      </div>
    </div>
  );
};
