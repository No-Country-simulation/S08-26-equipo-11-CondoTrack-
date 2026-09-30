import { Optional } from "sequelize";
import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

import { AccessAuthorization } from "./access-authorization.model.js";
import { Building } from "../buildings/building.model.js";
import { Person } from "../people/people.model.js";
import { Unit } from "../units/unit.model.js";
import { User } from "../users/user.model.js";

// Valores admitidos en las columnas de texto del evento.
export const ACCESS_EVENT_TYPE = {
  ENTRY: "ENTRY",
  EXIT: "EXIT",
} as const;

export const ACCESS_METHOD = {
  QR: "QR",
  MANUAL: "MANUAL",
} as const;

export type AccessEventType =
  (typeof ACCESS_EVENT_TYPE)[keyof typeof ACCESS_EVENT_TYPE];

export type AccessMethod = (typeof ACCESS_METHOD)[keyof typeof ACCESS_METHOD];

export interface AccessEventAttributes {
  id: string;
  buildingId: string;
  unitId: string;
  visitorId: string;
  authorizationId: string | null;
  registeredByUserId: string;
  eventType: AccessEventType;
  accessMethod: AccessMethod;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessEventCreationAttributes extends Optional<
  AccessEventAttributes,
  "id" | "authorizationId" | "createdAt" | "updatedAt"
> {}

@Table({
  tableName: "access_events",
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: "access_events_authorization_event_index",
      fields: ["authorization_id", "event_type"],
    },
  ],
})
export class AccessEvent
  extends Model<AccessEventAttributes, AccessEventCreationAttributes>
  implements AccessEventAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @ForeignKey(() => Building)
  @Column(DataType.UUID)
  declare buildingId: string;

  @AllowNull(false)
  @ForeignKey(() => Unit)
  @Column(DataType.UUID)
  declare unitId: string;

  @AllowNull(false)
  @ForeignKey(() => Person)
  @Column(DataType.UUID)
  declare visitorId: string;

  @AllowNull(true)
  @ForeignKey(() => AccessAuthorization)
  @Column(DataType.UUID)
  declare authorizationId: string | null;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare registeredByUserId: string;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare eventType: AccessEventType;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare accessMethod: AccessMethod;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare occurredAt: Date;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default AccessEvent;
