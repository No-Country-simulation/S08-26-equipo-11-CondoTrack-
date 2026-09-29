"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reservations", {
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
      common_area_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "common_areas", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      unit_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "units", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      requested_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      start_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },
      notes: {
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

    await queryInterface.sequelize.query(
      "ALTER TABLE reservations ADD CONSTRAINT reservations_valid_interval CHECK (end_at > start_at)",
    );

    await queryInterface.sequelize.query(
      "ALTER TABLE reservations ADD CONSTRAINT reservations_status_allowed CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','COMPLETED','REJECTED'))",
    );

    await queryInterface.addIndex(
      "reservations",
      ["common_area_id", "status", "start_at", "end_at"],
      { name: "reservations_overlap_lookup" },
    );

    await queryInterface.addIndex(
      "reservations",
      ["building_id", "start_at"],
      { name: "reservations_building_start" },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("reservations");
  },
};