import { Sequelize } from "sequelize-typescript";
import { config } from "./env.js";

import { User } from "../modules/users/user.model.js";
import { Role } from "../modules/roles/role.model.js";
import { Building } from "../modules/buildings/building.model.js";
import { Unit } from "../modules/units/unit.model.js";
import { UserBuildingRole } from "../modules/users-buildings-roles/user-building-role.model.js";
import { AuditLog } from "../modules/audit/audit.model.js";

import { setupRelations } from "./relations.models.js";

const isProduction = config.nodeEnv === "production";

export const sequelize = new Sequelize(config.databaseUrl, {
  dialect: "postgres",
  protocol: "postgres",

  models: [User, Role, Building, Unit, AuditLog, UserBuildingRole],

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

setupRelations(); //establecer las relaciones entre los modelos

export async function checkDatabaseConnection(): Promise<void> {
  console.log("[Database] ⌛ Conectando a PostgreSQL...");

  // await sequelize.authenticate();

  console.log("[Database] ✅ Conexion establecida");
}
