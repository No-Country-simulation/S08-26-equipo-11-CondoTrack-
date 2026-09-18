import express, { Request, Response } from "express";
import cors from "cors";
import passport from "passport";
import swaggerUi from "swagger-ui-express";

import { sequelize } from "./config/database.js";
import { swaggerSpec } from "./config/swagger.js";
import errorHandler from "./middlewares/errorHandler.js";
import indexRouter from "./routes/index.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api", indexRouter);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Verificar que la API está funcionando
 *     description: Endpoint raíz de CondoTrack.
 *     tags:
 *       - General
 *     responses:
 *       200:
 *         description: API funcionando correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: CondoTrack API funcionando
 */
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "CondoTrack API funcionando" });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar el estado de la API
 *     description: Comprueba la conexión de la API con la base de datos.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API y base de datos funcionando correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: La base de datos no está disponible.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
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

app.use(errorHandler);

export default app;
