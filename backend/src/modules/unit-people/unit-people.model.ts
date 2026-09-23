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

export interface UnitPeopleAttributes {
  id: string;
  unitId: string;
  personId: string;
  relationshipType: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitPeopleCreationAttributes extends Optional<
  UnitPeopleAttributes,
  "id" | "startDate" | "endDate" | "createdAt" | "updatedAt"
> {}

@Table({
  tableName: "unit_people",
  timestamps: true,
  underscored: true,
})
export class UnitPeople
  extends Model<UnitPeopleAttributes, UnitPeopleCreationAttributes>
  implements UnitPeopleAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare unitId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare personId: string;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare relationshipType: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare startDate: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare endDate: Date | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default UnitPeople;
