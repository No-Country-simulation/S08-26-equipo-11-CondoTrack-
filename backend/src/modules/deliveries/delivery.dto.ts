import { z } from "zod";
import AppError from "../../utils/AppError.js";
import { CARRIERS, DELIVERY_STATUSES } from "./delivery.model.js";

const createSchema = z.strictObject({
  recipientPersonId: z.uuid("recipientPersonId debe ser un UUID válido"),

  carrier: z.enum(CARRIERS, {
    error:
      "carrier debe ser Mercado Libre, Correo, Correo Argentino, Andreani, OCA, DHL u Otro",
  }),

  trackingNumber: z.string().trim().min(1).max(100).nullable().optional(),
});

const listSchema = z.strictObject({
  status: z.enum(DELIVERY_STATUSES).optional(),
});

export type CreateDeliveryDto = z.infer<typeof createSchema>;
export type ListDeliveriesDto = z.infer<typeof listSchema>;

function validate<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      result.error.issues.map((issue) => issue.message).join("; "),
      400,
    );
  }

  return result.data;
}

export const validateCreateDelivery = (input: unknown) =>
  validate(createSchema, input);

export const validateListDeliveries = (input: unknown) =>
  validate(listSchema, input);
