import express, { Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import swaggerUi from "swagger-ui-express";

import { sequelize } from "./database/database.js";
import { swaggerSpec } from "./config/swagger.js";
import errorHandler from "./middlewares/errorHandler.js";
import indexRouter from "./routes/index.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api", indexRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "CondoTrack API funcionando" });
});

app.get("/health", async (req: Request, res: Response) => {
  let databaseStatus = "disconnected";
  try {
    await sequelize.authenticate();
    databaseStatus = "connected";
  } catch {
    databaseStatus = "disconnected";
  }

  const isHealthy = databaseStatus === "connected";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "error",
    services: { database: databaseStatus },
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 catch-all: ruta no encontrada. tiene que ir al final, despues de TODAS las rutas y routers montados
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

app.use(errorHandler);

export default app;
