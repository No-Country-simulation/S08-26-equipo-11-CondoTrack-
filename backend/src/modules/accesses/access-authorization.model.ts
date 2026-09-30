import { Optional } from "sequelize";
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

export interface AccessAuthorizationAttributes {
  id: string;
  buildingId: string;
  unitId: string;
  visitorId: string;
  authorizedByUserId: string;
  validFrom: Date;
  validUntil: Date | null;
  status: string;
  qrTokenHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessAuthorizationCreationAttributes extends Optional<
  AccessAuthorizationAttributes,
  "id" | "validUntil" | "status" | "createdAt" | "updatedAt"
> {}

@Table({
  tableName: "access_authorizations",
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ["qr_token_hash"],
    },
  ],
})
export class AccessAuthorization
  extends Model<AccessAuthorizationAttributes, AccessAuthorizationCreationAttributes>
  implements AccessAuthorizationAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare buildingId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare unitId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare visitorId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare authorizedByUserId: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare validFrom: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare validUntil: Date | null;

  @AllowNull(false)
  @Default("PENDING")
  @Column(DataType.STRING(20))
  declare status: string;

  // SHA-256 en hexadecimal: nunca se guarda el token utilizable
  @AllowNull(false)
  @Column(DataType.STRING(64))
  declare qrTokenHash: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default AccessAuthorization;