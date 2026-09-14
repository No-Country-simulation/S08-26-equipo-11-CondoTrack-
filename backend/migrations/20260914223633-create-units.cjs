"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("units", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },

      building_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "buildings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      unit_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      floor: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },

      area_m2: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex(
      "units",
      ["building_id", "unit_number"],
      {
        unique: true,
        name: "units_building_id_unit_number_unique",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("units");
  },
};