import { Sequelize } from "sequelize-typescript";
import { config } from "./env.js";

import { User } from "../modules/users/user.model.js";
import { Role } from "../modules/roles/role.model.js";
import { Building } from "../modules/buildings/building.model.js";
import { UserBuildingRole } from "../modules/users-buildings-roles/user-building-role.model.js";

const isProduction = config.nodeEnv === "production";

export const sequelize = new Sequelize(config.databaseUrl, {
  dialect: "postgres",
  protocol: "postgres",
  
  models: [
    User,
    Role,
    Building,
    UserBuildingRole,
  ],

  //config de los logs de la db
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

export async function checkDatabaseConnection(): Promise<void> {
  console.log("[Database] ⌛ Conectando a PostgreSQL...");
  await sequelize.authenticate();
  // await sequelize.sync();
  console.log("[Database] ✅ Conexion establecida");
}

