import { z } from "zod";
import AppError from "../../../utils/AppError.js";

const updateUnitSchema = z.strictObject({
  code: z
    .string()
    .trim()
    .min(1, "code no puede estar vacío")
    .max(20)
    .transform((value) => value.toUpperCase())
    .optional(),

  floor: z
    .number()
    .int("floor debe ser entero")
    .nonnegative("floor no puede ser negativo")
    .optional(),

  unitType: z
    .string()
    .trim()
    .min(1, "unitType no puede estar vacío")
    .max(50)
    .transform((value) => value.toUpperCase())
    .optional(),

  description: z.string().trim().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUnitDto = z.infer<typeof updateUnitSchema>;

export function validateUpdateUnitDto(input: unknown): UpdateUnitDto {
  const result = updateUnitSchema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      result.error.issues.map((issue) => issue.message).join("; "),
      400,
    );
  }

  if (!Object.keys(result.data).length) {
    throw new AppError("Debe indicar al menos un campo", 400);
  }

  return result.data;
}
