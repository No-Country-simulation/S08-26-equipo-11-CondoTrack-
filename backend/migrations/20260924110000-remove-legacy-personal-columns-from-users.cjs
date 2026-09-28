"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("users", "first_name");
    await queryInterface.removeColumn("users", "last_name");
    await queryInterface.removeColumn("users", "document_type");
    await queryInterface.removeColumn("users", "document_number");
    await queryInterface.removeColumn("users", "phone");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "first_name", {
      type: Sequelize.STRING(100),
      allowNull: false,
    });

    await queryInterface.addColumn("users", "last_name", {
      type: Sequelize.STRING(100),
      allowNull: false,
    });

    await queryInterface.addColumn("users", "document_type", {
      type: Sequelize.STRING(30),
      allowNull: true,
    });

    await queryInterface.addColumn("users", "document_number", {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn("users", "phone", {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
  },
};