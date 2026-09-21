import { z } from "zod";
import AppError from "../../../utils/AppError.js";

export const PASSWORD_MIN_LENGTH = 8;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerSchema = z.object({
  firstName: z
    .string({ error: "firstName es obligatorio" })
    .trim()
    .min(1, "firstName es obligatorio"),
  lastName: z
    .string({ error: "lastName es obligatorio" })
    .trim()
    .min(1, "lastName es obligatorio"),
  documentType: z
    .string({ error: "documentType es obligatorio" })
    .trim()
    .min(1, "documentType es obligatorio"),
  documentNumber: z
    .string({ error: "documentNumber es obligatorio" })
    .trim()
    .min(1, "documentNumber es obligatorio"),
  phone: z
    .string({ error: "phone es obligatorio" })
    .trim()
    .min(1, "phone es obligatorio"),
  email: z
    .string({ error: "email es obligatorio" })
    .trim()
    .toLowerCase()
    .min(1, "email es obligatorio")
    .refine(
      (value) => value === "" || EMAIL_REGEX.test(value),
      "email no tiene un formato válido",
    ),
  password: z
    .string({ error: "password es obligatoria" })
    .min(1, "password es obligatoria")
    .refine(
      (value) =>
        value.length === 0 || value.length >= PASSWORD_MIN_LENGTH,
      `password debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    ),
  buildingId: z
    .string({ error: "buildingId es obligatorio" })
    .trim()
    .min(1, "buildingId es obligatorio")
    .refine(
      (value) => value === "" || UUID_REGEX.test(value),
      "buildingId no tiene un formato válido",
    ),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export function validateRegisterDto(input: unknown): RegisterDto {
  try {
    return registerSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => e.message);
      throw new AppError(messages.join("; "), 400);
    }
    throw error;
  }
}