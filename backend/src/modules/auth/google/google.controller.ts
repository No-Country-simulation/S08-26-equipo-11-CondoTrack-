import { Request, Response, NextFunction } from "express";

import { authenticateWithGoogle } from "./google.service.js";
import { GoogleUserData } from "./google.types.js";

export async function googleCallback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const googleUser = req.user as GoogleUserData;

    const result = await authenticateWithGoogle(googleUser);

    res.status(200).json({
      message: "Autenticación con Google exitosa",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}