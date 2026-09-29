import { z } from "zod";

import AppError from "../../utils/AppError.js";

const validateQrSchema = z.object({
  qrToken: z
    .string()
    .trim()
    .min(1, "qrToken: El token del QR es obligatorio")
    .max(200, "qrToken: El token del QR es demasiado largo"),
});

const searchAccessQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "query: El criterio de busqueda es obligatorio")
    .max(100, "query: La busqueda no puede superar los 100 caracteres"),
});

export type ValidateQrDto = z.infer<typeof validateQrSchema>;
export type SearchAccessQueryDto = z.infer<typeof searchAccessQuerySchema>;

function toAppError(error: unknown): never {
  if (error instanceof z.ZodError) {
    throw new AppError(
      error.issues.map((issue) => issue.message).join("; "),
      400,
    );
  }

  throw error;
}

export function validateQrDto(input: unknown): ValidateQrDto {
  try {
    return validateQrSchema.parse(input);
  } catch (error) {
    return toAppError(error);
  }
}

export function validateSearchAccessQuery(input: unknown): SearchAccessQueryDto {
  try {
    return searchAccessQuerySchema.parse(input);
  } catch (error) {
    return toAppError(error);
  }
}
