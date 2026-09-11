import "reflect-metadata";
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

@Table({
  tableName: "audit_logs",
  timestamps: true,
  updatedAt: false,
  underscored: true,
  indexes: [
    {
      fields: ["performed_by"],
    },
    {
      fields: ["table_name", "record_id"],
    },
    {
      fields: ["created_at"],
    },
  ],
})
export class AuditLog extends Model<AuditLog> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  buildingId!: string | null;

  @AllowNull(true)
  @Column(DataType.UUID)
  unitId!: string | null;

  @AllowNull(true)
  @Column(DataType.UUID)
  performedBy!: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  action!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  tableName!: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  recordId!: string | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  oldValues!: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  newValues!: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.INET)
  ipAddress!: string | null;

  @CreatedAt
  createdAt!: Date;
}