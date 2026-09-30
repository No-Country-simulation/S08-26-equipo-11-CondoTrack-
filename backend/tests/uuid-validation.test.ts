import assert from "node:assert/strict";
import { test } from "node:test";

import { isUuid, uuidSchema } from "../src/utils/uuid.js";
import { validateListUsers, validateManage } from "../src/modules/users/user.dto.js";

// IDs deterministas que generan los seeders con detUuid(): los nibbles de
// version y variante quedan en 0, por lo que z.uuid() de Zod v4 los rechaza.
const SEED_BOOTSTRAP_BUILDING = "00000000-0000-0000-0000-000000000001";
const SEED_BUILDING_NORTH = "00000000-0000-0000-0000-000000000002";
const SEED_BUILDING_SOUTH = "00000000-0000-0000-0000-000000000003";
const SEED_UNIT = "00000001-0000-0000-0000-000000000001";
const SEED_PERSON = "00000002-0000-0000-0000-000000000001";
const SEED_USER = "00000003-0000-0000-0000-000000000001";

// UUID v4 real, equivalente a lo que genera gen_random_uuid() en la UI.
const UI_BUILDING = "66673f06-1fd7-40db-9b40-30c801d3eca8";

test("el helper acepta los UUIDs deterministas del seeder", () => {
  for (const id of [
    SEED_BOOTSTRAP_BUILDING,
    SEED_BUILDING_NORTH,
    SEED_BUILDING_SOUTH,
    SEED_UNIT,
    SEED_PERSON,
    SEED_USER,
  ]) {
    assert.equal(isUuid(id), true, `isUuid deberia aceptar ${id}`);
  }
});

test("el helper sigue aceptando los UUID v4 reales de la UI", () => {
  assert.equal(isUuid(UI_BUILDING), true);
});

test("el helper sigue rechazando basura", () => {
  for (const id of [
    "",
    "1",
    "no-es-uuid",
    "00000000-0000-0000-0000",
    "00000000000000000000000000000000",
    "0000000g-0000-0000-0000-000000000002",
    "../../etc/passwd",
  ]) {
    assert.equal(isUuid(id), false, `isUuid deberia rechazar ${JSON.stringify(id)}`);
  }
});

test("PATCH /users/:id/manage acepta edificios del seeder (regresion del bug)", () => {
  const result = validateManage({
    status: "BLOCKED",
    roles: [
      { buildingId: SEED_BUILDING_NORTH, roleName: "RECEPTION" },
      { buildingId: SEED_BUILDING_SOUTH, roleName: "RESIDENT" },
    ],
  });

  assert.equal(result.status, "BLOCKED");
  assert.equal(result.roles?.length, 2);
  assert.equal(result.roles?.[0]?.buildingId, SEED_BUILDING_NORTH);
});

test("PATCH /users/:id/manage acepta edificios creados por la UI", () => {
  const result = validateManage({
    roles: [{ buildingId: UI_BUILDING, roleName: "ADMIN" }],
  });

  assert.equal(result.roles?.[0]?.buildingId, UI_BUILDING);
});

test("PATCH /users/:id/manage sigue rechazando buildingId invalido, en espanol", () => {
  assert.throws(
    () =>
      validateManage({
        roles: [{ buildingId: "no-es-uuid", roleName: "RESIDENT" }],
      }),
    (error: Error & { statusCode?: number }) => {
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /buildingId debe ser un UUID válido/);
      return true;
    },
  );
});

test("GET /users?buildingId= acepta edificios del seeder y de la UI", () => {
  for (const buildingId of [SEED_BOOTSTRAP_BUILDING, SEED_BUILDING_NORTH, UI_BUILDING]) {
    const result = validateListUsers({ buildingId });
    assert.equal(result.buildingId, buildingId);
  }
});

test("el schema compartido produce el mismo comportamiento que isUuid", () => {
  for (const id of [SEED_BUILDING_NORTH, UI_BUILDING]) {
    assert.equal(uuidSchema("x").safeParse(id).success, true);
  }
  for (const id of ["", "no-es-uuid", "0000"]) {
    assert.equal(uuidSchema("x").safeParse(id).success, false);
  }
});
