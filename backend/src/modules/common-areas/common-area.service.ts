import AppError from "../../utils/AppError.js";
import { CreateCommonAreaDto } from "./common-area.dto.js";
import { CommonAreaRepository } from "./common-area.repository.js";

export class CommonAreaService {
  constructor(private readonly repository: CommonAreaRepository) {}

  async create(buildingId: string, dto: CreateCommonAreaDto) {
    const building = await this.repository.findBuilding(buildingId);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    if (!building.isActive) {
      throw new AppError("El edificio está inactivo", 400);
    }

    return this.repository.create(buildingId, dto);
  }

  async list(buildingId: string) {
    const building = await this.repository.findBuilding(buildingId);

    if (!building) {
      throw new AppError("Edificio no encontrado", 404);
    }

    return this.repository.list(buildingId);
  }
}
