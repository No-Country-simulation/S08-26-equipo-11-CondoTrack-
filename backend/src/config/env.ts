import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `[Env] ‼️ Variable de entorno requerida no definida: ${name}`,
    );
    process.exit(1);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: requireEnv("DATABASE_URL"),
};
