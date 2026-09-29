import { z } from "zod";

/**
 * Los seeders generan UUIDs deterministas con los nibbles de version y variante
 * en 0 (por ejemplo 00000000-0000-0000-0000-000000000002). z.uuid() de Zod v4
 * valida esos nibbles segun RFC 9562 y los rechaza, por lo que se usa z.guid(),
 * que unicamente exige el formato 8-4-4-4-12 hexadecimal.
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = (message = "debe ser un UUID válido") =>
  z.guid(message);

export const isUuid = (value: string): boolean => UUID_REGEX.test(value);