import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { config } from "../../config/env.js";

export interface JwtPayloadBase {
  sub: string; //recibe el id del user
}

export function signToken(payload: JwtPayloadBase): string {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, config.jwtSecret, options); //devuelve el token y la clave secreta
}

//verificando el token
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
