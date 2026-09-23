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

export interface UnitAttributes {
  id: string;
  buildingId: string;
  code: string;
  floor: number;
  unitType: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitCreationAttributes extends Optional<
  UnitAttributes,
  "id" | "description" | "isActive" | "createdAt" | "updatedAt"
> {}

@Table({
  tableName: "units",
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ["building_id", "code"],
    },
  ],
})
export class Unit
  extends Model<UnitAttributes, UnitCreationAttributes>
  implements UnitAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare buildingId: string;

  @AllowNull(false)
  @Column(DataType.STRING(20))
  declare code: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare floor: number;

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare unitType: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
