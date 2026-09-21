export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";
export const ADMIN_ROLE = "ADMIN";
export const RECEPTION_ROLE = "RECEPTION";
export const MAINTENANCE_ROLE = "MAINTENANCE";
export const RESIDENT_ROLE = "RESIDENT";

export const ROLES = [
  SUPER_ADMIN_ROLE,
  ADMIN_ROLE,
  RECEPTION_ROLE,
  MAINTENANCE_ROLE,
  RESIDENT_ROLE,
] as const;

export type SystemRole = (typeof ROLES)[number];

export interface RoleAttributes {
  id: string;
  name: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleCreationAttributes
  extends Omit<RoleAttributes, "id" | "createdAt" | "updatedAt"> {}