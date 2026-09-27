import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { canCreateBuildings, canManageBuildingResources } from "@/modules/auth/constants/roles";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useResidents } from "@/modules/residents/hooks/useResidents";
import { useIncidents } from "@/modules/incidents/hooks/useIncidents";
import { CreateBuildingModal } from "@/modules/buildings/components/CreateBuildingModal";
import { UnitsModal } from "@/modules/units/components/UnitsModal";
import { AmenitiesModal } from "@/modules/amenities/components/AmenitiesModal";

const COVER_PHOTOS = {
  1: "1486325212027-8081e485255e",
  2: "1545324418-cc1a3fa10c00",
  3: "1512917774080-9991f1c4c750",
};

export const BuildingsPage = () => {
  const { buildings } = useBuildings();
  const { forBuilding: residentsForBuilding } = useResidents();
  const { forBuilding: incidentsForBuilding } = useIncidents();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [unitsBuildingId, setUnitsBuildingId] = useState(null);
  const [amenitiesBuildingId, setAmenitiesBuildingId] = useState(null);

  const role = user?.role;
  const canCreate = canCreateBuildings(role);
  const canManageResources = canManageBuildingResources(role);

  const unitsBuilding = buildings.find((b) => b.id === unitsBuildingId) || null;
  const amenitiesBuilding = buildings.find((b) => b.id === amenitiesBuildingId) || null;

  return (
    <div className="ct-main-scroll">
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage("")} className="mb-4">
          {successMessage}
        </Alert>
      )}

      {canCreate && (
        <div className="d-flex justify-content-end mb-4">
          <button
            type="button"
            className="btn btn-sm text-white d-flex align-items-center gap-2"
            style={{ background: "var(--color-accent)" }}
            onClick={() => setShowCreate(true)}
          >
            <Icon name="plus" size={14} />
            Nuevo edificio
          </button>
        </div>
      )}

      <div className="ct-grid-buildings">
        {buildings.map((building) => (
          <div key={building.id} className="ct-card ct-hover-lift ct-building-card overflow-hidden">
            <Link to={`/dashboard/edificios/${building.id}`} className="text-decoration-none">
              <div className="ct-building-cover">
                <img
                  src={`https://images.unsplash.com/photo-${COVER_PHOTOS[building.id] || COVER_PHOTOS[1]}?w=480&h=160&fit=crop&auto=format`}
                  alt={`Fachada ${building.name}`}
                />
                <p className="ct-building-cover-title">{building.name}</p>
              </div>
            </Link>
            <div className="p-3">
              <p className="ct-font-mono ct-text-muted mb-3" style={{ fontSize: "0.75rem" }}>
                {building.address}, {building.city}
              </p>
              <div className="row row-cols-2 g-3 mb-3">
                {[
                  { label: "Unidades", val: building.units },
                  { label: "Pisos", val: building.floors },
                  { label: "Residentes", val: residentsForBuilding(building.id).length },
                  { label: "Incidentes", val: incidentsForBuilding(building.id).filter((i) => i.status !== "resolved").length },
                ].map((stat) => (
                  <div key={stat.label} className="col">
                    <p className="ct-font-mono text-uppercase ct-text-faint mb-0" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>
                      {stat.label}
                    </p>
                    <p className="ct-font-display mb-0" style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-ink)" }}>
                      {stat.val}
                    </p>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-2 mb-2">
                <Link to={`/dashboard/edificios/${building.id}`} className="btn btn-sm text-white flex-fill" style={{ background: "var(--color-accent)" }}>
                  Ver detalle
                </Link>
              </div>

              {canManageResources && (
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary flex-fill"
                    onClick={() => setUnitsBuildingId(building.id)}
                  >
                    Unidades
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary flex-fill"
                    onClick={() => setAmenitiesBuildingId(building.id)}
                  >
                    Amenidades
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateBuildingModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={() => setSuccessMessage("Edificio creado correctamente.")}
      />
      <UnitsModal building={unitsBuilding} show={!!unitsBuilding} onHide={() => setUnitsBuildingId(null)} />
      <AmenitiesModal building={amenitiesBuilding} show={!!amenitiesBuilding} onHide={() => setAmenitiesBuildingId(null)} />
    </div>
  );
};
