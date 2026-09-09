import app from "./app.js";
import { config } from "./config/env.js";
import { checkDatabaseConnection } from "./config/database.js";
import sequelize from "./config/database.js";

async function startServer() {
  try {
    await checkDatabaseConnection();
  } catch (error) {
    console.error("[Database] 💥 Fallo la conexion");
    console.error(error);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`[Server] ✅ Corriendo en http://localhost:${config.port}`);
  });

  //manejar la señal de cierre del server y cerrar tambien la db
  const shutdown = (signal: string) => {
    console.log(`[Server] Señal ${signal} recibida. Cerrando...`);
    server.close(async () => {
      await sequelize.close();
      console.log("[Server] Proceso terminado");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer();
