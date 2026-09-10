export interface UserBuildingRoleAttributes {
  userId: number;
  buildingId: number;
  roleId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserBuildingRoleCreationAttributes
  extends Omit<UserBuildingRoleAttributes, "createdAt" | "updatedAt"> {}