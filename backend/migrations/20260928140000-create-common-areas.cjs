"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("common_areas", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      building_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "buildings", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
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

    await queryInterface.sequelize.query(
      "ALTER TABLE common_areas ADD CONSTRAINT common_areas_capacity_positive CHECK (capacity > 0)",
    );

    await queryInterface.addIndex(
      "common_areas",
      ["building_id", "is_active"],
      { name: "common_areas_building_active" },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("common_areas");
  },
};