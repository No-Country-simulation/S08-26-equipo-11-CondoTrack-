"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // qr_token_hash pasa de UUID a VARCHAR(64) para guardar el hash SHA-256
    // del token; en BD nunca se almacena el token utilizable.
    await queryInterface.changeColumn("access_authorizations", "qr_token_hash", {
      type: Sequelize.STRING(64),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("access_authorizations", "qr_token_hash", {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
};