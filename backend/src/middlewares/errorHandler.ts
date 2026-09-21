import { Request, Response, NextFunction } from "express";
import {
  ValidationError as SequelizeValidationError,
  UniqueConstraintError as SequelizeUniqueConstraintError,
  DatabaseError as SequelizeDatabaseError,
} from "sequelize";

import AppError from "../utils/AppError.js";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  if (!error.statusCode) error.statusCode = 500;
  if (!error.status) error.status = "error";

  if (err instanceof SequelizeValidationError) {
    error = new AppError(err.errors.map((e) => e.message).join(", "), 422);
  } else if (err instanceof SequelizeUniqueConstraintError) {
    error = new AppError(err.errors.map((e) => e.message).join(", "), 409);
  } else if (
    err instanceof SequelizeDatabaseError &&
    (err.parent as { code?: string }).code === "22P02"
  ) {
    error = new AppError(
      "El valor proporcionado no tiene un formato válido",
      400,
    );
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
