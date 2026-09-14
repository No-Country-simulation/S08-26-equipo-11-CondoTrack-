import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
} from "sequelize-typescript";

import { RoleAttributes, RoleCreationAttributes } from "./role.types.js";

@Table({
  tableName: "roles",
  timestamps: true,
  underscored: true,
})
export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(50))
  declare name: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare description: string | null;
}