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

export interface PersonAttributes {
  id: string;
  firstName: string;
  lastName: string;
  documentType: string | null;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// funcion central (junto con UnitPeople) es responder: quien habita o es dueño de que unidad? y permite que cualquier persona con vinculo al conjunto, tenga o no cuenta

export interface PersonCreationAttributes extends Optional<
  PersonAttributes,
  "id" | "createdAt" | "updatedAt"
> {}

@Table({
  tableName: "people",
  timestamps: true,
  underscored: true,
})
export class Person
  extends Model<PersonAttributes, PersonCreationAttributes>
  implements PersonAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare lastName: string;

  @AllowNull(true)
  @Column(DataType.STRING(30))
  declare documentType: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(50))
  declare documentNumber: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(150))
  declare email: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(30))
  declare phone: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default Person;
