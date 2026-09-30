"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("incidents", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
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

      unit_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "units",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      reported_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      assigned_to_person_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "people",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      severity: {
        type: Sequelize.ENUM(
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
        ),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          "OPEN",
          "IN_PROGRESS",
          "RESOLVED",
          "CLOSED",
          "CANCELLED",
        ),
        allowNull: false,
        defaultValue: "OPEN",
      },

      resolved_at: {
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("incidents");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_incidents_severity";',
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_incidents_status";',
    );
  },
};