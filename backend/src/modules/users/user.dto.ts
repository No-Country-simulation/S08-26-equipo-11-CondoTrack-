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

export type UpdateProfileDto = z.infer<typeof profileSchema>;
export type ManageUserDto = z.infer<typeof manageSchema>;

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

// Es el mismo criterio de validacion que aplica el controller de este modulo a los ids de ruta
const uuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "debe ser un UUID valido",
  );

const listSchema = z
  .strictObject({
    buildingId: z
      .union([uuidSchema, z.literal("")])
      .optional()
      .transform((value) => (value ? value : undefined)),
    role: z
      .enum(["RESIDENT", "RECEPTION", "MAINTENANCE"], {
        message: "El rol debe ser RESIDENT, RECEPTION o MAINTENANCE",
      })
      .optional(),
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();

export type ListUsersDto = z.infer<typeof listSchema>;

export const validateListUsers = (input: unknown): ListUsersDto => {
  const result = listSchema.safeParse(input);

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
