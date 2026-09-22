import { Op, WhereOptions } from "sequelize";

import { Unit, UnitAttributes, UnitCreationAttributes } from "./unit.model.js";

export interface UnitListFilters {
  code?: string;
  floor?: number;
  unitType?: string;
  isActive?: boolean;
}

export const createUnit = async (
  data: UnitCreationAttributes,
): Promise<Unit> => {
  return Unit.create(data);
};

export const findUnitByCode = async (
  buildingId: string,
  code: string,
): Promise<Unit | null> => {
  return Unit.findOne({
    where: {
      buildingId,
      code,
    },
  });
};

export const countActiveUnitsByBuilding = async (
  buildingId: string,
): Promise<number> => {
  return Unit.count({
    where: {
      buildingId,
      isActive: true,
    },
  });
};

export const getUnitsByBuilding = async (
  buildingId: string,
  filters: UnitListFilters,
  limit: number,
  offset: number,
) => {
  const where: WhereOptions<UnitAttributes> = {
    buildingId,
  };

  if (filters.code) {
    where.code = {
      [Op.iLike]: `%${filters.code}%`,
    };
  }

  if (filters.floor !== undefined) {
    where.floor = filters.floor;
  }

  if (filters.unitType) {
    where.unitType = filters.unitType.toUpperCase();
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return Unit.findAndCountAll({
    where,
    limit,
    offset,
    order: [
      ["floor", "ASC"],
      ["code", "ASC"],
    ],
  });
};
