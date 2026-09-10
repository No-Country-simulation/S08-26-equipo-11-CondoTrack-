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
      fields: ["user_id"],
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
  user_id!: string | null; //solo campo sin relacion Sequelize

  @AllowNull(false)
  @Column(DataType.STRING(50))
  action!: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  table_name!: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  record_id!: string | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  old_values!: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  new_values!: Record<string, unknown> | null;

  @AllowNull(true)
  @Column(DataType.INET)
  ip_address!: string | null;

  @CreatedAt
  created_at!: Date;
}
