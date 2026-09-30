import "reflect-metadata";
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

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "REJECTED";

export interface ReservationAttributes {
  id: string;
  buildingId: string;
  commonAreaId: string;
  unitId: string;
  requestedByUserId: string;
  startAt: Date;
  endAt: Date;
  status: ReservationStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReservationCreationAttributes = Optional<
  ReservationAttributes,
  "id" | "status" | "notes" | "createdAt" | "updatedAt"
>;

@Table({
  tableName: "reservations",
  timestamps: true,
  underscored: true,
})
export class Reservation
  extends Model<ReservationAttributes, ReservationCreationAttributes>
  implements ReservationAttributes
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
  declare commonAreaId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare unitId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare requestedByUserId: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare startAt: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare endAt: Date;

  @AllowNull(false)
  @Default("PENDING")
  @Column(DataType.STRING(20))
  declare status: ReservationStatus;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare notes: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
