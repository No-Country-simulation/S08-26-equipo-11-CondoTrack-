import path from "node:path";
import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "CondoTrack API",
      version: "1.0.0",
      description:
        "API para la gestión de edificios y condominios (backend Node.js + Express + TypeScript + Sequelize/PostgreSQL).",
      contact: {
        name: "No-Country Simulation · Equipo 11 · CondoTrack",
        url: "https://github.com/No-Country-simulation/S08-26-equipo-11-CondoTrack-/tree/backend",
      },
      license: { name: "ISC" },
    },
    servers: [
      { url: "http://localhost:3000", description: "Desarrollo local" },
    ],
  },
  apis: [path.join(process.cwd(), "src/docs/openapi.docs.ts")],
};

export const swaggerSpec = swaggerJSDoc(options);
