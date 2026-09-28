export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface UserAttributes {
  id: string;
  personId: string | null;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Omit<
  UserAttributes,
  "id" | "personId" | "createdAt" | "updatedAt"
> {
  personId?: string | null;
}

export interface UserListScope {
  buildingId?: string;
  roleId?: string;
}
