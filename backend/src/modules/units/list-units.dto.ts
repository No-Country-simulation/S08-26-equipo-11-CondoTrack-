import { z } from "zod";

import AppError from "../../utils/AppError.js";

const listUnitsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  code: z.string().trim().optional(),

  floor: z.coerce.number().int().nonnegative().optional(),

  unitType: z.string().trim().optional(),

  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export type ListUnitsDto = z.infer<typeof listUnitsSchema>;

export function validateListUnitsDto(input: unknown): ListUnitsDto {
  try {
    return listUnitsSchema.parse(input);
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
