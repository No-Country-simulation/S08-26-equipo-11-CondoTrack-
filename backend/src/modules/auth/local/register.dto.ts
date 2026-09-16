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

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRegisterDto(input: unknown): RegisterDto {
  const body =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};

  const errors: string[] = [];

  const firstName = asString(body.firstName);
  const lastName = asString(body.lastName);
  const documentType = asString(body.documentType);
  const documentNumber = asString(body.documentNumber);
  const phone = asString(body.phone);

  if (!firstName) errors.push("firstName es obligatorio");
  if (!lastName) errors.push("lastName es obligatorio");
  if (!documentType) errors.push("documentType es obligatorio");
  if (!documentNumber) errors.push("documentNumber es obligatorio");
  if (!phone) errors.push("phone es obligatorio");

  const email = asString(body.email).toLowerCase();
  if (!email) {
    errors.push("email es obligatorio");
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push("email no tiene un formato válido");
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    errors.push("password es obligatoria");
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(
      `password debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    );
  }

  const buildingId = asString(body.buildingId);
  if (!buildingId) {
    errors.push("buildingId es obligatorio");
  } else if (!UUID_REGEX.test(buildingId)) {
    errors.push("buildingId no tiene un formato válido");
  }

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
