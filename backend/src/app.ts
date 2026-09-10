import cors from "cors";
import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import { sequelize } from "./config/database.js";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

export default app;
