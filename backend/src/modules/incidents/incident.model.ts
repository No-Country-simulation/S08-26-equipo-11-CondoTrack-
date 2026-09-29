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

export const INCIDENT_SEVERITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const INCIDENT_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface IncidentAttributes {
  id: string;
  buildingId: string;
  unitId: string;
  reportedByUserId: string;
  assignedToPersonId: string | null;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IncidentCreationAttributes = Optional<
  IncidentAttributes,
  | "id"
  | "assignedToPersonId"
  | "status"
  | "resolvedAt"
  | "createdAt"
  | "updatedAt"
>;

@Table({
  tableName: "incidents",
  timestamps: true,
  underscored: true,
})
export class Incident
  extends Model<IncidentAttributes, IncidentCreationAttributes>
  implements IncidentAttributes
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
  declare reportedByUserId: string;

  @AllowNull(true)
  @Column(DataType.UUID)
  declare assignedToPersonId: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(150))
  declare title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare severity: IncidentSeverity;

  @AllowNull(false)
  @Default("OPEN")
  @Column(DataType.STRING(20))
  declare status: IncidentStatus;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare resolvedAt: Date | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default Incident;
