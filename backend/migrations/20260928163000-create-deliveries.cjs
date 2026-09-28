"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("deliveries", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      building_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "buildings", key: "id" },
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
      recipient_person_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "people", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      received_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      picked_up_by_user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      carrier: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      tracking_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "RECEIVED",
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      notified_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      picked_up_at: {
        type: Sequelize.DATE,
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
      "ALTER TABLE deliveries ADD CONSTRAINT deliveries_status_allowed CHECK (status IN ('RECEIVED','NOTIFIED','PICKED_UP','RETURNED','LOST'))",
    );

    await queryInterface.sequelize.query(
      "ALTER TABLE deliveries ADD CONSTRAINT deliveries_carrier_allowed CHECK (carrier IN ('Mercado Libre','Correo Argentino', 'Andreani', OCA','DHL','Otro'))",
    );

    await queryInterface.addIndex(
      "deliveries",
      ["building_id", "status", "received_at"],
      { name: "deliveries_building_status_received" },
    );

    await queryInterface.addIndex(
      "deliveries",
      ["unit_id", "received_at"],
      { name: "deliveries_unit_received" },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("deliveries");
  },
};