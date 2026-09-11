import swaggerAutogen from "swagger-autogen";

const doc = {
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
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/app.ts"];

swaggerAutogen({ openapi: "3.0.0" })(
  outputFile,
  endpointsFiles,
  doc
);