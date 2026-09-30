import { Sequelize } from "sequelize-typescript";
import { config } from "../config/env.js";

import { User } from "../modules/users/user.model.js";
import { Role } from "../modules/roles/role.model.js";
import { Building } from "../modules/buildings/building.model.js";
import { Unit } from "../modules/units/unit.model.js";
import { UserBuildingRole } from "../modules/users-buildings-roles/user-building-role.model.js";
import { AuditLog } from "../modules/audit/audit.model.js";
import { Person } from "../modules/people/people.model.js";
import { UnitPeople } from "../modules/unit-people/unit-people.model.js";
import { AccessAuthorization } from "../modules/accesses/access-authorization.model.js";
import { AccessEvent } from "../modules/accesses/access-event.model.js";
import { CommonArea } from "../modules/common-areas/common-area.model.js";
import { Reservation } from "../modules/reservations/reservation.model.js";
import { Incident } from "../modules/incidents/incident.model.js";
import { Delivery } from "../modules/deliveries/delivery.model.js";

import { setupRelations } from "./relations.models.js";

const isProduction = config.nodeEnv === "production";

export const sequelize = new Sequelize(config.databaseUrl, {
  dialect: "postgres",
  protocol: "postgres",

  models: [
    User,
    Role,
    Building,
    Unit,
    AuditLog,
    UserBuildingRole,
    Person,
    UnitPeople,
    AccessAuthorization,
    AccessEvent,
    CommonArea,
    Reservation,
    Incident,
    Delivery,
  ],

  logging: isProduction
    ? false
    : (msg: string) => console.log("[Database]", msg),

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

setupRelations();

export async function checkDatabaseConnection(): Promise<void> {
  console.log("[Database] ⌛ Conectando a PostgreSQL...");

  await sequelize.authenticate();

  console.log("[Database] ✅ Conexion establecida");
}
