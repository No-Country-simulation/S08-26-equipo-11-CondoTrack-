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

import {
  UserAttributes,
  UserCreationAttributes,
  UserStatus,
} from "./user.types.js";

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

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare lastName: string;

  @AllowNull(false)
  @Column(DataType.STRING(30))
  declare documentType: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(50))
  declare documentNumber: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(150))
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING(30))
  declare phone: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare passwordHash: string;

  @AllowNull(false)
  @Default("ACTIVE")
  @Column(DataType.STRING(20))
  declare status: UserStatus;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare lastLoginAt: Date | null;
}