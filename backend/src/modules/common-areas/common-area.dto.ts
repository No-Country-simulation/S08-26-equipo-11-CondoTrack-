import { z } from "zod";
import AppError from "../../utils/AppError.js";

const schema = z.strictObject({
  name: z.string().trim().min(1, "name es obligatorio").max(100),

  description: z.string().trim().nullable().optional(),

  capacity: z
    .number()
    .int("capacity debe ser entero")
    .positive("capacity debe ser mayor a cero"),
});

export type CreateCommonAreaDto = z.infer<typeof schema>;

export function validateCreateCommonArea(input: unknown): CreateCommonAreaDto {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      result.error.issues.map((issue) => issue.message).join("; "),
      400,
    );
  }

  return result.data;
}
