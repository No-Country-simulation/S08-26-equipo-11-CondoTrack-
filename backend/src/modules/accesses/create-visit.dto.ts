import { z } from "zod";

import AppError from "../../utils/AppError.js";

const createVisitSchema = z.object({
  visitorName: z
    .string()
    .trim()
    .min(2, "visitorName: El nombre del visitante es obligatorio")
    .max(100, "visitorName: El nombre no puede superar los 100 caracteres"),
  visitorDni: z
    .string()
    .trim()
    .min(3, "visitorDni: El DNI del visitante es obligatorio")
    .max(50, "visitorDni: El documento no puede superar los 50 caracteres"),
  estimatedAt: z.iso
    .datetime({
      offset: true,
      error: "estimatedAt: Debe ser una fecha/hora estimada en formato ISO 8601",
    })
    .transform((value) => new Date(value)),
});

export type CreateVisitDto = z.infer<typeof createVisitSchema>;

export function validateCreateVisitDto(input: unknown): CreateVisitDto {
  try {
    return createVisitSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(
        error.issues.map((issue) => issue.message).join("; "),
        400,
      );
    }

    throw error;
  }
}