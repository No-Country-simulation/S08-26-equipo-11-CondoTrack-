import { z } from "zod";
import AppError from "../../../utils/AppError.js";

//expresion regular para validar email
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = z.object({
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
    .min(1, "password es obligatoria"),
});

export type LoginUserDto = z.infer<typeof loginSchema>;

export function validateLoginDto(input: unknown): LoginUserDto {
  try {
    return loginSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((e) => e.message);
      throw new AppError(messages.join("; "), 400);
    }
    throw error;
  }
}
