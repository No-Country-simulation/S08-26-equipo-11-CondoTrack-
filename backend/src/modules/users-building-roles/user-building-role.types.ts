export interface UserBuildingRoleAttributes {
  userId: number;
  buildingId: string;
  roleId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserBuildingRoleCreationAttributes
  extends Omit<UserBuildingRoleAttributes, "createdAt" | "updatedAt"> {}