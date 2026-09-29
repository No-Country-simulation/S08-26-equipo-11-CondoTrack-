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

export const CARRIERS = [
  "Mercado Libre",
  "Correo Argentino",
  "Andreani",
  "OCA",
  "DHL",
  "Otro",
] as const;

export const DELIVERY_STATUSES = [
  "RECEIVED",
  "NOTIFIED",
  "PICKED_UP",
  "RETURNED",
  "LOST",
] as const;

export type Carrier = (typeof CARRIERS)[number];
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface DeliveryAttributes {
  id: string;
  buildingId: string;
  unitId: string;
  recipientPersonId: string;
  receivedByUserId: string;
  pickedUpByUserId: string | null;
  carrier: Carrier;
  trackingNumber: string | null;
  status: DeliveryStatus;
  receivedAt: Date;
  notifiedAt: Date | null;
  pickedUpAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type DeliveryCreationAttributes = Optional<
  DeliveryAttributes,
  | "id"
  | "pickedUpByUserId"
  | "trackingNumber"
  | "status"
  | "receivedAt"
  | "notifiedAt"
  | "pickedUpAt"
  | "createdAt"
  | "updatedAt"
>;

@Table({
  tableName: "deliveries",
  timestamps: true,
  underscored: true,
})
export class Delivery
  extends Model<DeliveryAttributes, DeliveryCreationAttributes>
  implements DeliveryAttributes
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
  declare recipientPersonId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare receivedByUserId: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare pickedUpByUserId: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(30))
  declare carrier: Carrier;

  @AllowNull(true)
  @Column(DataType.STRING(100))
  declare trackingNumber: string | null;

  @AllowNull(false)
  @Default("RECEIVED")
  @Column(DataType.STRING(20))
  declare status: DeliveryStatus;

  @AllowNull(false)
  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare receivedAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare notifiedAt: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare pickedUpAt: Date | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
