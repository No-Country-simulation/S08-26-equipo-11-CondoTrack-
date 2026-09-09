import { Sequelize } from "sequelize";
import { config } from "./env.js";

const isProduction = config.nodeEnv === "production";

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: "postgres",
  protocol: "postgres",

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
  console.log("[Database] ✅ Conexion establecida");
}

export default sequelize;
