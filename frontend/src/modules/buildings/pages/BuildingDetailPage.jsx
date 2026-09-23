import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Tabs, Tab } from "react-bootstrap";
import { Icon } from "@/shared/components/Icon";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { canManageBuildingResources } from "@/modules/auth/constants/roles";
import { useBuildings } from "@/modules/buildings/context/BuildingsContext";
import { useResidents } from "@/modules/residents/hooks/useResidents";
import { useUnits } from "@/modules/units/context/UnitsContext";
import { useAmenities } from "@/modules/amenities/context/AmenitiesContext";
import { useStaff } from "@/modules/staff/context/StaffContext";
import { useAccessLogs } from "@/modules/access/hooks/useAccessLogs";
import { useDeliveries } from "@/modules/deliveries/hooks/useDeliveries";
import { useReservations } from "@/modules/reservations/hooks/useReservations";
import { useMoves } from "@/modules/moves/context/MovesContext";
import { useIncidents } from "@/modules/incidents/hooks/useIncidents";
import { useMaintenance } from "@/modules/maintenance/hooks/useMaintenance";
import { useActivityLog } from "@/core/activity/ActivityLogContext";
import { CreateResidentModal } from "@/modules/residents/components/CreateResidentModal";
import { UnitsModal } from "@/modules/units/components/UnitsModal";
import { AmenitiesModal } from "@/modules/amenities/components/AmenitiesModal";

const STAFF_ROLE_LABELS = { receptionist: "Recepcionista / Portero", maintenance: "Mantenimiento" };

export const BuildingDetailPage = () => {
  const { buildingId } = useParams();
  const id = Number(buildingId);
  const { getBuildingById, buildings } = useBuildings();
  const { user } = useAuth();
  const canManage = canManageBuildingResources(user?.role);

  const { forBuilding: residentsForBuilding } = useResidents();
  const { forBuilding: unitsForBuilding } = useUnits();
  const { forBuilding: amenitiesForBuilding } = useAmenities();
  const { forBuilding: staffForBuilding } = useStaff();
  const { forBuilding: accessForBuilding } = useAccessLogs();
  const { forBuilding: deliveriesForBuilding } = useDeliveries();
  const { forBuilding: reservationsForBuilding } = useReservations();
  const { forBuilding: movesForBuilding } = useMoves();
  const { forBuilding: incidentsForBuilding } = useIncidents();
  const { forBuilding: maintenanceForBuilding } = useMaintenance();
  const { forBuilding: activityForBuilding } = useActivityLog();

  const [showResidentModal, setShowResidentModal] = useState(false);
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);

  if (!buildings.some((b) => b.id === id)) {
    return <Navigate to="/dashboard/edificios" replace />;
  }

  const building = getBuildingById(id);
  const residents = residentsForBuilding(id);
  const units = unitsForBuilding(id);
  const amenities = amenitiesForBuilding(id);
  const staff = staffForBuilding(id);
  const accessLogs = accessForBuilding(id);
  const deliveries = deliveriesForBuilding(id);
  const reservations = reservationsForBuilding(id);
  const moves = movesForBuilding(id);
  const incidents = incidentsForBuilding(id);
  const maintenance = maintenanceForBuilding(id);
  const activity = activityForBuilding(id);

  return (
    <div className="ct-main-scroll">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div>
          <Link to="/dashboard/edificios" className="ct-card-link" style={{ fontSize: "0.75rem" }}>← Volver a edificios</Link>
          <h2 className="ct-font-display mb-0 mt-1" style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-ink)" }}>{building.name}</h2>
          <p className="ct-text-muted mb-0">{building.address}, {building.city}</p>
        </div>
      </div>

      <div className="ct-grid-kpi mb-4">
        <div className="ct-card p-3 text-center">
          <p className="ct-font-display mb-0" style={{ fontSize: "1.5rem", fontWeight: 600 }}>{building.units}</p>
          <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>Unidades</p>
        </div>
        <div className="ct-card p-3 text-center">
          <p className="ct-font-display mb-0" style={{ fontSize: "1.5rem", fontWeight: 600 }}>{building.floors}</p>
          <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>Pisos</p>
        </div>
        <div className="ct-card p-3 text-center">
          <p className="ct-font-display mb-0" style={{ fontSize: "1.5rem", fontWeight: 600 }}>{residents.length}</p>
          <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>Residentes</p>
        </div>
        <div className="ct-card p-3 text-center">
          <p className="ct-font-display mb-0" style={{ fontSize: "1.5rem", fontWeight: 600 }}>{staff.length}</p>
          <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>Personal</p>
        </div>
      </div>

      <Tabs defaultActiveKey="residentes" className="mb-3">
        <Tab eventKey="residentes" title="Residentes">
          {canManage && (
            <div className="d-flex justify-content-end my-3">
              <button type="button" className="btn btn-sm text-white d-flex align-items-center gap-2" style={{ background: "var(--color-accent)" }} onClick={() => setShowResidentModal(true)}>
                <Icon name="plus" size={13} /> Nuevo residente
              </button>
            </div>
          )}
          <div className="ct-card overflow-hidden">
            {residents.map((resident) => (
              <div key={resident.id} className="ct-row ct-row-hover d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{resident.name}</p>
                  <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>Unidad {resident.unit} · {resident.type}</p>
                </div>
                <StatusBadge status={resident.status} />
              </div>
            ))}
            {residents.length === 0 && <div className="text-center py-4 ct-text-muted">Sin residentes registrados.</div>}
          </div>
        </Tab>

        <Tab eventKey="unidades" title="Unidades">
          {canManage && (
            <div className="d-flex justify-content-end my-3">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowUnitsModal(true)}>Gestionar unidades</button>
            </div>
          )}
          <div className="ct-card p-3 d-flex flex-wrap gap-2">
            {units.map((unit) => (
              <span key={unit.id} className="badge bg-light text-dark border px-2 py-2">{unit.label}</span>
            ))}
            {units.length === 0 && <span className="ct-text-muted">Sin unidades cargadas.</span>}
          </div>
        </Tab>

        <Tab eventKey="amenidades" title="Amenidades">
          {canManage && (
            <div className="d-flex justify-content-end my-3">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowAmenitiesModal(true)}>Gestionar amenidades</button>
            </div>
          )}
          <div className="ct-card overflow-hidden">
            {amenities.map((amenity) => (
              <div key={amenity.id} className="ct-row ct-row-hover">
                <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{amenity.name}</p>
                <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>Capacidad: {amenity.capacity} · {amenity.openTime}–{amenity.closeTime}</p>
              </div>
            ))}
            {amenities.length === 0 && <div className="text-center py-4 ct-text-muted">Sin amenidades cargadas.</div>}
          </div>
        </Tab>

        <Tab eventKey="personal" title="Personal">
          <div className="ct-card overflow-hidden mt-3">
            {staff.map((member) => (
              <div key={member.id} className="ct-row ct-row-hover d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{member.name}</p>
                  <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                    {STAFF_ROLE_LABELS[member.role]}
                    {member.role === "maintenance" ? ` · ${member.staffType === "externo" ? "Empresa externa" : "Personal interno"}` : ""}
                  </p>
                </div>
              </div>
            ))}
            {staff.length === 0 && <div className="text-center py-4 ct-text-muted">Sin personal registrado.</div>}
          </div>
        </Tab>

        <Tab eventKey="accesos" title="Accesos">
          <div className="d-flex justify-content-end my-3">
            <Link to="/dashboard/accesos" className="ct-card-link" style={{ fontSize: "0.75rem" }}>Ver módulo completo →</Link>
          </div>
          <div className="ct-card overflow-hidden">
            {accessLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="ct-row ct-row-hover d-flex align-items-center gap-3">
                <span className="ct-font-mono ct-text-muted" style={{ fontSize: "0.75rem", width: 40, flexShrink: 0 }}>{log.time}</span>
                <div className="flex-grow-1">
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{log.person}</p>
                  <p className="ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{log.type} · {log.direction}</p>
                </div>
                <StatusBadge status={log.status} />
              </div>
            ))}
            {accessLogs.length === 0 && <div className="text-center py-4 ct-text-muted">Sin registros de acceso.</div>}
          </div>
        </Tab>

        <Tab eventKey="deliveries" title="Deliveries">
          <div className="d-flex justify-content-end my-3">
            <Link to="/dashboard/deliveries" className="ct-card-link" style={{ fontSize: "0.75rem" }}>Ver módulo completo →</Link>
          </div>
          <div className="ct-card overflow-hidden">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="ct-row ct-row-hover d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{delivery.resident}</p>
                  <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{delivery.carrier} · Unidad {delivery.unit}</p>
                </div>
                <StatusBadge status={delivery.status} />
              </div>
            ))}
            {deliveries.length === 0 && <div className="text-center py-4 ct-text-muted">Sin deliveries registrados.</div>}
          </div>
        </Tab>

        <Tab eventKey="reservas" title="Reservas">
          <div className="d-flex justify-content-end my-3">
            <Link to="/dashboard/reservas" className="ct-card-link" style={{ fontSize: "0.75rem" }}>Ver módulo completo →</Link>
          </div>
          <div className="ct-card overflow-hidden">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="ct-row ct-row-hover d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{reservation.space}</p>
                  <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{reservation.resident} · {reservation.date} {reservation.time}</p>
                </div>
                <StatusBadge status={reservation.status} />
              </div>
            ))}
            {reservations.length === 0 && <div className="text-center py-4 ct-text-muted">Sin reservas registradas.</div>}
          </div>
        </Tab>

        <Tab eventKey="mudanzas" title="Mudanzas">
          <div className="d-flex justify-content-end my-3">
            <Link to="/dashboard/mudanzas" className="ct-card-link" style={{ fontSize: "0.75rem" }}>Ver módulo completo →</Link>
          </div>
          <div className="ct-card overflow-hidden">
            {moves.map((move) => (
              <div key={move.id} className="ct-row ct-row-hover d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{move.type} · Unidad {move.unit}</p>
                  <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{move.resident} · {move.date} {move.time}</p>
                </div>
                <StatusBadge status={move.status === "confirmed" ? "confirmed" : move.status === "rejected" ? "denied" : "pending"} />
              </div>
            ))}
            {moves.length === 0 && <div className="text-center py-4 ct-text-muted">Sin mudanzas registradas.</div>}
          </div>
        </Tab>

        <Tab eventKey="incidentes" title="Incidentes">
          <div className="d-flex justify-content-end my-3">
            <Link to="/dashboard/incidentes" className="ct-card-link" style={{ fontSize: "0.75rem" }}>Ver módulo completo →</Link>
          </div>
          <div className="ct-card overflow-hidden">
            {incidents.map((incident) => (
              <div key={incident.id} className="ct-row ct-row-hover d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{incident.title}</p>
                  <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{incident.unit} · {incident.reported}</p>
                </div>
                <StatusBadge status={incident.status} />
              </div>
            ))}
            {incidents.length === 0 && <div className="text-center py-4 ct-text-muted">Sin incidentes registrados.</div>}
          </div>
        </Tab>

        <Tab eventKey="mantenimiento" title="Mantenimiento">
          <div className="d-flex justify-content-end my-3">
            <Link to="/dashboard/mantenimiento" className="ct-card-link" style={{ fontSize: "0.75rem" }}>Ver módulo completo →</Link>
          </div>
          <div className="ct-card overflow-hidden">
            {maintenance.map((item) => (
              <div key={item.id} className="ct-row ct-row-hover d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-0 fw-medium" style={{ color: "var(--color-ink)" }}>{item.title}</p>
                  <p className="ct-font-mono ct-text-muted mb-0" style={{ fontSize: "0.75rem" }}>{item.unit} · {item.assigned}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
            {maintenance.length === 0 && <div className="text-center py-4 ct-text-muted">Sin solicitudes registradas.</div>}
          </div>
        </Tab>

        <Tab eventKey="actividad" title="Historial">
          <div className="ct-card overflow-hidden mt-3">
            {activity.map((entry) => (
              <div key={entry.id} className="ct-row ct-row-hover d-flex align-items-start gap-3">
                <span className="ct-font-mono ct-text-muted flex-shrink-0" style={{ fontSize: "0.75rem", width: 130 }}>{entry.timestamp}</span>
                <div>
                  <p className="mb-0" style={{ color: "var(--color-ink)" }}>{entry.action}</p>
                  <p className="ct-font-mono ct-text-faint mb-0" style={{ fontSize: "0.6875rem" }}>{entry.actor}</p>
                </div>
              </div>
            ))}
            {activity.length === 0 && <div className="text-center py-4 ct-text-muted">Sin actividad registrada todavía para este edificio.</div>}
          </div>
        </Tab>
      </Tabs>

      <CreateResidentModal
        show={showResidentModal}
        onHide={() => setShowResidentModal(false)}
        defaultBuildingId={id}
      />
      <UnitsModal building={building} show={showUnitsModal} onHide={() => setShowUnitsModal(false)} />
      <AmenitiesModal building={building} show={showAmenitiesModal} onHide={() => setShowAmenitiesModal(false)} />
    </div>
  );
};
