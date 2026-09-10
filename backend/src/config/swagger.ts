import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CondoTrack API",
      version: "1.0.0",
      description: "API para la gestión de edificios y condominios",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: [
  "./src/modules/**/*.routes.ts",
  "./src/docs/**/*.swagger.ts",
],
};

export const swaggerSpec = swaggerJSDoc(options);