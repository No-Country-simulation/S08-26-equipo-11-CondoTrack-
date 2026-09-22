"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "units",
      "units_building_id_unit_number_unique",
    );

    await queryInterface.renameColumn("units", "unit_number", "code");
    await queryInterface.renameColumn("units", "type", "unit_type");

    await queryInterface.removeColumn("units", "area_m2");

    await queryInterface.addColumn("units", "is_active", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addIndex("units", ["building_id", "code"], {
      unique: true,
      name: "units_building_id_code_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "units",
      "units_building_id_code_unique",
    );

    await queryInterface.removeColumn("units", "is_active");

    await queryInterface.renameColumn("units", "code", "unit_number");
    await queryInterface.renameColumn("units", "unit_type", "type");

    await queryInterface.addColumn("units", "area_m2", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    await queryInterface.addIndex(
      "units",
      ["building_id", "unit_number"],
      {
        unique: true,
        name: "units_building_id_unit_number_unique",
      },
    );
  },
};
