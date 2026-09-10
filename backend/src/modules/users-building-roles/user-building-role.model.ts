import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
} from "sequelize-typescript";

import {
  UserBuildingRoleAttributes,
  UserBuildingRoleCreationAttributes,
} from "./user-building-role.types.js";

import { User } from "../users/user.model.js";
import { Role } from "../roles/role.model.js";
// import { Building } from "../buildings/building.model.js";

@Table({
  tableName: "users_buildings_roles",
  timestamps: true,
})
export class UserBuildingRole extends Model<UserBuildingRoleAttributes> {
  @PrimaryKey
  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare userId: number;

  @PrimaryKey
  @ForeignKey(() => Role)
  @Column(DataType.INTEGER)
  declare roleId: number;

  // @PrimaryKey
  // @ForeignKey(() => Building)
  // @Column(DataType.INTEGER)
  // declare buildingId: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Role)
  declare role: Role;

  // @BelongsTo(() => Building)
  // declare building: Building;
}