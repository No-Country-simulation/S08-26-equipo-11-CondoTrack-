import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

import {
  UserBuildingRoleAttributes,
  UserBuildingRoleCreationAttributes,
} from "./user-building-role.types.js";

@Table({
  tableName: "users_buildings_roles",
  timestamps: true,
  underscored: true,
})
export class UserBuildingRole extends Model<
  UserBuildingRoleAttributes,
  UserBuildingRoleCreationAttributes
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare userId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare roleId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare buildingId: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}