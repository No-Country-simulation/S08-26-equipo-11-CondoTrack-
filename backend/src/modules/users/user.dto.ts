import { z } from "zod";
import AppError from "../../utils/AppError.js";
import { ROLES } from "../roles/role.types.js";

const profileSchema = z.strictObject({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  documentType: z
    .enum(["DNI", "PASSPORT", "CI", "CUIT", "CUIL"])
    .nullable()
    .optional(),
  documentNumber: z.string().trim().min(1).max(50).nullable().optional(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "phone debe tener formato E.164")
    .nullable()
    .optional(),
});

const manageSchema = z.strictObject({
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
  roles: z
    .array(
      z.strictObject({
        buildingId: z.uuid(),
        roleName: z.enum(ROLES),
      }),
    )
    .optional(),
});

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const listQuerySchema = z.strictObject({
  buildingId: z
    .string()
    .regex(UUID_REGEX, "buildingId debe ser un UUID válido")
    .optional(),
  role: z.enum(["RESIDENT", "RECEPTION", "MAINTENANCE"]).optional(),
  page: z
    .string()
    .regex(/^\d+$/, "page debe ser un número entero")
    .transform((value) => Math.max(parseInt(value, 10), 1))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "limit debe ser un número entero")
    .transform((value) => Math.min(Math.max(parseInt(value, 10), 1), 100))
    .optional(),
});

export type UpdateProfileDto = z.infer<typeof profileSchema>;
export type ManageUserDto = z.infer<typeof manageSchema>;
export type UserListQuery = z.infer<typeof listQuerySchema>;

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    const forbidden = result.error.issues.some(
      (issue) => issue.code === "unrecognized_keys",
    );

    throw new AppError(
      forbidden
        ? "El campo indicado no se puede modificar"
        : result.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; "),
      forbidden ? 403 : 400,
    );
  }

  if (!Object.keys(result.data as object).length) {
    throw new AppError("Debe indicar al menos un campo", 400);
  }

  return result.data;
}

export const validateProfile = (input: unknown) => parse(profileSchema, input);

export const validateManage = (input: unknown) => parse(manageSchema, input);

export const validateListUsers = (
  input: Record<string, unknown>,
): UserListQuery => {
  const result = listQuerySchema.safeParse(input);

  if (!result.success) {
    throw new AppError(
      result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
      400,
    );
  }

  return result.data;
};
