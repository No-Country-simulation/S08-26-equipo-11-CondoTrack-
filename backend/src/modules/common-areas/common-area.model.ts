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

export interface CommonAreaAttributes {
  id: string;
  buildingId: string;
  name: string;
  description: string | null;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CommonAreaCreationAttributes = Optional<
  CommonAreaAttributes,
  "id" | "description" | "isActive" | "createdAt" | "updatedAt"
>;

@Table({
  tableName: "common_areas",
  timestamps: true,
  underscored: true,
})
export class CommonArea
  extends Model<CommonAreaAttributes, CommonAreaCreationAttributes>
  implements CommonAreaAttributes
{
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare buildingId: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare capacity: number;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
