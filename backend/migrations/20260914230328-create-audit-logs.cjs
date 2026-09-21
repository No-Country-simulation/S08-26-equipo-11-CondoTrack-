"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("audit_logs", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },

      building_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "buildings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      unit_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "units",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      performed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      table_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      record_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },

      old_values: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      new_values: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      ip_address: {
        type: Sequelize.INET,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("audit_logs", ["performed_by"], {
      name: "audit_logs_performed_by",
    });

    await queryInterface.addIndex(
      "audit_logs",
      ["table_name", "record_id"],
      {
        name: "audit_logs_table_name_record_id",
      }
    );

    await queryInterface.addIndex("audit_logs", ["created_at"], {
      name: "audit_logs_created_at",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("audit_logs");
  },
};