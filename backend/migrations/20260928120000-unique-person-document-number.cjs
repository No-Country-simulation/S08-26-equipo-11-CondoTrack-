"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex(
      "people",
      ["document_number"],
      {
        unique: true,
        name: "people_document_number_unique",
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "people",
      "people_document_number_unique",
    );
  },
};