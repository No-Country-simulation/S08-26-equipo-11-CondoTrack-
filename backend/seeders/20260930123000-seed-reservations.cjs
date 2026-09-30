"use strict";

// CT-S4-10 Tier 7: reservas de espacios comunes.
// Depende de 20260930120000-seed-common-areas.cjs por common_area_id.
// El area, la unidad y quien pide tienen que pertenecer al mismo edificio
// (ReservationService exige unit.buildingId === area.buildingId), y
// start_at/end_at cumplen el CHECK end_at > start_at sin solaparse por area.

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

// Indices de los common_areas de 20260930120000-seed-common-areas.cjs.
// Por cada edificio, en el orden Parrilla / Gimnasio / Salon de Eventos /
// Coworking. Edificio Principal = 1-4, Torre Norte = 5-8, Torre Sur = 9-12.
const AREA = {
  north: {
    parrilla: detUuid("00000006", 5),
    gimnasio: detUuid("00000006", 6),
    sala: detUuid("00000006", 7),
    coworking: detUuid("00000006", 8),
  },
  south: {
    parrilla: detUuid("00000006", 9),
    gimnasio: detUuid("00000006", 10),
    sala: detUuid("00000006", 11),
    coworking: detUuid("00000006", 12),
  },
};

// status: el CHECK reservations_status_allowed acepta
// PENDING, CONFIRMED, CANCELLED, COMPLETED, REJECTED.
// Las pasadas ya ocurrieron, asi que quedan COMPLETED o CANCELLED; las futuras
// quedan PENDING o CONFIRMED.
const RESERVATIONS = [
  { area: AREA.north.gimnasio, unit: 1, user: 6, buildingId: BUILDING_NORTH_ID, daysFromNow: -20, hours: 2, status: "COMPLETED", notes: "Entrenamiento grupal" },
  { area: AREA.north.parrilla, unit: 2, user: 7, buildingId: BUILDING_NORTH_ID, daysFromNow: -15, hours: 3, status: "COMPLETED", notes: "Asado familiar" },
  { area: AREA.north.sala, unit: 3, user: 8, buildingId: BUILDING_NORTH_ID, daysFromNow: -8, hours: 4, status: "CANCELLED", notes: "Se cancelo por lluvia" },
  { area: AREA.south.gimnasio, unit: 19, user: 10, buildingId: BUILDING_SOUTH_ID, daysFromNow: -12, hours: 2, status: "COMPLETED", notes: "Clase de yoga" },
  { area: AREA.south.parrilla, unit: 20, user: 11, buildingId: BUILDING_SOUTH_ID, daysFromNow: -5, hours: 3, status: "COMPLETED", notes: "Reunion de Owners" },
  { area: AREA.north.parrilla, unit: 4, user: 9, buildingId: BUILDING_NORTH_ID, daysFromNow: 2, hours: 3, status: "PENDING", notes: "Cumpleanos" },
  { area: AREA.north.coworking, unit: 1, user: 6, buildingId: BUILDING_NORTH_ID, daysFromNow: 3, hours: 4, status: "CONFIRMED", notes: "Trabajo remoto" },
  { area: AREA.south.sala, unit: 21, user: 12, buildingId: BUILDING_SOUTH_ID, daysFromNow: 5, hours: 5, status: "PENDING", notes: "Reunion de Owners" },
  { area: AREA.south.coworking, unit: 22, user: 13, buildingId: BUILDING_SOUTH_ID, daysFromNow: 7, hours: 4, status: "CONFIRMED", notes: "Trabajo remoto" },
  { area: AREA.north.gimnasio, unit: 2, user: 7, buildingId: BUILDING_NORTH_ID, daysFromNow: 9, hours: 2, status: "PENDING", notes: "Entrenamiento grupal" },
];

const HOURS = 60 * 60 * 1000;
const DAYS = 24 * HOURS;

function toRows(now) {
  return RESERVATIONS.map((reservation, index) => {
    const startAt = new Date(now + reservation.daysFromNow * DAYS);

    return {
      id: detUuid("00000009", index + 1),
      building_id: reservation.buildingId,
      common_area_id: reservation.area,
      unit_id: detUuid("00000001", reservation.unit),
      requested_by_user_id: detUuid("00000003", reservation.user),
      start_at: startAt,
      end_at: new Date(startAt.getTime() + reservation.hours * HOURS),
      status: reservation.status,
      notes: reservation.notes,
    };
  });
}

const ROWS = toRows(Date.now());

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        "reservations",
        ROWS.map((row) => withDefaults(row, Sequelize)),
        { ignoreDuplicates: true, transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    const reservationIds = ROWS.map((row) => row.id);

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        "reservations",
        { id: { [Sequelize.Op.in]: reservationIds } },
        { transaction },
      );
    });
  },
};