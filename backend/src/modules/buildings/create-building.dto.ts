import { z } from "zod";

import AppError from "../../utils/AppError.js";

export const createBuildingSchema = z.object({
  name: z
    .string({ error: "name es obligatorio" })
    .trim()
    .min(1, "name es obligatorio"),

  address: z
    .string({ error: "address es obligatorio" })
    .trim()
    .min(1, "address es obligatorio"),

  city: z
    .string({ error: "city es obligatorio" })
    .trim()
    .min(1, "city es obligatorio"),

  state: z
    .string({ error: "state es obligatorio" })
    .trim()
    .min(1, "state es obligatorio"),

  numberOfFloors: z
    .number({ error: "numberOfFloors es obligatorio" })
    .int("numberOfFloors debe ser un número entero")
    .positive("numberOfFloors debe ser mayor a 0"),

  numberOfUnits: z
    .number({ error: "numberOfUnits es obligatorio" })
    .int("numberOfUnits debe ser un número entero")
    .positive("numberOfUnits debe ser mayor a 0"),

  zipCode: z.string().trim().max(20).optional(),

  description: z.string().trim().optional(),
});

export type CreateBuildingDto = z.infer<typeof createBuildingSchema>;

export function validateCreateBuildingDto(input: unknown): CreateBuildingDto {
  try {
    return createBuildingSchema.parse(input);
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