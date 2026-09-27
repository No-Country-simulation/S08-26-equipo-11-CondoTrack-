import { KpiCard } from "@/shared/components/KpiCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useMoves } from "@/modules/moves/context/MovesContext";

export const MovesPage = () => {
  const { moves, updateStatus } = useMoves();
  const pending = moves.filter((m) => m.status === "pending");
  const confirmed = moves.filter((m) => m.status === "confirmed");

  return (
    <div className="ct-main-scroll">
      <div className="ct-grid-kpi-3 mb-4">
        <KpiCard label="Pendientes de aprobación" value={pending.length} />
        <KpiCard label="Confirmadas" value={confirmed.length} />
        <KpiCard label="Rechazadas" value={moves.filter((m) => m.status === "rejected").length} />
      </div>

      <div className="ct-card overflow-hidden">
        <table className="ct-table mb-0">
          <thead>
            <tr>
              {["Unidad", "Residente", "Tipo", "Fecha", "Horario", "Notas", "Estado", ""].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {moves.map((move) => (
              <tr key={move.id}>
                <td className="ct-font-mono" style={{ color: "var(--color-ink)" }}>{move.unit}</td>
                <td className="fw-medium" style={{ color: "var(--color-ink)" }}>{move.resident}</td>
                <td className="ct-text-muted">{move.type}</td>
                <td className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>{move.date}</td>
                <td className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>{move.time}</td>
                <td className="ct-text-muted" style={{ fontSize: "0.75rem", maxWidth: 200 }}>{move.notes || "—"}</td>
                <td><StatusBadge status={move.status === "confirmed" ? "confirmed" : move.status === "rejected" ? "denied" : "pending"} /></td>
                <td>
                  {move.status === "pending" && (
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-sm btn-outline-success" onClick={() => updateStatus(move.id, "confirmed")}>
                        Aprobar
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => updateStatus(move.id, "rejected")}>
                        Rechazar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {moves.length === 0 && (
          <div className="text-center py-5 ct-text-muted">Sin solicitudes de mudanza.</div>
        )}
      </div>
    </div>
  );
};
