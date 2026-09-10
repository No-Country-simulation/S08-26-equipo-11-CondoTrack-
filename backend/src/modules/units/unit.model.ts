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
  UpdatedAt,
} from "sequelize-typescript";

@Table({
  tableName: "units",
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ["building_id", "unit_number"],
    },
  ],
})
export class Unit extends Model<Unit> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  building_id!: string; //solo campo, sin relacion Sequelize

  @AllowNull(false)
  @Column(DataType.STRING(20))
  unit_number!: string; //string porque puede ser 101, 2A, PB, PH, LOCAL-01, TORRE-A-302 etcetc

  @AllowNull(true)
  @Column(DataType.INTEGER)
  floor!: number | null;

  @AllowNull(true)
  @Column(DataType.STRING(50))
  type!: string | null;

  @AllowNull(true)
  @Column(DataType.DECIMAL(10, 2))
  area_m2!: number | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description!: string | null;

  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;
}
