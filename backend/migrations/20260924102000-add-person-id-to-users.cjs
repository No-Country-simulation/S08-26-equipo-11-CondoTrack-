"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "person_id", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addConstraint("users", {
      fields: ["person_id"],
      type: "unique",
      name: "users_person_id_key",
    });

    await queryInterface.addConstraint("users", {
      fields: ["person_id"],
      type: "FOREIGN KEY",
      name: "users_person_id_fkey",
      references: {
        table: "people",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("users", "users_person_id_fkey");
    await queryInterface.removeConstraint("users", "users_person_id_key");
    await queryInterface.removeColumn("users", "person_id");
  },
};