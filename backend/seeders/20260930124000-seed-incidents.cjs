"use strict";

// CT-S4-10 Tier 8: incidentes de unidad.
// El soporte es completo: migracion 20260929160000-create-incidents.cjs, modelo
// Incident, relations, IncidentService y sus rutas. building_id se deriva de la
// unidad, igual que hace IncidentService.create, para que el incidente siempre
// quede en el mismo edificio que la unidad.
// severity y status son ENUM en Postgres: no se pueden sembrar valores fuera de
// los declarados en la migracion.

function detUuid(segment, n) {
  return `${segment}-0000-0000-0000-${String(n).padStart(12, "0")}`;
}

//id, created_at y updated_at se proveen explicitamente porque algunas bases no conservan los DEFAULT definidos en las migraciones
function withDefaults(record, Sequelize) {
  return {
    ...record,
    id: record.id || Sequelize.literal("gen_random_uuid()"),
    created_at: Sequelize.literal("now()"),
    updated_at: Sequelize.literal("now()"),
  };
}

const BUILDING_NORTH_ID = detUuid("00000000", 2);
const BUILDING_SOUTH_ID = detUuid("00000000", 3);

// unit/user: cada quien reporta desde la unidad de la que es titular.
const INCIDENTS = [
  { unit: 1, user: 6, person: 1, buildingId: BUILDING_NORTH_ID, severity: "HIGH", status: "OPEN", title: "Fuga de agua en el pasillo", description: "Gotea la canilla del pasillo del 1er piso desde ayer." },
  { unit: 2, user: 7, person: 2, buildingId: BUILDING_NORTH_ID, severity: "CRITICAL", status: "IN_PROGRESS", title: "Ascensor detenido", description: "El ascensor se frena entre pisos y hay una persona dentro." },
  { unit: 3, user: 8, person: 3, buildingId: BUILDING_NORTH_ID, severity: "MEDIUM", status: "RESOLVED", title: "Luminaria del palier fundida", description: "La luz del palier no enciende." },
  { unit: 4, user: 9, person: 4, buildingId: BUILDING_NORTH_ID, severity: "LOW", status: "CLOSED", title: "Porton que cierra golpeando", description: "El cierre automatico golpea la puerta." },
  { unit: 1, user: 6, person: 1, buildingId: BUILDING_NORTH_ID, severity: "MEDIUM", status: "OPEN", title: "Ruido de obra antes de las 8", description: "El obrero de la obra vecina arranca temprano." },
  { unit: 19, user: 10, person: 5, buildingId: BUILDING_SOUTH_ID, severity: "HIGH", status: "OPEN", title: "Perdida de agua en cocina", description: "La perdida de agua se corta al usar la ducha." },
  { unit: 20, user: 11, person: 6, buildingId: BUILDING_SOUTH_ID, severity: "MEDIUM", status: "RESOLVED", title: "Intercomunicador sin audio", description: "El panel del depto no suena." },
  { unit: 21, user: 12, person: 7, buildingId: BUILDING_SOUTH_ID, severity: "LOW", status: "CANCELLED", title: "Mancha en el techo del garage", description: "Se ve una mancha de humedad en el techo." },
  { unit: 22, user: 13, person: 8, buildingId: BUILDING_SOUTH_ID, severity: "HIGH", status: "IN_PROGRESS", title: "Porton principal sin respuesta", description: "El porton no abre con la llave ni con el telefono." },
  { unit: 19, user: 10, person: 5, buildingId: BUILDING_SOUTH_ID, severity: "LOW", status: "CLOSED", title: "Luz de escalera intermitente", description: "La luz de la escalera parpadea." },
];

const DAYS = 24 * 60 * 60 * 1000;

const RESOLVED_STATUSES = ["RESOLVED", "CLOSED"];

function toRows(now) {
  return INCIDENTS.map((incident, index) => {
    const createdAt = new Date(now - (index + 1) * 2 * DAYS);

    return {
      id: detUuid("0000000a", index + 1),
      building_id: incident.buildingId,
      unit_id: detUuid("00000001", incident.unit),
      reported_by_user_id: detUuid("00000003", incident.user),
      // assigned_to_person_id solo se completa cuando el incidente avanzo.
      assigned_to_person_id: RESOLVED_STATUSES.includes(incident.status)
        ? detUuid("00000002", incident.person)
        : null,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      resolved_at: RESOLVED_STATUSES.includes(incident.status)
        ? new Date(createdAt.getTime() + 1 * DAYS)
        : null,
    };
  });
}

const ROWS = toRows(Date.now());

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        "incidents",
        ROWS.map((row) => withDefaults(row, Sequelize)),
        { ignoreDuplicates: true, transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    const incidentIds = ROWS.map((row) => row.id);

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        "incidents",
        { id: { [Sequelize.Op.in]: incidentIds } },
        { transaction },
      );
    });
  },
};