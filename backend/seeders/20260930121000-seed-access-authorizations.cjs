"use strict";

const { createHash } = require("crypto");

// CT-S4-10 Tier 5: autorizaciones de acceso con sus visitantes.
// Los visitantes se siembran como filas de `people` unicamente: nunca se crean
// users, ni filas en users_buildings_roles, ni en unit_people, porque un
// visitante no reside en el condominio (CT-S4-01/02).
//
// qr_token_hash se guarda como SHA-256 hex del token en claro, igual que hace
// AccessService.hashQrToken, y el unico es el indice
// access_authorizations_qr_token_hash_unique. Los tokens en claro se listan en
// PLAINTEXT_TOKENS para poder escanearlos en la demo; la BD nunca los guarda.

//genera UUIDs deterministas con el mismo formato del edificio de bootstrap
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

//residentes con cuenta creada por 20260924121000-seed-people-users.cjs.
//unit y user se mueven juntos para no romper la FK contra units.
const RESIDENT_ACCOUNTS = [
  { unit: 1, user: 6, buildingId: BUILDING_NORTH_ID },
  { unit: 2, user: 7, buildingId: BUILDING_NORTH_ID },
  { unit: 3, user: 8, buildingId: BUILDING_NORTH_ID },
  { unit: 4, user: 9, buildingId: BUILDING_NORTH_ID },
  { unit: 19, user: 10, buildingId: BUILDING_SOUTH_ID },
  { unit: 20, user: 11, buildingId: BUILDING_SOUTH_ID },
  { unit: 21, user: 12, buildingId: BUILDING_SOUTH_ID },
  { unit: 22, user: 13, buildingId: BUILDING_SOUTH_ID },
];

//documentNumber no se repite: people_document_number_unique es unico.
//documentType "DNI" es el VISITOR_DOCUMENT_TYPE que usa AccessService.
const VISITORS = [
  { firstName: "Diego", lastName: "Fernandez", documentNumber: "30000001" },
  { firstName: "Carolina", lastName: "Molina", documentNumber: "30000002" },
  { firstName: "Ruben", lastName: "Sosa", documentNumber: "30000003" },
  { firstName: "Mariana", lastName: "Peralta", documentNumber: "30000004" },
  { firstName: "Hector", lastName: "Ledesma", documentNumber: "30000005" },
  { firstName: "Silvia", lastName: "Ocampo", documentNumber: "30000006" },
  { firstName: "Andres", lastName: "Vera", documentNumber: "30000007" },
  { firstName: "Natalia", lastName: "Cardozo", documentNumber: "30000008" },
  { firstName: "Javier", lastName: "Ponce", documentNumber: "30000009" },
  { firstName: "Romina", lastName: "Aguirre", documentNumber: "30000010" },
  { firstName: "Oscar", lastName: "Luna", documentNumber: "30000011" },
  { firstName: "Veronica", lastName: "Sosa", documentNumber: "30000012" },
];

// tokens en claro de la demo: el hash SHA-256 de cada uno es lo que va a la BD.
const PLAINTEXT_TOKENS = VISITORS.map(
  (_, index) => `CT-S4-10-DEMO-${String(index + 1).padStart(2, "0")}`
);

const HOURS = 60 * 60 * 1000;
const DAYS = 24 * HOURS;

// Solo PENDING (aun no se escaneo) y READ (ya escaneo, validateQr pasa la
// autorizacion a READ). El estado SENT que menciona el ticket no existe en el
// modulo de accesos: la columna es STRING(20) sin CHECK, pero ningun service lo
// escribe, asi que sembrarlo dejaria filas que la aplicacion nunca produce.
const WINDOWS = [
  { status: "PENDING", fromHoursAgo: 2, untilHoursAhead: 6 },
  { status: "PENDING", fromHoursAgo: 1, untilHoursAhead: 4 },
  { status: "PENDING", fromHoursAgo: 5, untilHoursAhead: 3 },
  { status: "PENDING", fromHoursAgo: 3, untilHoursAhead: 8 },
  { status: "PENDING", fromHoursAgo: 24 * 10, untilHoursAgo: 24 * 2 },
  { status: "PENDING", fromHoursAgo: 24 * 8, untilHoursAgo: 24 * 3 },
  { status: "PENDING", fromHoursAgo: 24 * 15, untilHoursAgo: 24 * 1 },
  { status: "READ", fromHoursAgo: 3, untilHoursAhead: 5 },
  { status: "READ", fromHoursAgo: 4, untilHoursAhead: 2 },
  { status: "READ", fromHoursAgo: 2, untilHoursAhead: 7 },
  { status: "READ", fromHoursAgo: 24 * 12, untilHoursAgo: 24 * 1 },
  { status: "READ", fromHoursAgo: 24 * 20, untilHoursAgo: 24 * 6 },
];

function visitWindows(now) {
  return WINDOWS.map((window, index) => ({
    index,
    status: window.status,
    valid_from: new Date(now - (window.fromHoursAgo || 0) * HOURS),
    valid_until:
      window.untilHoursAhead !== undefined
        ? new Date(now + window.untilHoursAhead * HOURS)
        : new Date(now - (window.untilHoursAgo || 0) * HOURS),
  }));
}

const AUTHORIZATIONS = visitWindows(Date.now()).map((entry) => {
  const account = RESIDENT_ACCOUNTS[entry.index % RESIDENT_ACCOUNTS.length];
  return {
    id: detUuid("00000007", entry.index + 1),
    building_id: account.buildingId,
    unit_id: detUuid("00000001", account.unit),
    visitor_id: detUuid("0000000b", entry.index + 1),
    authorized_by_user_id: detUuid("00000003", account.user),
    valid_from: entry.valid_from,
    valid_until: entry.valid_until,
    status: entry.status,
    qr_token_hash: createHash("sha256").update(PLAINTEXT_TOKENS[entry.index]).digest("hex"),
  };
});

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const bulkOptions = { ignoreDuplicates: true, transaction };

      await queryInterface.bulkInsert(
        "people",
        VISITORS.map((visitor, index) =>
          withDefaults(
            {
              id: detUuid("0000000b", index + 1),
              first_name: visitor.firstName,
              last_name: visitor.lastName,
              document_type: "DNI",
              document_number: visitor.documentNumber,
              email: `visitante${index + 1}@condotrack.test`,
              //E.164 sin espacios: es el formato que valida users PATCH /:id
              phone: `+549110555${String(101 + index).padStart(4, "0")}`,
            },
            Sequelize,
          )
        ),
        bulkOptions,
      );

      await queryInterface.bulkInsert(
        "access_authorizations",
        AUTHORIZATIONS.map((authorization) => withDefaults(authorization, Sequelize)),
        bulkOptions,
      );
    });
  },

  async down(queryInterface, Sequelize) {
    const authorizationIds = AUTHORIZATIONS.map((row) => row.id);
    const visitorIds = VISITORS.map((_, index) => detUuid("0000000b", index + 1));

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        "access_authorizations",
        { id: { [Sequelize.Op.in]: authorizationIds } },
        { transaction },
      );

      await queryInterface.bulkDelete(
        "people",
        { id: { [Sequelize.Op.in]: visitorIds } },
        { transaction },
      );
    });
  },
};