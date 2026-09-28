import { z } from "zod";
import AppError from "../../utils/AppError.js";

const schema = z.strictObject({
  name: z.string().trim().min(1, "name no puede estar vacío").max(100).optional(),

  address: z
    .string()
    .trim()
    .min(1, "address no puede estar vacío")
    .max(255)
    .optional(),

  numberOfFloors: z
    .number()
    .int("numberOfFloors debe ser entero")
    .nonnegative("numberOfFloors no puede ser negativo")
    .optional(),

  numberOfUnits: z
    .number()
    .int("numberOfUnits debe ser entero")
    .nonnegative("numberOfUnits no puede ser negativo")
    .optional(),

  isActive: z.boolean().optional(),
});

export type UpdateBuildingDto = z.infer<typeof schema>;

export function validateUpdateBuildingDto(
  input: unknown,
): UpdateBuildingDto {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new AppError(
      parsed.error.issues.map((issue) => issue.message).join("; "),
      400,
    );
  }

  if (!Object.keys(parsed.data).length) {
    throw new AppError("Debe indicar al menos un campo", 400);
  }

  return parsed.data;
}