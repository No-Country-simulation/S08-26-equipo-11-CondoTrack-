export interface UserBuildingRoleAttributes {
  id: string;
  userId: string;
  roleId: string;
  buildingId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserBuildingRoleCreationAttributes
  extends Omit<UserBuildingRoleAttributes, "id" | "createdAt" | "updatedAt"> {}