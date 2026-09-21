"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("TEST BUILDINGS");
    console.log("createTable:", typeof queryInterface.createTable);
    console.log("UUID:", typeof Sequelize.UUID);
    console.log("STRING:", typeof Sequelize.STRING);
    console.log("TEXT:", typeof Sequelize.TEXT);
    console.log("BOOLEAN:", typeof Sequelize.BOOLEAN);
    console.log("DATE:", typeof Sequelize.DATE);
    console.log("literal:", typeof Sequelize.literal);

    await queryInterface.createTable("buildings", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },

      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      address: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      state: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      zip_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("buildings");
  },
};
