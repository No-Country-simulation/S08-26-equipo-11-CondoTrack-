import { readFileSync } from "node:fs";
import path from "node:path";

const swaggerFilePath = path.join(
  process.cwd(),
  "swagger-output.json"
);

export const swaggerSpec = JSON.parse(
  readFileSync(swaggerFilePath, "utf-8")
);