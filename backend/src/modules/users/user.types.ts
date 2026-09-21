export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string | null;
  documentNumber: string | null;
  email: string;
  phone: string | null;
  passwordHash: string | null;
  googleId: string | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Omit<UserAttributes, "id" | "createdAt" | "updatedAt"> {}