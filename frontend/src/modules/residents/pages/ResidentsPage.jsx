import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { canManageBuildingResources } from "@/modules/auth/constants/roles";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useResidents } from "@/modules/residents/hooks/useResidents";
import { CreateResidentModal } from "@/modules/residents/components/CreateResidentModal";

const initialsOf = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export const ResidentsPage = () => {
  const { search, setSearch, filteredResidents } = useResidents();
  const { buildings } = useBuildings();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  const canCreate = canManageBuildingResources(user?.role);

  // La lista cambia según el edificio elegido (dinámico por edificio).
  const visibleResidents = filteredResidents.filter(
    (resident) =>
      selectedBuilding === "all" || resident.buildingId === selectedBuilding,
  );

  return (
    <div className="ct-main-scroll">
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")} className="mb-4">
          {successMessage}
        </Alert>
      )}

      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="ct-search-box">
          <Icon name="search" size={15} className="ct-text-faint" />
          <input
            placeholder="Buscar por nombre o unidad…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-2" title="Filtrar por edificio">
          <Icon name="filter" size={14} />
          <select
            aria-label="Filtrar por edificio"
            className="border-0 bg-transparent"
            style={{ fontSize: "0.875rem", cursor: "pointer" }}
            value={selectedBuilding}
            onChange={(event) => setSelectedBuilding(event.target.value)}
          >
            <option value="all">Todos los edificios</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </button>
        {canCreate && (
          <button
            type="button"
            className="btn btn-sm text-white d-flex align-items-center gap-2 flex-shrink-0"
            style={{ background: "var(--color-accent)" }}
            onClick={() => setShowCreate(true)}
          >
            <Icon name="plus" size={14} />
            Nuevo residente
          </button>
        )}
      </div>

      <div className="ct-card overflow-hidden">
        <table className="ct-table mb-0">
          <thead>
            <tr>
              {["Residente", "Unidad", "Tipo", "Edificio", "Desde", "Estado"].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleResidents.map((resident) => (
              <tr key={resident.id}>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <div className="ct-avatar" style={{ width: 28, height: 28, fontSize: "0.75rem" }}>
                      {initialsOf(resident.name)}
                    </div>
                    <div>
                      <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{resident.name}</p>
                      <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{resident.email}</p>
                    </div>
                  </div>
                </td>
                <td className="ct-font-mono" style={{ color: "var(--color-ink)" }}>{resident.unit}</td>
                <td className="ct-text-muted">{resident.type}</td>
                <td className="ct-text-muted">{resident.building}</td>
                <td className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem" }}>{resident.since}</td>
                <td>
                  <StatusBadge status={resident.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visibleResidents.length === 0 && (
          <div className="text-center py-5 ct-text-muted">
            {search
              ? `Sin resultados para "${search}"`
              : "Sin residentes en este edificio todavía."}
          </div>
        )}
      </div>

      <CreateResidentModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={() => setSuccessMessage("Residente registrado correctamente.")}
      />
    </div>
  );
};
