import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  ForeignKey,
} from "sequelize-typescript";

import {
  UserAttributes,
  UserCreationAttributes,
  UserStatus,
} from "./user.types.js";
import People from "../people/people.model.js";

@Table({
  tableName: "users",
  timestamps: true,
  underscored: true,
})
export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(true)
  @Unique
  @ForeignKey(() => People)
  @Column(DataType.UUID)
  declare personId: string | null;

  declare person?: People | null;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(150))
  declare email: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare passwordHash: string | null;

  @AllowNull(true)
  @Unique
  @Column(DataType.STRING(255))
  declare googleId: string | null;

  @AllowNull(false)
  @Default("ACTIVE")
  @Column(DataType.STRING(20))
  declare status: UserStatus;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare lastLoginAt: Date | null;
}
