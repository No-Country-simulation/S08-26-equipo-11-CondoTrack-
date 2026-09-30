"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Eventos de acceso (CT-S4-02): el flujo de porteria deja el rastro de
    // ingresos y salidas. authorization_id admite null para eventos que
    // todavia no referencian un pase de visita.
    await queryInterface.createTable("access_events", {
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

      authorization_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "access_authorizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      registered_by_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      event_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      access_method: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      occurred_at: {
        type: Sequelize.DATE,
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

    // La porteria consulta el historial de una autorizacion por tipo de evento.
    await queryInterface.addIndex("access_events", {
      name: "access_events_authorization_event_index",
      fields: ["authorization_id", "event_type"],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("access_events", "access_events_authorization_event_index");
    await queryInterface.dropTable("access_events");
  },
};
