import { z } from "zod";

import AppError from "../../../utils/AppError.js";

const linkResidentSchema = z.object({
  email: z.email("El email debe tener un formato válido").trim().toLowerCase(),
});

export type LinkResidentDto = z.infer<typeof linkResidentSchema>;

export function validateLinkResidentDto(input: unknown): LinkResidentDto {
  try {
    return linkResidentSchema.parse(input);
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
