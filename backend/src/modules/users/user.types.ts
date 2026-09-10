export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface UserAttributes {
  id: number;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  passwordHash: string;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Omit<UserAttributes, "id" | "createdAt" | "updatedAt"> {}