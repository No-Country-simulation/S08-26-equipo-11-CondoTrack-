import { z } from "zod";
import AppError from "../../utils/AppError.js";
import { uuidSchema } from "../../utils/uuid.js";

const schema = z.strictObject({
  unitId: uuidSchema("unitId debe ser un UUID válido"),

  startAt: z.iso.datetime({ offset: true }),

  endAt: z.iso.datetime({ offset: true }),

  notes: z.string().trim().max(2000).nullable().optional(),
});

export type CreateReservationDto = z.infer<typeof schema>;

export function validateCreateReservation(
  input: unknown,
): CreateReservationDto {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      result.error.issues.map((issue) => issue.message).join("; "),
      400,
    );
  }

  if (Date.parse(result.data.endAt) <= Date.parse(result.data.startAt)) {
    throw new AppError("endAt debe ser posterior a startAt", 400);
  }

  return result.data;
}
