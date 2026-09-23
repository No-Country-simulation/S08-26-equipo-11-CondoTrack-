import AppError from "../../utils/AppError.js";
import { Building } from "../buildings/building.model.js";
import { CreateUnitDto } from "./dto/create-unit.dto.js";
import { ListUnitsDto } from "./dto/list-units.dto.js";
import {
  countActiveUnitsByBuilding,
  createUnit,
  findUnitByCode,
  getUnitsByBuilding,
} from "./unit.repository.js";

export class UnitService {
  async create(buildingId: string, dto: CreateUnitDto) {
    const building = await Building.findByPk(buildingId);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    if (!building.isActive) {
      throw new AppError(
        "No se pueden crear unidades en un edificio inactivo",
        400,
      );
    }

    const existingUnit = await findUnitByCode(buildingId, dto.code);

    if (existingUnit) {
      throw new AppError(
        "Ya existe una unidad con ese código en el edificio",
        409,
      );
    }

    const currentUnits = await countActiveUnitsByBuilding(buildingId);

    if (currentUnits >= building.numberOfUnits) {
      throw new AppError(
        "El edificio alcanzó la cantidad máxima de unidades",
        409,
      );
    }

    return createUnit({
      buildingId,
      code: dto.code,
      floor: dto.floor,
      unitType: dto.unitType,
      description: dto.description ?? null,
      isActive: true,
    });
  }

  async listByBuilding(buildingId: string, filters: ListUnitsDto) {
    const building = await Building.findByPk(buildingId);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    const offset = (filters.page - 1) * filters.limit;

    const result = await getUnitsByBuilding(
      buildingId,
      {
        code: filters.code,
        floor: filters.floor,
        unitType: filters.unitType,
        isActive: filters.isActive,
      },
      filters.limit,
      offset,
    );

    return {
      units: result.rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.count,
        totalPages: Math.ceil(result.count / filters.limit),
      },
    };
  }
}
