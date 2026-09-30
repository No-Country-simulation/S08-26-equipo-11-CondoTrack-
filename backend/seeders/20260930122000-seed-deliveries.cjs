"use strict";

// CT-S4-10 Tier 6: paquetes recibidos en porteria.
// recipient_person_id + unit_id siempre se toman del mismo vinculo de
// unit_people que crea 20260924121000-seed-people-users.cjs, porque
// DeliveryService valida el receptor con findActiveRecipient sobre esa tabla.

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

//recepcion que recibe el paquete: usuarios 2 (Torre Norte) y 3 (Torre Sur)
const RECEPTION_NORTH_USER = detUuid("00000003", 2);
const RECEPTION_SOUTH_USER = detUuid("00000003", 3);

// carrier acepta solo los valores del CHECK deliveries_carrier_allowed:
// 'Mercado Libre','Correo Argentino','Andreani','OCA','DHL','Otro'.

// unit/person/residentUser. residentUser es null cuando la persona todavia no
// tiene cuenta, y en ese caso el paquete queda RECEIVED sin retiro.
const DELIVERIES = [
  { unit: 1, person: 1, residentUser: 6, buildingId: BUILDING_NORTH_ID, status: "RECEIVED", carrier: "Mercado Libre" },
  { unit: 2, person: 2, residentUser: 7, buildingId: BUILDING_NORTH_ID, status: "RECEIVED", carrier: "Andreani" },
  { unit: 3, person: 3, residentUser: 8, buildingId: BUILDING_NORTH_ID, status: "PICKED_UP", carrier: "Correo Argentino" },
  { unit: 4, person: 4, residentUser: 9, buildingId: BUILDING_NORTH_ID, status: "RECEIVED", carrier: "DHL" },
  { unit: 5, person: 9, residentUser: null, buildingId: BUILDING_NORTH_ID, status: "RECEIVED", carrier: "OCA" },
  { unit: 6, person: 10, residentUser: null, buildingId: BUILDING_NORTH_ID, status: "RECEIVED", carrier: "Mercado Libre" },
  { unit: 19, person: 5, residentUser: 10, buildingId: BUILDING_SOUTH_ID, status: "RECEIVED", carrier: "Andreani" },
  { unit: 20, person: 6, residentUser: 11, buildingId: BUILDING_SOUTH_ID, status: "PICKED_UP", carrier: "Mercado Libre" },
  { unit: 21, person: 7, residentUser: 12, buildingId: BUILDING_SOUTH_ID, status: "RECEIVED", carrier: "Correo Argentino" },
  { unit: 22, person: 8, residentUser: 13, buildingId: BUILDING_SOUTH_ID, status: "PICKED_UP", carrier: "DHL" },
  { unit: 23, person: 21, residentUser: null, buildingId: BUILDING_SOUTH_ID, status: "RECEIVED", carrier: "OCA" },
  { unit: 24, person: 22, residentUser: null, buildingId: BUILDING_SOUTH_ID, status: "RECEIVED", carrier: "Otro" },
];

const HOURS = 60 * 60 * 1000;

function toRows(now) {
  return DELIVERIES.map((delivery, index) => {
    const receivedAt = new Date(now - (index + 1) * 9 * HOURS);
    const pickedUp = delivery.status === "PICKED_UP";

    return {
      id: detUuid("00000008", index + 1),
      building_id: delivery.buildingId,
      unit_id: detUuid("00000001", delivery.unit),
      recipient_person_id: detUuid("00000002", delivery.person),
      received_by_user_id:
        delivery.buildingId === BUILDING_NORTH_ID
          ? RECEPTION_NORTH_USER
          : RECEPTION_SOUTH_USER,
      picked_up_by_user_id: pickedUp
        ? detUuid("00000003", delivery.residentUser)
        : null,
      carrier: delivery.carrier,
      tracking_number: `CT-TRK-${String(index + 1).padStart(5, "0")}`,
      status: delivery.status,
      received_at: receivedAt,
      // RECEIVED todavia no fue notificado; PICKED_UP ya paso por NOTIFIED.
      notified_at: pickedUp ? new Date(receivedAt.getTime() + 2 * HOURS) : null,
      picked_up_at: pickedUp ? new Date(receivedAt.getTime() + 26 * HOURS) : null,
    };
  });
}

const ROWS = toRows(Date.now());

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        "deliveries",
        ROWS.map((row) => withDefaults(row, Sequelize)),
        { ignoreDuplicates: true, transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    const deliveryIds = ROWS.map((row) => row.id);

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        "deliveries",
        { id: { [Sequelize.Op.in]: deliveryIds } },
        { transaction },
      );
    });
  },
};