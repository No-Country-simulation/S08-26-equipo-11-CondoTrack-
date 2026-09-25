import { z } from "zod";

import AppError from "../../utils/AppError.js";

const listBuildingsSchema = z.object({
  includeInactive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default(false),
});

export type ListBuildingsDto = z.infer<typeof listBuildingsSchema>;

export function validateListBuildingsDto(input: unknown): ListBuildingsDto {
  try {
    return listBuildingsSchema.parse(input);
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
