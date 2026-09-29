import assert from "node:assert/strict";
import { test } from "node:test";

import { uuidSchema } from "../src/utils/uuid.js";

// Se replican los dos esquemas que fueron corregidos. No se importan los DTOs
// reales porque delivery.dto.ts carga el model de Sequelize, que abriria una
// conexion a la base de datos; asi la prueba sigue siendo unitaria.
const reservationSchemaShape = { unitId: uuidSchema("x") };
const deliverySchemaShape = { recipientPersonId: uuidSchema("x") };

const SEED_UNIT = "00000001-0000-0000-0000-000000000001";
const SEED_PERSON = "00000002-0000-0000-0000-000000000001";
const UI_ID = "66673f06-1fd7-40db-9b40-30c801d3eca8";

test("POST /common-areas/:id/reservations acepta unitId del seeder", () => {
  const result = reservationSchemaShape.unitId.safeParse(SEED_UNIT);
  assert.equal(result.success, true);
  assert.equal(result.data, SEED_UNIT);
});

test("POST /units/:unitId/deliveries acepta recipientPersonId del seeder", () => {
  const result = deliverySchemaShape.recipientPersonId.safeParse(SEED_PERSON);
  assert.equal(result.success, true);
  assert.equal(result.data, SEED_PERSON);
});

test("ambos siguen aceptando UUID v4 reales de la UI", () => {
  assert.equal(reservationSchemaShape.unitId.safeParse(UI_ID).success, true);
  assert.equal(deliverySchemaShape.recipientPersonId.safeParse(UI_ID).success, true);
});

test("ambos siguen rechazando identificadores invalidos", () => {
  assert.equal(reservationSchemaShape.unitId.safeParse("abc").success, false);
  assert.equal(deliverySchemaShape.recipientPersonId.safeParse("abc").success, false);
});
