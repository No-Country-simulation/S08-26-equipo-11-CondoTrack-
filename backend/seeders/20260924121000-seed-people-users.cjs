"use strict";

const bcrypt = require("bcrypt");

const BCRYPT_ROUNDS = 10;
const DEMO_PASSWORD = "CondoTrack.demo.2026";

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

//los ids de edificio/unidad los define el seeder 20260924120000-seed-buildings-units.cjs
//Torre Norte: unidades 1-18, Torre Sur: unidades 19-36
const PEOPLE = [
  { firstName: "Sofia", lastName: "Rodriguez", documentType: "DNI", documentNumber: "40201512", email: "sofia.rodriguez@condotrack.test", phone: "+54 9 11 5555-0001", unit: 1, relationshipType: "OWNER", account: true },
  { firstName: "Martin", lastName: "Alarcon", documentType: "DNI", documentNumber: "40123456", email: "martin.alarcon@condotrack.test", phone: "+54 9 11 5555-0002", unit: 2, relationshipType: "TENANT", account: true },
  { firstName: "Valentina", lastName: "Torres", documentType: "DNI", documentNumber: "40012065", email: "valentina.torres@condotrack.test", phone: "+54 9 11 5555-0003", unit: 3, relationshipType: "OWNER", account: true },
  { firstName: "Thiago", lastName: "Benítez", documentType: "DNI", documentNumber: "39987444", email: "thiago.benitez@condotrack.test", phone: "+54 9 11 5555-0004", unit: 4, relationshipType: "TENANT", account: true },
  { firstName: "Camila", lastName: "Ríos", documentType: "DNI", documentNumber: "39554218", email: "camila.rios@condotrack.test", phone: "+54 9 11 5555-0005", unit: 19, relationshipType: "OWNER", account: true },
  { firstName: "Joaquín", lastName: "Medina", documentType: "DNI", documentNumber: "39874120", email: "joaquin.medina@condotrack.test", phone: "+54 9 11 5555-0006", unit: 20, relationshipType: "TENANT", account: true },
  { firstName: "Lucía", lastName: "Cabrera", documentType: "DNI", documentNumber: "39044556", email: "lucia.cabrera@condotrack.test", phone: "+54 9 11 5555-0007", unit: 21, relationshipType: "OWNER", account: true },
  { firstName: "Agustín", lastName: "Peralta", documentType: "DNI", documentNumber: "39411209", email: "agustin.peralta@condotrack.test", phone: "+54 9 11 5555-0008", unit: 22, relationshipType: "TENANT", account: true },
  { firstName: "Florencia", lastName: "Aguirre", documentType: "DNI", documentNumber: "38854001", email: "florencia.aguirre@condotrack.test", phone: "+54 9 11 5555-0009", unit: 5, relationshipType: "OWNER", account: false },
  { firstName: "Nicolás", lastName: "Sosa", documentType: "DNI", documentNumber: "38662217", email: "nicolas.sosa@condotrack.test", phone: "+54 9 11 5555-0010", unit: 6, relationshipType: "TENANT", account: false },
  { firstName: "Paula", lastName: "Navarro", documentType: "DNI", documentNumber: "38409183", email: "paula.navarro@condotrack.test", phone: "+54 9 11 5555-0011", unit: 7, relationshipType: "OWNER", account: false },
  { firstName: "Mateo", lastName: "Herrera", documentType: "DNI", documentNumber: "38255340", email: "mateo.herrera@condotrack.test", phone: "+54 9 11 5555-0012", unit: 8, relationshipType: "TENANT", account: false },
  { firstName: "Julieta", lastName: "Acosta", documentType: "DNI", documentNumber: "37701887", email: "julieta.acosta@condotrack.test", phone: "+54 9 11 5555-0013", unit: 9, relationshipType: "OWNER", account: false },
  { firstName: "Bruno", lastName: "Domínguez", documentType: "DNI", documentNumber: "37548210", email: "bruno.dominguez@condotrack.test", phone: "+54 9 11 5555-0014", unit: 10, relationshipType: "TENANT", account: false },
  { firstName: "Renata", lastName: "Paz", documentType: "DNI", documentNumber: "37129014", email: "renata.paz@condotrack.test", phone: "+54 9 11 5555-0015", unit: 11, relationshipType: "OWNER", account: false },
  { firstName: "Facundo", lastName: "Farías", documentType: "DNI", documentNumber: "36984532", email: "facundo.farias@condotrack.test", phone: "+54 9 11 5555-0016", unit: 12, relationshipType: "TENANT", account: false },
  { firstName: "Melina", lastName: "Roldán", documentType: "DNI", documentNumber: "35877461", email: "melina.roldan@condotrack.test", phone: "+54 9 11 5555-0017", unit: 13, relationshipType: "OWNER", account: false },
  { firstName: "Iván", lastName: "Correa", documentType: "DNI", documentNumber: "35512096", email: "ivan.correa@condotrack.test", phone: "+54 9 11 5555-0018", unit: 14, relationshipType: "TENANT", account: false },
  { firstName: "Abril", lastName: "Méndez", documentType: "DNI", documentNumber: "35226841", email: "abril.mendez@condotrack.test", phone: "+54 9 11 5555-0019", unit: 15, relationshipType: "OWNER", account: false },
  { firstName: "Santiago", lastName: "Villalba", documentType: "DNI", documentNumber: "34973306", email: "santiago.villalba@condotrack.test", phone: "+54 9 11 5555-0020", unit: 16, relationshipType: "TENANT", account: false },
  { firstName: "Clara", lastName: "Bustos", documentType: "DNI", documentNumber: "34490172", email: "clara.bustos@condotrack.test", phone: "+54 9 11 5555-0021", unit: 23, relationshipType: "OWNER", account: false },
  { firstName: "Tomás", lastName: "Giménez", documentType: "DNI", documentNumber: "34218055", email: "tomas.gimenez@condotrack.test", phone: "+54 9 11 5555-0022", unit: 24, relationshipType: "TENANT", account: false },
  { firstName: "Antonella", lastName: "Lucero", documentType: "DNI", documentNumber: "33944580", email: "antonella.lucero@condotrack.test", phone: "+54 9 11 5555-0023", unit: 25, relationshipType: "OWNER", account: false },
  { firstName: "Bautista", lastName: "Quiroga", documentType: "DNI", documentNumber: "33520144", email: "bautista.quiroga@condotrack.test", phone: "+54 9 11 5555-0024", unit: 26, relationshipType: "TENANT", account: false },
];

//personal de staff sin persona vinculada
const STAFF = [
  { email: "admin@condotrack.test", role: "ADMIN", buildingId: BUILDING_NORTH_ID },
  { email: "recepcion.norte@condotrack.test", role: "RECEPTION", buildingId: BUILDING_NORTH_ID },
  { email: "recepcion.sur@condotrack.test", role: "RECEPTION", buildingId: BUILDING_SOUTH_ID },
  { email: "mantenimiento.norte@condotrack.test", role: "MAINTENANCE", buildingId: BUILDING_NORTH_ID },
  { email: "mantenimiento.sur@condotrack.test", role: "MAINTENANCE", buildingId: BUILDING_SOUTH_ID },
];

const USER_COUNT = STAFF.length + PEOPLE.filter((person) => person.account).length;

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);

    await queryInterface.sequelize.transaction(async (transaction) => {
      const bulkOptions = { ignoreDuplicates: true, transaction };

      await queryInterface.bulkInsert(
        "people",
        PEOPLE.map((person, index) =>
          withDefaults(
            {
              id: detUuid("00000002", index + 1),
              first_name: person.firstName,
              last_name: person.lastName,
              document_type: person.documentType,
              document_number: person.documentNumber,
              email: person.email,
              phone: person.phone,
            },
            Sequelize,
          ),
        ),
        bulkOptions,
      );

      const roleRows = await queryInterface.sequelize.query(
        "SELECT id, name FROM roles WHERE name IN (:names)",
        {
          replacements: { names: ["ADMIN", "RECEPTION", "MAINTENANCE", "RESIDENT"] },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const roleIdByName = Object.fromEntries(roleRows.map((row) => [row.name, row.id]));
      const missingRoles = ["ADMIN", "RECEPTION", "MAINTENANCE", "RESIDENT"].filter(
        (name) => !roleIdByName[name],
      );

      if (missingRoles.length > 0) {
        throw new Error(
          `[Seed] No se encontraron los roles ${missingRoles.join(", ")}. Ejecute primero el seeder base de roles (CT-S3-01).`,
        );
      }

      let userIdCounter = 0;
      const staffUsers = STAFF.map((staff) => {
        userIdCounter += 1;
        return {
          id: detUuid("00000003", userIdCounter),
          email: staff.email,
          role: staff.role,
          buildingId: staff.buildingId,
        };
      });

      const residentUsers = [];
      PEOPLE.forEach((person, index) => {
        if (!person.account) {
          return;
        }
        userIdCounter += 1;
        residentUsers.push({
          id: detUuid("00000003", userIdCounter),
          personIndex: index,
          buildingId: person.unit <= 18 ? BUILDING_NORTH_ID : BUILDING_SOUTH_ID,
        });
      });

      const allUsers = [
        ...staffUsers.map((staff) =>
          withDefaults(
            {
              id: staff.id,
              person_id: null,
              email: staff.email,
              password_hash: passwordHash,
              status: "ACTIVE",
              last_login_at: null,
            },
            Sequelize,
          ),
        ),
        ...residentUsers.map((resident) =>
          withDefaults(
            {
              id: resident.id,
              person_id: detUuid("00000002", resident.personIndex + 1),
              email: PEOPLE[resident.personIndex].email,
              password_hash: passwordHash,
              status: "ACTIVE",
              last_login_at: null,
            },
            Sequelize,
          ),
        ),
      ];

      await queryInterface.bulkInsert("users", allUsers, bulkOptions);

      await queryInterface.bulkInsert(
        "unit_people",
        PEOPLE.map((person, index) =>
          withDefaults(
            {
              id: detUuid("00000004", index + 1),
              unit_id: detUuid("00000001", person.unit),
              person_id: detUuid("00000002", index + 1),
              relationship_type: person.relationshipType,
              start_date: new Date("2024-02-01"),
              end_date: null,
            },
            Sequelize,
          ),
        ),
        bulkOptions,
      );

      let ubrIndex = 0;
      const ubrRows = [
        ...staffUsers.map((staff) => {
          ubrIndex += 1;
          return withDefaults(
            {
              id: detUuid("00000005", ubrIndex),
              user_id: staff.id,
              role_id: roleIdByName[staff.role],
              building_id: staff.buildingId,
            },
            Sequelize,
          );
        }),
        ...residentUsers.map((resident) => {
          ubrIndex += 1;
          return withDefaults(
            {
              id: detUuid("00000005", ubrIndex),
              user_id: resident.id,
              role_id: roleIdByName.RESIDENT,
              building_id: resident.buildingId,
            },
            Sequelize,
          );
        }),
      ];

      await queryInterface.bulkInsert("users_buildings_roles", ubrRows, bulkOptions);
    });
  },

  async down(queryInterface, Sequelize) {
    const userIds = Array.from({ length: USER_COUNT }, (_, index) => detUuid("00000003", index + 1));
    const personIds = Array.from({ length: PEOPLE.length }, (_, index) => detUuid("00000002", index + 1));
    const unitPeopleIds = Array.from({ length: PEOPLE.length }, (_, index) => detUuid("00000004", index + 1));
    const ubrIds = Array.from({ length: USER_COUNT }, (_, index) => detUuid("00000005", index + 1));

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        "users_buildings_roles",
        { id: { [Sequelize.Op.in]: ubrIds } },
        { transaction },
      );

      await queryInterface.bulkDelete(
        "users",
        { id: { [Sequelize.Op.in]: userIds } },
        { transaction },
      );

      await queryInterface.bulkDelete(
        "unit_people",
        { id: { [Sequelize.Op.in]: unitPeopleIds } },
        { transaction },
      );

      await queryInterface.bulkDelete(
        "people",
        { id: { [Sequelize.Op.in]: personIds } },
        { transaction },
      );
    });
  },
};