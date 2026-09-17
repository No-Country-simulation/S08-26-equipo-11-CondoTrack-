import AppError from "../../../utils/AppError.js";

export const PASSWORD_MIN_LENGTH = 8;

//expresion regular para validar UUID y email (segun stack overflow)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  buildingId: string;
}

function toRecord(input: unknown): Record<string, unknown> {
  return typeof input === "object" && input !== null
    ? (input as Record<string, unknown>)
    : {};
}

function requiredText(
  value: unknown,
  fieldName: string,
  errors: string[],
): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) errors.push(`${fieldName} es obligatorio`);
  return text;
}

function normalizeEmail(value: unknown, errors: string[]): string {
  const email = (typeof value === "string" ? value.trim() : "").toLowerCase();
  if (!email) errors.push("email es obligatorio");
  else if (!EMAIL_REGEX.test(email)) errors.push("email no tiene un formato válido");
  return email;
}

function validatePassword(value: unknown, errors: string[]): string {
  const password = typeof value === "string" ? value : "";
  if (!password) errors.push("password es obligatoria");
  else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`password debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`);
  }
  return password;
}

function validateBuildingId(value: unknown, errors: string[]): string {
  const buildingId = typeof value === "string" ? value.trim() : "";
  if (!buildingId) errors.push("buildingId es obligatorio");
  else if (!UUID_REGEX.test(buildingId)) {
    errors.push("buildingId no tiene un formato válido");
  }
  return buildingId;
}

export function validateRegisterDto(input: unknown): RegisterDto {
  const body = toRecord(input);
  const errors: string[] = [];

  const firstName = requiredText(body.firstName, "firstName", errors);
  const lastName = requiredText(body.lastName, "lastName", errors);
  const documentType = requiredText(body.documentType, "documentType", errors);
  const documentNumber = requiredText(
    body.documentNumber,
    "documentNumber",
    errors,
  );
  const phone = requiredText(body.phone, "phone", errors);

  const email = normalizeEmail(body.email, errors);
  const password = validatePassword(body.password, errors);
  const buildingId = validateBuildingId(body.buildingId, errors);

  if (errors.length > 0) {
    throw new AppError(errors.join("; "), 400);
  }

  return {
    firstName,
    lastName,
    email,
    password,
    documentType,
    documentNumber,
    phone,
    buildingId,
  };
}