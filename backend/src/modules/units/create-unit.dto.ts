import { z } from "zod";

import AppError from "../../utils/AppError.js";

const createUnitSchema = z.object({
  code: z
    .string({ error: "code es obligatorio" })
    .trim()
    .min(1, "code es obligatorio")
    .max(20, "code puede tener como máximo 20 caracteres")
    .transform((value) => value.toUpperCase()),

  floor: z
    .number({ error: "floor es obligatorio" })
    .int("floor debe ser un número entero")
    .nonnegative("floor no puede ser negativo"),

  unitType: z
    .string({ error: "unitType es obligatorio" })
    .trim()
    .min(1, "unitType es obligatorio")
    .max(50, "unitType puede tener como máximo 50 caracteres")
    .transform((value) => value.toUpperCase()),

  description: z.string().trim().optional(),
});

export type CreateUnitDto = z.infer<typeof createUnitSchema>;

export function validateCreateUnitDto(input: unknown): CreateUnitDto {
  try {
    return createUnitSchema.parse(input);
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
