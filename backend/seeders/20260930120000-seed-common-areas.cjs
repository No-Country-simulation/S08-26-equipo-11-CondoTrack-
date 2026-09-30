"use strict";

// CT-S4-10 Tier 4: espacios comunes por edificio.
// Los nombres y capacidades salen de la definicion del ticket. Se siembran los
// tres edificios existentes (bootstrap + las dos torres) porque common_areas no
// depende de unidades: el edificio bootstrap todavia no tiene ninguna.

//genera UUIDs deterministas con el mismo formato del edificio de bootstrap
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

//ids que define 20260921120000-seed-base-roles-and-super-admin.cjs y
//20260924120000-seed-buildings-units.cjs
const BUILDING_PRINCIPAL_ID = detUuid("00000000", 1);
const BUILDING_NORTH_ID = detUuid("00000000", 2);
const BUILDING_SOUTH_ID = detUuid("00000000", 3);

//mismos cuatro espacios para cada edificio; capacity cumple el CHECK capacity > 0
const AREA_TEMPLATES = [
  { name: "Parrilla", capacity: 30, description: "Area de parrilla compartida en la azotea" },
  { name: "Gimnasio", capacity: 25, description: "Gimnasio con equipamiento de fuerza y cardio" },
  { name: "Salón de Eventos", capacity: 80, description: "Salón de eventos para reuniones y reencuentros" },
  { name: "Coworking", capacity: 20, description: "Sala de coworking con mesas e internet" },
];

const BUILDINGS = [
  BUILDING_PRINCIPAL_ID,
  BUILDING_NORTH_ID,
  BUILDING_SOUTH_ID,
];

const COMMON_AREAS = BUILDINGS.flatMap((buildingId, buildingIndex) =>
  AREA_TEMPLATES.map((template, areaIndex) => ({
    id: detUuid("00000006", buildingIndex * AREA_TEMPLATES.length + areaIndex + 1),
    building_id: buildingId,
    name: template.name,
    description: template.description,
    capacity: template.capacity,
    is_active: true,
  }))
);

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkInsert(
        "common_areas",
        COMMON_AREAS.map((area) => withDefaults(area, Sequelize)),
        { ignoreDuplicates: true, transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    const areaIds = COMMON_AREAS.map((area) => area.id);

    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkDelete(
        "common_areas",
        { id: { [Sequelize.Op.in]: areaIds } },
        { transaction },
      );
    });
  },
};