import { Request, Response, NextFunction } from "express";
import {
  ValidationError as SequelizeValidationError,
  UniqueConstraintError as SequelizeUniqueConstraintError,
  DatabaseError as SequelizeDatabaseError,
} from "sequelize";

import AppError from "../utils/AppError.js";

//detecta el error que lanza express.json()/body-parser cuando el body llega con JSON malformado

const isMalformedJsonError = (err: any): boolean => {
  if (!(err instanceof SyntaxError)) return false;
  // `err instanceof SyntaxError` ya estrechó el tipo; volvemos a `any` para
  // poder leer las propiedades que body-parser añade (status/type).
  const parsedError = err as any;
  return (
    parsedError.status === 400 && parsedError.type === "entity.parse.failed"
  );
};

//devuelve un AppError con mensaje sin exponer nunca SQL, stack interno ni codigos de PostgreSQL
const friendlyError = (message: string, statusCode: number) =>
  new AppError(message, statusCode);

//catalogo cerrado de violaciones de unicidad
const UNIQUE_CONSTRAINT_MESSAGES = new Map<string, string>([
  ["users_email_key", "El email ya está registrado"],
  [
    "units_building_id_code_unique",
    "Ya existe una unidad con ese código en este edificio",
  ],
  [
    "users_google_id_key",
    "Esta cuenta de Google ya está vinculada a otro usuario",
  ],
]);

const DEFAULT_UNIQUE_MESSAGE = "El recurso que intentas crear ya existe";

//en PostgreSQL el nombre de la constraint llega en parent.constraint (23505)
const uniqueConstraintMessage = (
  err: SequelizeUniqueConstraintError,
): string => {
  const constraint =
    (err.parent as { constraint?: string } | undefined)?.constraint ?? "";

  return UNIQUE_CONSTRAINT_MESSAGES.get(constraint) ?? DEFAULT_UNIQUE_MESSAGE;
};

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  if (!error.statusCode) error.statusCode = 500;
  if (!error.status) error.status = "error";

  if (isMalformedJsonError(err)) {
    error = friendlyError("JSON inválido", 400);
  } else if (err instanceof SequelizeUniqueConstraintError) {
    // UniqueConstraintError hereda de ValidationError, asi que esta rama debe
    // evaluarse ANTES que ValidationError o los 409 se convertian en 422.
    error = friendlyError(uniqueConstraintMessage(err), 409);
  } else if (err instanceof SequelizeValidationError) {
    error = friendlyError(err.errors.map((e) => e.message).join(", "), 422);
  } else if (
    err instanceof SequelizeDatabaseError &&
    (err.parent as { code?: string }).code === "22P02"
  ) {
    //tipo/numero inválido (22P02) ===> 400
    error = friendlyError(
      "El valor proporcionado no tiene un formato válido",
      400,
    );
  } else if (
    err instanceof SequelizeDatabaseError &&
    (err.parent as { code?: string }).code === "23503"
  ) {
    //violacioon de foreign key (23503) ===> 400
    error = friendlyError("Referencia inválida", 400);
  } else if (
    err instanceof SequelizeDatabaseError &&
    (err.parent as { code?: string }).code === "22001"
  ) {
    //value muy largo (22001) ====> 400
    error = friendlyError("El valor supera la longitud máxima permitida", 400);
  }

  if (process.env.NODE_ENV === "production") {
    if (error.isOperational) {
      return res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    }

    return res
      .status(error.statusCode)
      .json({ success: false, message: "Error interno del servidor" });
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    error,
    stack: error.stack,
  });
};

export default errorHandler;
