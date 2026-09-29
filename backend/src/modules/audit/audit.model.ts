import "reflect-metadata";
import { Optional } from "sequelize";
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  CreatedAt,
} from "sequelize-typescript";

export interface AuditLogAttributes {
  id: string;
  buildingId: string | null;
  unitId: string | null;
  performedBy: string | null;
  action: string;
  tableName: string;
  recordId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface AuditLogCreationAttributes extends Optional<
  AuditLogAttributes,
  "id" | "createdAt"
> {}

@Table({
  tableName: "audit_logs",
  timestamps: true,
  updatedAt: false,
  underscored: true,
  indexes: [
    { fields: ["performed_by"] },
    { fields: ["table_name", "record_id"] },
    { fields: ["created_at"] },
  ],
})
export class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare buildingId: string | null;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare unitId: string | null;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare performedBy: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare action: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare tableName: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare recordId: string | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare oldValues: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare newValues: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.INET)
  declare ipAddress: string | null;

  @CreatedAt
  declare createdAt: Date;
}
