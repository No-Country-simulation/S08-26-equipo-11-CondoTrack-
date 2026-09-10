export interface RoleAttributes {
  id: number;
  name: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleCreationAttributes
  extends Omit<RoleAttributes, "id" | "createdAt" | "updatedAt"> {}
