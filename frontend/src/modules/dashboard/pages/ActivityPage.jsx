import { useEffect, useMemo, useState } from "react";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { ENTITY_LABELS, RESULTS } from "@/core/activity/activityTypes";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useUnits } from "@/modules/units/context/UnitsContext";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Icon } from "@/shared/components/Icon";

const EMPTY_FILTERS = {
  search: "",
  buildingId: "all",
  unitId: "all",
  entityType: "all",
  result: "all",
  from: "",
  to: "",
};

/** Un filtro de fecha cubre el día entero: "2026-09-30" incluye hasta 23:59. */
const startOfDay = (value) => new Date(`${value}T00:00:00`).getTime();

const endOfDay = (value) => new Date(`${value}T23:59:59.999`).getTime();

export const ActivityPage = () => {
  const { activities } = useActivityLog();
  const { buildings, getBuildingById } = useBuildings();
  const { forBuilding: unitsForBuilding, fetchUnits } = useUnits();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // El listado de unidades se carga por edificio, así que hay que pedirlo
  // cuando se elige uno para que el filtro de unidad tenga opciones.
  useEffect(() => {
    if (filters.buildingId !== "all") {
      fetchUnits(filters.buildingId);
    }
  }, [filters.buildingId, fetchUnits]);

  const update = (field) => (event) =>
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
      // La unidad pertenece a un edificio: al cambiar de edificio se descarta
      // la unidad seleccionada porque puede no existir en el nuevo.
      ...(field === "buildingId" ? { unitId: "all" } : {}),
    }));

  const clear = () => setFilters(EMPTY_FILTERS);

  // Unidades del edificio elegido, para no ofrecer unidades de otro edificio.
  const units = useMemo(
    () => (filters.buildingId === "all" ? [] : unitsForBuilding(filters.buildingId)),
    [filters.buildingId, unitsForBuilding],
  );

  const filtered = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    const from = filters.from ? startOfDay(filters.from) : null;
    const to = filters.to ? endOfDay(filters.to) : null;

    return activities.filter((entry) => {
      if (term) {
        const haystack = `${entry.action} ${entry.actor} ${entry.unitCode ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.buildingId !== "all" && entry.buildingId !== filters.buildingId) {
        return false;
      }
      if (filters.unitId !== "all" && entry.unitId !== filters.unitId) {
        return false;
      }
      if (filters.entityType !== "all" && entry.entityType !== filters.entityType) {
        return false;
      }
      if (filters.result !== "all" && entry.result !== filters.result) {
        return false;
      }
      if (from !== null || to !== null) {
        const at = new Date(entry.createdAt ?? entry.timestamp).getTime();
        if (Number.isNaN(at)) return false;
        if (from !== null && at < from) return false;
        if (to !== null && at > to) return false;
      }
      return true;
    });
  }, [activities, filters]);

  const hasFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <div className="ct-main-scroll">
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <div className="ct-search-box">
          <Icon name="search" size={15} className="ct-text-faint" />
          <input
            placeholder="Buscar por acción, responsable o unidad…"
            value={filters.search}
            onChange={update("search")}
          />
        </div>

        <select
          aria-label="Filtrar por edificio"
          className="form-select form-select-sm w-auto"
          value={filters.buildingId}
          onChange={update("buildingId")}
        >
          <option value="all">Todos los edificios</option>
          {buildings.map((building) => (
            <option key={building.id} value={building.id}>
              {building.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por unidad"
          className="form-select form-select-sm w-auto"
          value={filters.unitId}
          onChange={update("unitId")}
        >
          <option value="all">Todas las unidades</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              Unidad {unit.code}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por tipo"
          className="form-select form-select-sm w-auto"
          value={filters.entityType}
          onChange={update("entityType")}
        >
          <option value="all">Todos los tipos</option>
          {Object.entries(ENTITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por resultado"
          className="form-select form-select-sm w-auto"
          value={filters.result}
          onChange={update("result")}
        >
          <option value="all">Todo resultado</option>
          <option value={RESULTS.OK}>Exitosas</option>
          <option value={RESULTS.ERROR}>Con error</option>
        </select>

        <input
          type="date"
          aria-label="Desde"
          className="form-control form-control-sm w-auto"
          value={filters.from}
          onChange={update("from")}
        />
        <input
          type="date"
          aria-label="Hasta"
          className="form-control form-control-sm w-auto"
          value={filters.to}
          onChange={update("to")}
        />

        {hasFilters && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={clear}
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="ct-card overflow-hidden">
        <div className="ct-card-header">
          <p className="ct-font-mono text-uppercase ct-text-muted mb-0" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
            {filtered.length} de {activities.length} acciones — historial de la sesión
          </p>
        </div>
        <div>
          {filtered.map((entry) => (
            <div key={entry.id} className="ct-row ct-row-hover d-flex align-items-start gap-3">
              <span className="ct-font-mono ct-text-muted flex-shrink-0" style={{ fontSize: "0.75rem", width: 130 }}>{entry.timestamp}</span>
              <div className="flex-grow-1 min-w-0">
                <p className="mb-0" style={{ color: "var(--color-ink)" }}>{entry.action}</p>
                <p className="ct-font-mono ct-text-faint mb-0 mt-1" style={{ fontSize: "0.6875rem" }}>
                  {entry.actor} ·{" "}
                  {entry.buildingId ? getBuildingById(entry.buildingId).name : "Sistema"}
                  {entry.unitCode ? ` · Unidad ${entry.unitCode}` : ""}
                  {entry.entityType ? ` · ${ENTITY_LABELS[entry.entityType] ?? entry.entityType}` : ""}
                </p>
              </div>
              <div className="flex-shrink-0">
                <StatusBadge
                  status={entry.result === RESULTS.ERROR ? "denied" : "ok"}
                />
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-5 ct-text-muted">
            {activities.length === 0
              ? "Todavía no hay actividad registrada en esta sesión."
              : "Ninguna acción coincide con los filtros."}
          </div>
        )}
      </div>
    </div>
  );
};
