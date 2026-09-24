"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX unit_people_active_unique
      ON unit_people (unit_id, person_id, relationship_type)
      WHERE end_date IS NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS unit_people_active_unique;
    `);
  },
};