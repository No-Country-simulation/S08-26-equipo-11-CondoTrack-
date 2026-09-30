"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("access_authorizations", {
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

      visitor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "people",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      authorized_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      valid_from: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      valid_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "PENDING",
      },

      qr_token_hash: {
        type: Sequelize.UUID,
        allowNull: false,
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

    await queryInterface.addIndex("access_authorizations", {
      unique: true,
      name: "access_authorizations_qr_token_hash_unique",
      fields: ["qr_token_hash"],
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("access_authorizations");
  },
};