"use strict";

//genera UUIDs deterministas con el mismo formato del edificio de bootstrap
//(solo las partes altas son fijas; "n" se codifica en los últimos 12 dígitos)
function detUuid(segment, n) {
  return `${segment}-0000-0000-0000-${String(n).padStart(12, "0")}`;
}

//id, created_at y updated_at se proveen explicitamente porque algunas bases no conservan los DEFAULT definidos en las migraciones
function withDefaults(record, Sequelize) {
  return {
    ...record,
    id: record.id || Sequelize.literal("gen_random_uuid()"),
    created_at: Sequelize.literal("now()"),
    updated_at: Sequelize.literal("now()"),
  };
}

const BUILDING_NORTH_ID = detUuid("00000000", 2);
const BUILDING_SOUTH_ID = detUuid("00000000", 3);

const TEST_BUILDINGS = [
  {
    id: BUILDING_NORTH_ID,
    name: "Torre Norte",
    address: "Av. del Libertador 1245",
    city: "Buenos Aires",
    state: "CABA",
    zip_code: "1426",
    description: "Edificio ficticio de pruebas (seeder Tier 1-3)",
    number_of_floors: 9,
    number_of_units: 18,
    is_active: true,
  },
  {
    id: BUILDING_SOUTH_ID,
    name: "Torre Sur",
    address: "Av. Rivadavia 3100",
    city: "Buenos Aires",
    state: "CABA",
    zip_code: "1203",
    description: "Segundo edificio ficticio de pruebas (seeder Tier 1-3)",
    number_of_floors: 9,
    number_of_units: 18,
    is_active: true,
  },
];

const UNITS_PER_BUILDING = 18;

//por piso: unidad "A" y unidad "B" -> 9 pisos x 2 unidades = 18 por edificio
function buildUnits() {
  const units = [];
  let index = 1;
  for (const building of TEST_BUILDINGS) {
    for (let i = 1; i <= UNITS_PER_BUILDING; i += 1) {
      const floor = Math.ceil(i / 2);
      const letter = i % 2 === 1 ? "A" : "B";
      units.push({
        id: detUuid("00000001", index),
        building_id: building.id,
        code: `${floor}${letter}`,
        floor,
        unit_type: floor === 1 ? "LOCAL_COMERCIAL" : "DEPARTAMENTO",
        description: null,
        is_active: true,
      });
      index += 1;
    }
  }
  return units;
}

const UNITS = buildUnits();

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const bulkOptions = { ignoreDuplicates: true, transaction };

      await queryInterface.bulkInsert(
        "buildings",
        TEST_BUILDINGS.map((building) => withDefaults(building, Sequelize)),
        bulkOptions,
      );

      await queryInterface.bulkInsert(
        "units",
        UNITS.map((unit) => withDefaults(unit, Sequelize)),
        bulkOptions,
      );
    });
  },

  async down(queryInterface, Sequelize) {
    const unitIds = UNITS.map((unit) => unit.id);
    const buildingIds = TEST_BUILDINGS.map((building) => building.id);

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        "units",
        { id: { [Sequelize.Op.in]: unitIds } },
        { transaction },
      );

      await queryInterface.bulkDelete(
        "buildings",
        { id: { [Sequelize.Op.in]: buildingIds } },
        { transaction },
      );
    });
  },
};