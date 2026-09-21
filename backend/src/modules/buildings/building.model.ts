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

interface BuildingCreationAttributes {
  name: string;
  address: string;
  city: string;
  state: string;
  numberOfFloors: number;
  numberOfUnits: number;
  zipCode?: string | null;
  description?: string | null;
  isActive?: boolean;
}

@Table({
  tableName: "buildings",
  timestamps: true,
  underscored: true,
})
export class Building extends Model<
  Building,
  BuildingCreationAttributes> {
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
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: "number_of_floors",
  })
  numberOfFloors!: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    field: "number_of_units",
  })
  numberOfUnits!: number;

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
