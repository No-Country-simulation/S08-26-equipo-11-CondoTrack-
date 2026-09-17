"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "users_buildings_roles"
      DROP CONSTRAINT IF EXISTS "users_buildings_roles_role_id_key";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users_buildings_roles"
      DROP CONSTRAINT IF EXISTS "users_buildings_roles_user_id_building_id_key";
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT IF EXISTS "users_document_number_key1";
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "users_buildings_roles"
      ADD CONSTRAINT "users_buildings_roles_role_id_key" UNIQUE ("role_id");
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users_buildings_roles"
      ADD CONSTRAINT "users_buildings_roles_user_id_building_id_key" UNIQUE ("user_id", "building_id");
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "users_document_number_key1" UNIQUE ("document_number");
    `);
  },
};
