import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  BelongsToMany,
} from "sequelize-typescript";

import { RoleAttributes, RoleCreationAttributes } from "./role.types.js";
import { User } from "../users/user.model.js";
import { UserBuildingRole } from "../users-building-roles/user-building-role.model.js";

@Table({
  tableName: "roles",
  timestamps: true,
})
export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(50))
  declare name: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare description: string | null;

  @BelongsToMany(() => User, () => UserBuildingRole)
  declare users: User[];
}