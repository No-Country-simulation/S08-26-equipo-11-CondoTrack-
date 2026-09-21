"use strict";

const bcrypt = require("bcrypt");

const BCRYPT_ROUNDS = 10;

//el mismo UUID sentinel que usa la base compartida para el edificio de bootstrap
const BOOTSTRAP_BUILDING_ID = "00000000-0000-0000-0000-000000000001";

const BOOTSTRAP_BUILDING = {
  id: BOOTSTRAP_BUILDING_ID,
  name: "Edificio Principal",
  address: "Dirección no especificada",
  city: "Ciudad no especificada",
  state: "Provincia no especificada",
  number_of_floors: 0,
  number_of_units: 0,
  is_active: true,
};

const BASE_ROLES = [
  { name: "SUPER_ADMIN", description: "Administrador general del sistema" },
  { name: "ADMIN", description: "Administrador de condominio" },
  { name: "RECEPTION", description: "Personal de recepción" },
  { name: "MAINTENANCE", description: "Personal de mantenimiento" },
  { name: "RESIDENT", description: "Rol por defecto para residentes" },
];

//id, created_at y updated_at se proveen explicitamente porque algunas bases no conservan los DEFAULT definidos en las migraciones
function withDefaults(record, Sequelize) {
  return {
    ...record,
    id: record.id || Sequelize.literal("gen_random_uuid()"),
    created_at: Sequelize.literal("now()"),
    updated_at: Sequelize.literal("now()"),
  };
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const email = process.env.SEED_SUPER_ADMIN_EMAIL;
    const password = process.env.SEED_SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "[Seed] SEED_SUPER_ADMIN_EMAIL y SEED_SUPER_ADMIN_PASSWORD deben estar definidas en el entorno para ejecutar este seeder",
      );
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await queryInterface.sequelize.transaction(async (transaction) => {
      const bulkOptions = { ignoreDuplicates: true, transaction };

      await queryInterface.bulkInsert(
        "roles",
        BASE_ROLES.map(({ name, description }) =>
          withDefaults({ name, description }, Sequelize),
        ),
        bulkOptions,
      );

      await queryInterface.bulkInsert(
        "buildings",
        [withDefaults(BOOTSTRAP_BUILDING, Sequelize)],
        bulkOptions,
      );

      await queryInterface.bulkInsert(
        "users",
        [
          withDefaults(
            {
              first_name: "Super",
              last_name: "Admin",
              email,
              password_hash: passwordHash,
              status: "ACTIVE",
            },
            Sequelize,
          ),
        ],
        bulkOptions,
      );

      const superAdminRoleRows = await queryInterface.sequelize.query(
        "SELECT id FROM roles WHERE name = :name LIMIT 1",
        {
          replacements: { name: "SUPER_ADMIN" },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const seedUserRows = await queryInterface.sequelize.query(
        "SELECT id FROM users WHERE email = :email LIMIT 1",
        {
          replacements: { email },
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const superAdminRoleId = superAdminRoleRows[0]?.id;
      const seedUserId = seedUserRows[0]?.id;

      if (!superAdminRoleId || !seedUserId) {
        throw new Error(
          "[Seed] No se pudo resolver el rol SUPER_ADMIN o el usuario para crear la asignación",
        );
      }

      await queryInterface.bulkInsert(
        "users_buildings_roles",
        [
          withDefaults(
            {
              user_id: seedUserId,
              role_id: superAdminRoleId,
              building_id: BOOTSTRAP_BUILDING_ID,
            },
            Sequelize,
          ),
        ],
        bulkOptions,
      );
    });
  },

  async down(queryInterface, Sequelize) {
    const email = process.env.SEED_SUPER_ADMIN_EMAIL;
    if (!email) {
      return;
    }

    const seedUserRows = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = :email LIMIT 1",
      {
        replacements: { email },
        type: Sequelize.QueryTypes.SELECT,
      },
    );

    if (seedUserRows[0]) {
      await queryInterface.bulkDelete("users_buildings_roles", {
        user_id: seedUserRows[0].id,
        building_id: BOOTSTRAP_BUILDING_ID,
      });

      await queryInterface.bulkDelete("users", { id: seedUserRows[0].id });
    }
  },
};
