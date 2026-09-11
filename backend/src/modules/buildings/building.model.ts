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
  tableName: "buildings",
  timestamps: true,
  underscored: true,
})
export class Building extends Model<Building> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  address!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  city!: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  state!: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  zipCode!: string | null; //porque puede ser null si el edificio no tiene codigo postal

  @AllowNull(true)
  @Column(DataType.TEXT)
  description!: string | null;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean; //el edifcio puede ser activo o inactivo, sin borrarlo de DB

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
