"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "document_type", {
      type: Sequelize.STRING(30),
      allowNull: true,
    });

    await queryInterface.changeColumn("users", "document_number", {
      type: Sequelize.STRING(50),
      allowNull: true,
      unique: true,
    });

    await queryInterface.changeColumn("users", "phone", {
      type: Sequelize.STRING(30),
      allowNull: true,
    });

    await queryInterface.changeColumn("users", "password_hash", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("users", "google_id", {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "google_id");

    await queryInterface.changeColumn("users", "password_hash", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn("users", "phone", {
      type: Sequelize.STRING(30),
      allowNull: false,
    });

    await queryInterface.changeColumn("users", "document_number", {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn("users", "document_type", {
      type: Sequelize.STRING(30),
      allowNull: false,
    });
  },
};